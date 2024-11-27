import type { ISO8601DateString } from "./types";

export interface User {
  id: string;
  name: string;
  email: string;
  banner: string | null | undefined;
  verified: boolean;
  img: string | null | undefined;
  bio: string | null | undefined;
  password?: string;
  username: string;
  refresh_token?: string;
  access_token?: string;
  publicKey: JsonWebKey | string;
  createdAt: ISO8601DateString | null;
  updatedAt: ISO8601DateString | null;
  deletedAt: ISO8601DateString | null;
  roomId: string;
}

export interface Author extends User, Record<string, unknown> {}
