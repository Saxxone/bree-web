/**
 * Worker ↔ main-thread message shapes. The worker keeps all private key
 * material; the main thread only ever deals with ciphertext + public keys +
 * the string fingerprint used in the security UI.
 */

export interface OlmSignedKey {
  keyId: string;
  publicKey: string;
  signature: string;
}

export interface DeviceBundle {
  identityKeyCurve25519: string;
  identityKeyEd25519: string;
  oneTimeKeys: OlmSignedKey[];
  fallbackKey: OlmSignedKey;
}

export interface EncryptRequest {
  recipientDeviceId: string;
  recipientIdentityKeyCurve25519: string;
  recipientIdentityKeyEd25519: string;
  /** Prekey used to bootstrap a fresh Olm session (omit after the session
   *  has received its first inbound message). */
  signedPrekey?: { keyId: string; publicKey: string; signature: string };
  plaintext: string;
}

export interface EncryptedEnvelope {
  recipientDeviceId: string;
  ciphertext: string;
  messageType: 0 | 1;
}

export interface DecryptRequest {
  senderDeviceId: string;
  senderIdentityKeyCurve25519: string;
  ciphertext: string;
  messageType: 0 | 1;
}

export type RpcRequest =
  | { kind: "init" }
  | { kind: "registerDevice"; label: string; oneTimeKeyCount: number }
  | { kind: "generateOtks"; count: number }
  | { kind: "rotateFallbackKey" }
  | { kind: "markOtksPublished" }
  | { kind: "encrypt"; req: EncryptRequest }
  | { kind: "decrypt"; req: DecryptRequest }
  | { kind: "fingerprint" }
  | { kind: "wipe" };

export type RpcResponse =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

export interface RpcEnvelope {
  id: number;
  request: RpcRequest;
}

export interface RpcReply {
  id: number;
  response: RpcResponse;
}
