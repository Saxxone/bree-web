import type { DateString } from "./types";
import type { Author } from "./user";

export interface Notification {
  id: string;
  date: DateString | null;
  /** Present when the server includes actor info (e.g. SSE payload). */
  author?: Author;
  description: string;
  trigger?: unknown;
  /** Server read flag; treat missing as unread until synced. */
  read?: boolean;
  /** Root or target post for likes, mentions, etc. */
  postId?: string | null;
  /** Reply post id for comment notifications. */
  commentId?: string | null;
  /** Prisma `NotificationType` string when known. */
  notificationType?: string;
}

// interface Trigger {
//   img: string;
//   name: string;
// }
