import { Friend } from "./friend.entity";

export interface User {
    id: number;
    login: string;
    displayName: string;
    picture?: string;
    won: number;
    lost: number;
    twoFASecret?: string;
    isTwoFAEnabled: boolean;
    friends: Friend[];
  }
  