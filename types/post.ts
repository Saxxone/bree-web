import type { User } from "~/types/user";

export interface Post {
  id: string;
  date: Date;
  text?: string;
  user: Partial<User>;
  img?: string;
}
