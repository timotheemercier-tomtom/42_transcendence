export type ChatEventType =
  | 'message'
  | 'pass'
  | 'owner'
  | 'admin'
  | 'ban'
  | 'kick'
  | 'mute'
  | 'leave'
  | 'join'
  | 'public'
  | 'list';

type ChatEventData = {
  pass: ChatPass;
  owner: ChatOwner;
  admin: ChatAdmin;
  ban: ChatBan;
  kick: ChatKick;
  mute: ChatMute;
  leave: string;
  public: string;
  list: string[];
};

export type ChatServerEventData = {
  message: ChatServerMessage;
  join: string;
} & ChatEventData;

export type ChatClientEventData = {
  message: ChatClientMessage;
  join: ChatJoin;
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

export type ChatJoin = {
  room: string;
  pass: string;
};
