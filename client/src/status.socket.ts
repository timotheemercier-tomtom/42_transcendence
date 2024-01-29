import { io } from 'socket.io-client';
import { getCookie } from './util';

const wsurl = 'http://localhost:3000/status/ws';

const user = sessionStorage.getItem('user') ?? '';

const query = user.startsWith('$')
  ? { anon: '$anon' + user }
  : { token: getCookie('accessToken') ?? '' };

export const socket = io(wsurl, {
  query,
  autoConnect: false,
  transports: ['websocket'],
});
