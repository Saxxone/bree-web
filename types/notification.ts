import type { DateString } from "./types";
import type { Author } from "./user";

export interface Notification {
  id: string;
  date: DateString | null;
  author?: Author;
  description: string;
  trigger?: Trigger;
}

interface Trigger {
  img: string;
  name: string;
}
