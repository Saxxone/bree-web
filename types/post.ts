import type { Author } from "~/types/user";

export interface Post {
  id: string;
  date: Date;
  text?: string;
  author: Author;
  img?: string;
}
