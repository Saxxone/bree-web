import type { User } from "./user";
import type { MediaType } from "./types";

export interface Chat {
  toUserId?: string | Partial<User>;
  fromUserId?: string | Partial<User>;
  createdAt?: string;
  text?: ArrayBuffer | string;
  media: string | null | undefined;
  mediaType?: MediaType;
  read: boolean;
  id: string | null | undefined;
  updatedAt?: string;
  deletedAt?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
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
  createdAt: string;
  user: User;
}
