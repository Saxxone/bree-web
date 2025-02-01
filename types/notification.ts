import type { DateString } from "./types";
import type { Author } from "./user";

export interface Notification {
  id: string;
  date: DateString | null;
  author?: Author;
  description: string;
  trigger?: unknown;
}

// interface Trigger {
//   img: string;
//   name: string;
// }
