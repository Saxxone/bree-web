export interface User {
  id: number;
  name: string;
  email: string;
  img: string;
  password?: string;
  username: string;
  refresh_token? : string;
  access_token? : string;
}
