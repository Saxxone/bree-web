import type { Author, User } from "~/types/user";
import type { MediaType } from "~/types/types";

export interface Post {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  text?: string;
  author: Author;
  media: string[] | File[];
  mediaTypes: MediaType[];
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

export type PostStyle = "long" | "short";
