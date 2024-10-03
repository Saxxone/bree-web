import type { Author } from "./user";

export interface Notification {
  id: string;
  date: string;
  author?: Author;
  description: string;
  trigger?: Trigger;
}

interface Trigger {
  img: string;
  name: string;
}
