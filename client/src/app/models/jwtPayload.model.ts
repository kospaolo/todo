export interface JwtPayload {
  userId: number;
  username: string;
  exp: number;
  iat: number;
}
