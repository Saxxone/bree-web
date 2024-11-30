import type { User } from "./user";
import type { DateString, MediaType } from "./types";

export interface Chat {
  toUserId?: string | Partial<User>;
  fromUserId?: string | Partial<User>;
  createdAt: DateString | null;
  text?: ArrayBuffer | string;
  media: string | null | undefined;
  mediaType?: MediaType;
  read: boolean;
  id: string | null | undefined;
  updatedAt: DateString | null;
  deletedAt: DateString | null;
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
  createdAt: DateString | null;
  updatedAt: DateString | null;
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
  createdAt: DateString | null;
  user: User;
}
