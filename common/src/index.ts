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

// type ChatEventData = {
//   [K in ChatEventType]: any;
// };

// export type ChatEventData = {
//   message: ChatServerMessage;
//   pass: ChatPass;
//   owner: ChatOwner;
//   admin: ChatAdmin;
// };

export type ChatRole = 'user' | 'admin' | 'owner';

export type ChatClientMessage = {
  room: string;
  msg: string;
};

export type ChatServerMessage = ChatClientMessage & {
  user: string;
  role: ChatRole;
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
