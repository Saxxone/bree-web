export interface User {
  id: number;
  name: string;
  email: string;
  img: string;
  password?: string;
  username: string;
  refreshToken? : string;
  token? : string;
}
