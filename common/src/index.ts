export type ChatRole = 'user' | 'admin';

export type PMessage = {
  msg: string;
  room: string;
  user: string;
  role: ChatRole;
};
