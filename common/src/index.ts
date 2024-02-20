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
  | 'list'
  | 'dm'
  | 'dms'
  | 'error';

type ChatEventData = {
  pass: ChatPass;
  owner: ChatRoomUser;
  admin: ChatRoomUser;
  ban: ChatRoomUser;
  kick: ChatRoomUser;
  mute: ChatMute;
  leave: string;
  public: string;
  list: string[];
  dm: string;
  dms: string[];
  error: string;
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

export type ChatRoomUser = {
  room: string;
  user: string;
};

export type ChatPass = {
  room: string;
  pass: string;
};

export type ChatMute = {
  room: string;
  user: string;
  date: number;
};

export type ChatJoin = {
  room: string;
  pass: string;
};

export type User = {
  id: number;

  login: string;

  username: string;

  picture: string;

  won: number;

  lost: number;

  rank: number;

  friends: User[];
};

export type StatusEventType = 'state' | 'list';
export type StatusType = 'offline' | 'online' | 'in-game';
export type StatusState = [string, StatusType];
export type StatusList = StatusState[];

export type V2 = {
  x: number;
  y: number;
};
