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
  admin: ChatServerAdmin;
  ban: ChatServerBan;
} & ChatEventData;

export type ChatClientEventData = {
  message: ChatClientMessage;
  leave: string;
  join: string;
} & ChatEventData;

export type ChatRole = 'user' | 'admin' | 'owner' | 'server';

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

export type ChatServerAdmin = ChatAdmin & {
  on: boolean;
};

export type ChatBan = {
  room: string;
  user: string;
};

export type ChatServerBan = ChatBan & {
  on: boolean;
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
