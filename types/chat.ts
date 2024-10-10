import type { User } from "./user";
import type { MediaType } from "./post";

export interface Chat {
  to: Partial<User>;
  from: Partial<User>;
  createdAt: Date;
  text: string;
  media: string;
  mediaType: MediaType;
  read: boolean;
  id: string;
  updatedAt: Date;
  deletedAt: boolean;
  deletedBy: Partial<User>;
  deletedByMe: boolean;
}
