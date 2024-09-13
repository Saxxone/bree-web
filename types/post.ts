import type { User } from "~/types/user";

export interface Post {
  id: number;
  title: string;
  text: string;
  user: User;
  img?: string;
}
