export interface User {
  id: string;
  name: string;
  email: string;
  banner?: string;
  verified: boolean;
  img?: string;
  bio?: string;
  password?: string;
  username: string;
  refresh_token?: string;
  access_token?: string;
}

export interface Author extends User {}
