export interface JwtPayload {
  isTwoFAenable?: boolean;
  login: string;
  isTwoFAauth?: boolean;
}
