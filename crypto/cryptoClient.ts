/**
 * Main-thread client for `cryptoWorker.ts`. Exposes a narrow, typed API to
 * the rest of the app — there is no way to reach into the worker to extract
 * private keys or raw Olm state.
 *
 * The worker is launched lazily on first use. Call `wipe()` on logout so the
 * worker's in-memory Olm account is freed and its IndexedDB blobs are deleted.
 */

import type {
  DecryptRequest,
  DeviceBundle,
  EncryptRequest,
  EncryptedEnvelope,
  OlmSignedKey,
  RpcEnvelope,
  RpcReply,
  RpcRequest,
} from "./protocol";

interface PendingRequest {
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
}

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, PendingRequest>();

function getWorker(): Worker {
  if (worker) return worker;
  if (typeof window === "undefined") {
    throw new Error("Crypto worker requires a browser environment");
  }
  worker = new Worker(new URL("./cryptoWorker.ts", import.meta.url), {
    type: "module",
    name: "afovid-olm",
  });
  worker.addEventListener("message", (evt: MessageEvent<RpcReply>) => {
    const reply = evt.data;
    const entry = pending.get(reply.id);
    if (!entry) return;
    pending.delete(reply.id);
    if (reply.response.ok) {
      entry.resolve(reply.response.value);
    } else {
      entry.reject(new Error(reply.response.error));
    }
  });
  worker.addEventListener("error", (evt) => {
    // Flush every in-flight request with a rejection so callers do not hang
    // forever on a crashed worker.
    for (const { reject } of pending.values()) {
      reject(new Error(evt.message || "Crypto worker crashed"));
    }
    pending.clear();
  });
  return worker;
}

function rpc<T>(request: RpcRequest): Promise<T> {
  const w = getWorker();
  const id = nextId++;
  const env: RpcEnvelope = { id, request };
  return new Promise<T>((resolve, reject) => {
    pending.set(id, {
      resolve: (v) => resolve(v as T),
      reject,
    });
    w.postMessage(env);
  });
}

export async function initCrypto(): Promise<void> {
  await rpc<boolean>({ kind: "init" });
}

export function registerDevice(
  label: string,
  oneTimeKeyCount = 100,
): Promise<DeviceBundle & { label: string }> {
  return rpc({ kind: "registerDevice", label, oneTimeKeyCount });
}

export function generateOtks(count: number): Promise<OlmSignedKey[]> {
  return rpc({ kind: "generateOtks", count });
}

export function rotateFallbackKey(): Promise<OlmSignedKey> {
  return rpc({ kind: "rotateFallbackKey" });
}

export function markOtksPublished(): Promise<void> {
  return rpc({ kind: "markOtksPublished" });
}

export function encrypt(req: EncryptRequest): Promise<EncryptedEnvelope> {
  return rpc({ kind: "encrypt", req });
}

export function decrypt(req: DecryptRequest): Promise<string> {
  return rpc({ kind: "decrypt", req });
}

export function fingerprint(): Promise<{
  identityKeyCurve25519: string;
  identityKeyEd25519: string;
}> {
  return rpc({ kind: "fingerprint" });
}

/**
 * Destroy all cryptographic state: the Olm account, sessions, pickle key, and
 * the IndexedDB master CryptoKey. Also terminates the worker so a subsequent
 * caller gets a fresh process. Intended for the logout flow only.
 */
export async function wipeCrypto(): Promise<void> {
  try {
    if (worker) {
      await rpc<boolean>({ kind: "wipe" });
    }
  } catch {
    // ignore — we're about to terminate the worker anyway
  } finally {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    for (const { reject } of pending.values()) {
      reject(new Error("Crypto worker terminated"));
    }
    pending.clear();
  }
}
