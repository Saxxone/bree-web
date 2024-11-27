import type { User } from "./user";
import type { ISO8601DateString, MediaType } from "./types";

export interface Chat {
  toUserId?: string | Partial<User>;
  fromUserId?: string | Partial<User>;
  createdAt: ISO8601DateString | null;
  text?: ArrayBuffer | string;
  media: string | null | undefined;
  mediaType?: MediaType;
  read: boolean;
  id: string | null | undefined;
  updatedAt: ISO8601DateString | null;
  deletedAt: ISO8601DateString | null;
  deletedBy?: Partial<User>;
  deletedByMe?: boolean;
  room?: Room;
  roomId: string;
  senderEncryptedMessage?: ArrayBuffer;
  receiverEncryptedMessage?: ArrayBuffer;
  userEncryptedMessages?: UserEncryptedMessage[];
}

export interface Room {
  id: string;
  participants: User[];
  createdAt: ISO8601DateString | null;
  updatedAt: ISO8601DateString | null;
  chats: Chat[];
  name: string | null | undefined;
  media: string | null | undefined;
  mediaType?: MediaType;
}

export interface UserEncryptedMessage {
  id: string;
  chatId: string;
  userId: string;
  encryptedMessage: string;
  createdAt: ISO8601DateString | null;
  user: User;
}
