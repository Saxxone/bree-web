import type { Author, User } from "~/types/user";
import type { DateString, MediaType } from "~/types/types";

export interface PostMediaMetadata {
  fileId: string;
  sizeBytes: number;
  mimeType: string;
  originalFilename: string;
  requiresAuth: boolean;
  /** Video/audio: mirrors post monetization; when false, coin fields are not meaningful for that asset. */
  monetizationEnabled?: boolean;
  /** Video/audio: post-level unlock price (minor coin units) when monetization is on. */
  pricedCostMinor?: number | null;
  /** From API: monetized post, viewer has not unlocked — do not load `media` as a fallback URL. */
  paywalled?: boolean;
  /** API: stored trailer URL prefix when a teaser clip exists. */
  trailerUrl?: string | null;
  /** API: public media URL for the short trailer (may require auth token like main video). */
  trailerPlayback?: string | null;
}

export interface Post {
  id: string;
  createdAt: DateString | null;
  updatedAt: DateString | null;
  text?: string | null;
  author: Partial<Author>;
  published: boolean;
  authorId: string;
  /** Server: file ids; compose may mix ids and pending `File` until upload. */
  media: (string | File)[];
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
  monetizationEnabled?: boolean;
  pricedCostMinor?: number | null;
  sourceStreamQuality?: string | null;
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
  /** Server: ids only; compose may include pending `File` until upload. */
  media: (string | File)[];
  mediaPlayback?: string[];
  mediaMetadata?: PostMediaMetadata[];
  mediaTypes?: MediaType[];
}
