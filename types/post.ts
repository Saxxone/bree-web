import type { Author, User } from "~/types/user";
import type { DateString, MediaType } from "~/types/types";

/** Parallel to `media` / `mediaPlayback` / `mediaTypes` from the post API. */
export interface PostMediaMetadata {
  fileId: string;
  sizeBytes: number;
  mimeType: string;
  originalFilename: string;
  requiresAuth: boolean;
  /** From API: monetized post, viewer has not unlocked — do not load `media` as a fallback URL. */
  paywalled?: boolean;
}

export interface Post {
  id: string;
  createdAt: DateString | null;
  updatedAt: DateString | null;
  text?: string | null;
  author: Partial<Author>;
  published: boolean;
  authorId: string;
  media: string[] | File[];
  /** Streaming URLs for video/audio; parallel to `media` / `mediaTypes`. */
  mediaPlayback?: string[];
  mediaMetadata?: PostMediaMetadata[];
  /** May be omitted when the API only sends `mediaMetadata[].mimeType` per item. */
  mediaTypes?: MediaType[];
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
  /** When true, post is eligible for coin monetization UI. */
  monetizationEnabled?: boolean;
  /** Smallest currency unit for unlock price; null if metadata could not be derived. */
  pricedCostMinor?: number | null;
  /** Stream quality label from probe (e.g. resolution), when available. */
  sourceStreamQuality?: string | null;
  /** Embedded quoted post from the API, if any. */
  quotedPost?: Post | null;
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
  mediaPlayback?: string[];
  mediaMetadata?: PostMediaMetadata[];
  mediaTypes?: MediaType[];
}
