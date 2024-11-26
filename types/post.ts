import type { Author, User } from "~/types/user";
import type { MediaType } from "~/types/types";

export interface Post {
  id: string;
  createdAt: string;
  updatedAt: string;
  text: string | null | undefined;
  author: Partial<Author>;
  published: boolean;
  authorId: string;
  media: string[] | File[];
  mediaTypes: MediaType[];
  likedBy: Partial<User>[];
  likedByMe: boolean;
  bookmarkedByMe: boolean;
  bookmarkedBy: User[];
  comments?: Post[];
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  parentId: string | null | undefined;
  parent?: Post;
  type: PostType;
  longPost?: Partial<LongPost> | null | undefined;
  longPostId: string | null | undefined;
  deletedAt: string | null | undefined;
}

export type PostType = "LONG" | "SHORT";

export interface LongPost {
  id: string | null | undefined;
  content: Partial<LongPostBlock>[];
  author?: Partial<Author>;
  authorId: string | null | undefined;
}

export interface LongPostBlock {
  id: string | null | undefined;
  longPostId: string | null | undefined;
  text: string;
  media: string[];
  mediaTypes?: MediaType[];
}
