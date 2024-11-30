import type { Author, User } from "~/types/user";
import type { DateString, MediaType } from "~/types/types";

export interface Post {
  id: string;
  createdAt: DateString | null;
  updatedAt: DateString | null;
  text?: string | null;
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
  parentId?: string | null;
  parent?: Post;
  type: PostType;
  longPost: Partial<LongPost> | null | undefined;
  longPostId?: string | null;
  deletedAt: DateString | null;
}

export type PostType = "LONG" | "SHORT";

export interface LongPost {
  id?: string | null;
  content: Partial<LongPostBlock>[];
  author?: Partial<Author>;
  authorId?: string | null;
}

export interface LongPostBlock {
  id?: string | null;
  longPostId?: string | null;
  text: string;
  media: string[];
  mediaTypes?: MediaType[];
}
