import type { Author, User } from "~/types/user";

export interface Post {
  id: string;
  date: Date;
  text?: string;
  author: Author;
  img?: string;
  likedBy: User[];
  bookmarkedBy: User[];
  comments: Post[];
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
}
