import type { Author, User } from "~/types/user";

export interface Post {
  id: string;
  date: Date;
  text?: string;
  author: Author;
  img?: string;
  likedBy: User[];
  likedByMe: boolean;
  bookmarkedByMe: boolean;
  bookmarkedBy: User[];
  comments: Post[];
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  parentId?: string;
  parent?: Post;
}
