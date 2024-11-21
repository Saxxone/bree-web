import type { User } from "./user";
import type { MediaType } from "./types";

export interface Chat {
  toUserId?: string | Partial<User>;
  fromUserId?: string | Partial<User>;
  createdAt?: Date;
  text?: ArrayBuffer | string;
  media?: string;
  mediaType?: MediaType;
  read: boolean;
  id?: string;
  updatedAt?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
  chats: Chat[];
  name?: string;
  media?: string;
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
