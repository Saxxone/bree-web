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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null | undefined;
  roomId: string;
}

export interface Author extends User, Record<string, unknown> {}
