import type { User } from "./user";

export interface Chat {
  sender: Partial<User>;
  receiver: Partial<User>;
  createdAt: Date;
  text: string;
  media: string[];
  mediaTypes: string[];
  read: boolean;
  id: string;
  updatedAt: Date;
  deletedAt: boolean;
  deletedBy: Partial<User>;
  deletedByMe: boolean;
}
