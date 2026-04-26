import type { DateString } from "./types";
import type { DeviceBundle } from "./chat";

export interface User {
  id: string;
  name: string;
  email: string;
  banner?: string | null;
  verified: boolean;
  img?: string | null;
  bio?: string | null;
  password?: string;
  username: string;
  refresh_token?: string;
  access_token?: string;
  createdAt: DateString | null;
  updatedAt: DateString | null;
  deletedAt: DateString | null;
  /** Active Olm devices for this user (populated by room participant endpoints). */
  devices?: DeviceBundle[];
}

export interface Author extends User, Record<string, unknown> {}
