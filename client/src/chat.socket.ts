import { io } from 'socket.io-client';
import { API, getCookie } from './util';

const wsurl = API + '/chat/ws';

const query = { token: getCookie('accessToken') ?? '' };

export const socket = io(wsurl, {
  query,
  autoConnect: false,
  transports: ['websocket'],
});
