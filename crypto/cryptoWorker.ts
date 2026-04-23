/**
 * Dedicated Web Worker that owns all Olm state for the web client.
 *
 * Guarantees enforced here:
 * - The Olm `Account` + per-peer `Session` objects only exist inside this
 *   worker's module scope; they are never structured-cloned out.
 * - Pickled state is persisted encrypted-at-rest under a non-extractable
 *   AES-GCM CryptoKey (see `idbKeystore.ts`).
 * - The only messages the main thread can send are the typed `RpcRequest`
 *   variants below. There is no "dump raw key" operation.
 */

// IMPORTANT: `./olmGlobalShim` must be imported before `@matrix-org/olm`.
// It installs `window` and `OLM_OPTIONS` on the worker's global scope so olm's
// module-load-time browser-vs-Node detection picks the browser branch and
// Vite does not externalise `require("crypto")`.
import "./olmGlobalShim";
import Olm from "@matrix-org/olm";
import olmWasmUrl from "@matrix-org/olm/olm.wasm?url";
import { deleteBlob, getBlob, putBlob, wipeAll } from "./idbKeystore";
import type {
  DecryptRequest,
  DeviceBundle,
  EncryptRequest,
  EncryptedEnvelope,
  OlmSignedKey,
  RpcEnvelope,
  RpcReply,
} from "./protocol";

const PICKLE_ID_ACCOUNT = "account";
const SESSIONS_BLOB_ID = "sessions";

/** Pickle encryption key used by Olm internally. This is stored IN-worker
 *  alongside the pickle blob; the real at-rest encryption is provided by the
 *  AES-GCM CryptoKey on the pickle blob itself. We still use a non-trivial
 *  pickle key so a theoretical attacker who only gets the IDB blob (not the
 *  CryptoKey) has two layers to defeat. */
const PICKLE_KEY_ID = "pickle-key";

interface SessionEntry {
  /** Target device's Curve25519 identity key (used to look up the session). */
  peerIdentityKeyCurve25519: string;
  /** Olm pickled session string. */
  pickle: string;
  /** Whether this session has received at least one inbound message (and
   *  therefore whether subsequent encrypts emit type=1 Message instead of
   *  type=0 PreKeyMessage). */
  established: boolean;
}

let olmInitialized = false;
let account: Olm.Account | null = null;
let pickleKey: string | null = null;
/** In-memory cache of Olm sessions keyed by peer `deviceId`. */
const sessions = new Map<string, Olm.Session>();
/** Parallel metadata (for persistence); kept in lock-step with `sessions`. */
const sessionMeta = new Map<string, SessionEntry>();

async function ensureOlm(): Promise<void> {
  if (olmInitialized) return;
  await Olm.init({ locateFile: () => olmWasmUrl });
  olmInitialized = true;
}

async function ensurePickleKey(): Promise<string> {
  if (pickleKey) return pickleKey;
  const existing = await getBlob(PICKLE_KEY_ID);
  if (existing) {
    pickleKey = existing;
    return pickleKey;
  }
  // 32 random bytes in base64 — the pickle key is opaque text to Olm.
  const raw = crypto.getRandomValues(new Uint8Array(32));
  const b64 = btoa(String.fromCharCode(...raw));
  await putBlob(PICKLE_KEY_ID, b64);
  pickleKey = b64;
  return pickleKey;
}

async function loadAccount(): Promise<Olm.Account | null> {
  await ensureOlm();
  const key = await ensurePickleKey();
  const pickle = await getBlob(PICKLE_ID_ACCOUNT);
  if (!pickle) return null;
  const a = new Olm.Account();
  a.unpickle(key, pickle);
  return a;
}

async function persistAccount(): Promise<void> {
  if (!account) return;
  const key = await ensurePickleKey();
  await putBlob(PICKLE_ID_ACCOUNT, account.pickle(key));
}

async function persistSessions(): Promise<void> {
  const key = await ensurePickleKey();
  const entries: Array<[string, SessionEntry]> = [];
  for (const [deviceId, session] of sessions.entries()) {
    const meta = sessionMeta.get(deviceId);
    if (!meta) continue;
    entries.push([deviceId, { ...meta, pickle: session.pickle(key) }]);
  }
  await putBlob(SESSIONS_BLOB_ID, JSON.stringify(entries));
}

async function loadSessions(): Promise<void> {
  if (sessions.size > 0) return;
  const key = await ensurePickleKey();
  const raw = await getBlob(SESSIONS_BLOB_ID);
  if (!raw) return;
  const entries = JSON.parse(raw) as Array<[string, SessionEntry]>;
  for (const [deviceId, meta] of entries) {
    const s = new Olm.Session();
    try {
      s.unpickle(key, meta.pickle);
      sessions.set(deviceId, s);
      sessionMeta.set(deviceId, meta);
    } catch {
      // Skip corrupt entries rather than failing the whole load.
      s.free();
    }
  }
}

function getIdentityKeys(): { curve25519: string; ed25519: string } {
  if (!account) throw new Error("Device not registered");
  const keys = JSON.parse(account.identity_keys()) as {
    curve25519: string;
    ed25519: string;
  };
  return keys;
}

/**
 * Pull `count` freshly-generated OTKs off the Account as a signed array the
 * server can ingest directly.
 */
function collectSignedOtks(count: number): OlmSignedKey[] {
  if (!account) throw new Error("Device not registered");
  account.generate_one_time_keys(count);
  const blob = JSON.parse(account.one_time_keys()) as {
    curve25519: Record<string, string>;
  };
  const signed: OlmSignedKey[] = [];
  for (const [keyId, publicKey] of Object.entries(blob.curve25519 ?? {})) {
    const signature = account.sign(publicKey);
    signed.push({ keyId, publicKey, signature });
  }
  return signed;
}

function currentFallbackSigned(): OlmSignedKey {
  if (!account) throw new Error("Device not registered");
  account.generate_fallback_key();
  const raw = JSON.parse(account.fallback_key()) as {
    curve25519: Record<string, string>;
  };
  const [keyId, publicKey] = Object.entries(raw.curve25519 ?? {})[0] ?? [];
  if (!keyId || !publicKey) {
    throw new Error("Olm produced no fallback key");
  }
  const signature = account.sign(publicKey);
  return { keyId, publicKey, signature };
}

async function registerDevice(
  label: string,
  oneTimeKeyCount: number,
): Promise<DeviceBundle & { label: string }> {
  await ensureOlm();

  // If an Account is already persisted, reuse it (the caller may be
  // re-registering after a server-side reset). Otherwise create a fresh one
  // so the device gets new identity keys.
  if (!account) {
    account = await loadAccount();
  }
  if (!account) {
    account = new Olm.Account();
    account.create();
  }
  const identity = getIdentityKeys();
  const oneTimeKeys = collectSignedOtks(oneTimeKeyCount);
  account.mark_keys_as_published();
  const fallbackKey = currentFallbackSigned();
  await persistAccount();

  return {
    label,
    identityKeyCurve25519: identity.curve25519,
    identityKeyEd25519: identity.ed25519,
    oneTimeKeys,
    fallbackKey,
  };
}

async function generateOtks(count: number): Promise<OlmSignedKey[]> {
  await ensureOlm();
  if (!account) account = await loadAccount();
  if (!account) throw new Error("Device not registered");
  const otks = collectSignedOtks(count);
  await persistAccount();
  return otks;
}

async function rotateFallbackKey(): Promise<OlmSignedKey> {
  await ensureOlm();
  if (!account) account = await loadAccount();
  if (!account) throw new Error("Device not registered");
  const fb = currentFallbackSigned();
  account.forget_old_fallback_key();
  await persistAccount();
  return fb;
}

async function markOtksPublished(): Promise<void> {
  await ensureOlm();
  if (!account) account = await loadAccount();
  if (!account) return;
  account.mark_keys_as_published();
  await persistAccount();
}

async function encrypt(req: EncryptRequest): Promise<EncryptedEnvelope> {
  await ensureOlm();
  if (!account) account = await loadAccount();
  if (!account) throw new Error("Device not registered");
  await loadSessions();

  let session = sessions.get(req.recipientDeviceId);
  if (!session) {
    if (!req.signedPrekey) {
      throw new Error(
        "No Olm session with recipient and no signedPrekey supplied",
      );
    }
    // Verify the prekey signature under the recipient's Ed25519 identity key
    // before establishing a session. An unverified prekey could be a server
    // substitution attack.
    const utility = new Olm.Utility();
    try {
      utility.ed25519_verify(
        req.recipientIdentityKeyEd25519,
        req.signedPrekey.publicKey,
        req.signedPrekey.signature,
      );
    } finally {
      utility.free();
    }
    const fresh = new Olm.Session();
    fresh.create_outbound(
      account,
      req.recipientIdentityKeyCurve25519,
      req.signedPrekey.publicKey,
    );
    sessions.set(req.recipientDeviceId, fresh);
    sessionMeta.set(req.recipientDeviceId, {
      peerIdentityKeyCurve25519: req.recipientIdentityKeyCurve25519,
      pickle: "",
      established: false,
    });
    session = fresh;
  }

  const { type, body } = session.encrypt(req.plaintext);
  await persistSessions();
  return {
    recipientDeviceId: req.recipientDeviceId,
    ciphertext: body,
    messageType: type,
  };
}

async function decrypt(req: DecryptRequest): Promise<string> {
  await ensureOlm();
  if (!account) account = await loadAccount();
  if (!account) throw new Error("Device not registered");
  await loadSessions();

  let session = sessions.get(req.senderDeviceId);
  if (!session) {
    if (req.messageType !== 0) {
      throw new Error(
        "No session with sender and message is not a PreKey bootstrap",
      );
    }
    const fresh = new Olm.Session();
    fresh.create_inbound_from(
      account,
      req.senderIdentityKeyCurve25519,
      req.ciphertext,
    );
    // Inbound sessions "consume" a one-time key; remove it from the Account
    // so we don't try to reuse it.
    account.remove_one_time_keys(fresh);
    sessions.set(req.senderDeviceId, fresh);
    sessionMeta.set(req.senderDeviceId, {
      peerIdentityKeyCurve25519: req.senderIdentityKeyCurve25519,
      pickle: "",
      established: true,
    });
    session = fresh;
  }

  const plaintext = session.decrypt(req.messageType, req.ciphertext);
  const meta = sessionMeta.get(req.senderDeviceId);
  if (meta && !meta.established) meta.established = true;
  await persistAccount();
  await persistSessions();
  return plaintext;
}

async function fingerprint(): Promise<{
  identityKeyCurve25519: string;
  identityKeyEd25519: string;
}> {
  await ensureOlm();
  if (!account) account = await loadAccount();
  if (!account) throw new Error("Device not registered");
  const ids = getIdentityKeys();
  return {
    identityKeyCurve25519: ids.curve25519,
    identityKeyEd25519: ids.ed25519,
  };
}

async function wipe(): Promise<void> {
  for (const s of sessions.values()) s.free();
  sessions.clear();
  sessionMeta.clear();
  if (account) {
    account.free();
    account = null;
  }
  pickleKey = null;
  await deleteBlob(PICKLE_KEY_ID);
  await deleteBlob(PICKLE_ID_ACCOUNT);
  await deleteBlob(SESSIONS_BLOB_ID);
  await wipeAll();
}

self.addEventListener("message", (evt: MessageEvent<RpcEnvelope>) => {
  const env = evt.data;
  if (!env || typeof env.id !== "number") return;
  void handleRequest(env).then((reply) => {
    (self as unknown as DedicatedWorkerGlobalScope).postMessage(reply);
  });
});

async function handleRequest(env: RpcEnvelope): Promise<RpcReply> {
  try {
    const value = await dispatch(env);
    return { id: env.id, response: { ok: true, value } };
  } catch (err) {
    return {
      id: env.id,
      response: {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

async function dispatch(env: RpcEnvelope): Promise<unknown> {
  const r = env.request;
  switch (r.kind) {
    case "init":
      await ensureOlm();
      await ensurePickleKey();
      return true;
    case "registerDevice":
      return registerDevice(r.label, r.oneTimeKeyCount);
    case "generateOtks":
      return generateOtks(r.count);
    case "rotateFallbackKey":
      return rotateFallbackKey();
    case "markOtksPublished":
      await markOtksPublished();
      return true;
    case "encrypt":
      return encrypt(r.req);
    case "decrypt":
      return decrypt(r.req);
    case "fingerprint":
      return fingerprint();
    case "wipe":
      await wipe();
      return true;
  }
}
