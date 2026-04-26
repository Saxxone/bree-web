import type { User } from "./user";
import type { DateString, MediaType } from "./types";

/**
 * Olm per-device prekey metadata exposed by the server to the client's
 * Web Worker when establishing a new session.
 */
export interface DeviceBundle {
  id: string;
  userId: string;
  label: string;
  identityKeyCurve25519: string;
  identityKeyEd25519: string;
  createdAt?: DateString;
  lastSeenAt?: DateString;
  revokedAt?: DateString | null;
}

export interface ClaimedPrekey {
  deviceId: string;
  identityKeyCurve25519: string;
  identityKeyEd25519: string;
  signedPrekey: {
    keyId: string;
    publicKey: string;
    signature: string;
    isFallback: boolean;
  };
}

export interface ChatEnvelope {
  id: string;
  recipientUserId: string;
  recipientDeviceId: string;
  ciphertext: string;
  messageType: 0 | 1;
  read?: boolean;
  deliveredAt?: DateString | null;
}

export interface Chat {
  id: string;
  roomId: string;
  senderUserId: string;
  senderDeviceId: string;
  senderIdentityKeyCurve25519?: string | null;
  createdAt?: DateString;
  deletedAt?: DateString | null;
  /** Envelopes visible to the calling device (at most one per chat). */
  envelopes?: ChatEnvelope[];
}

export interface Room {
  id: string;
  participants: User[];
  createdAt?: DateString | null;
  updatedAt?: DateString | null;
  chats: Chat[];
  name?: string | null;
  media?: string | null;
  mediaType?: MediaType;
}
