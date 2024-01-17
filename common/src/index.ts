export type ChatEventType =
  | 'message'
  | 'pass'
  | 'owner'
  | 'admin'
  | 'ban'
  | 'kick'
  | 'mute'
  | 'leave'
  | 'join';

type ChatEventData = {
  pass: ChatPass;
  owner: ChatOwner;
  admin: ChatAdmin;
  ban: ChatBan;
  kick: ChatKick;
  mute: ChatMute;
};

export type ChatServerEventData = {
  message: ChatServerMessage;
  leave: ChatServerLeave;
  join: ChatServerJoin;
} & ChatEventData;

export type ChatClientEventData = {
  message: ChatClientMessage;
  leave: string;
  join: string;
} & ChatEventData;

export type ChatRole = 'user' | 'admin' | 'owner';

export type ChatClientMessage = {
  room: string;
  msg: string;
};

export type ChatServerMessage = ChatClientMessage & {
  user: string;
  role: ChatRole;
  date: number;
};

export type ChatPass = {
  room: string;
  pass: string;
};

export type ChatOwner = {
  room: string;
  user: string;
};

export type ChatAdmin = {
  room: string;
  user: string;
};

export type ChatBan = {
  room: string;
  user: string;
};

export type ChatKick = {
  room: string;
  user: string;
};

export type ChatMute = {
  room: string;
  user: string;
  date: number;
};

export type ChatServerLeave = {
  room: string;
  user: string;
};

export type ChatServerJoin = {
  room: string;
  user: string;
};
