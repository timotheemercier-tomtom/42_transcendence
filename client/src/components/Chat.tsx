import { Button, TextField } from '@mui/material';
import {
  ChatClientEventData,
  ChatClientMessage,
  ChatEventType,
  ChatServerEventData,
  ChatServerMessage,
} from 'common';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import Col from './Col';
import Row from './Row';
import { getCookie } from '../util';

class State {
  constructor() {}
}

export default function Chat({ id }: { id: string }) {
  const socket = useRef<Socket | null>(null);
  const [msgs, setMsgs] = useState(new Map<string, ChatServerMessage[]>());
  const [input, setInput] = useState<string>('');
  const [rooms, setRooms] = useState(new Set<string>());
  const [room, setRoom] = useState(id);
  const user = sessionStorage.getItem('user') ?? '';

  const send = <EventType extends ChatEventType>(
    ev: EventType,
    data: ChatClientEventData[EventType],
  ) => {
    socket.current!.emit(ev, data);
  };

  const recv = <EventType extends ChatEventType>(
    ev: EventType,
    cb: (data: ChatServerEventData[EventType]) => void,
  ) => {
    socket.current!.on(ev, cb as never);
  };

  useEffect(() => {
    setRoom(id);
  }, [id]);

  useEffect(() => {
    const sock = io('http://localhost:3000/chat/ws', {
      transports: ['websocket'],
      query: {
        // TODO : get from context?
        token: getCookie('accessToken'),
      },
    });
    socket.current = sock;
    const user = sessionStorage.getItem('user') ?? '';

    recv('message', (e) => {
      setMsgs((v) => new Map(v.set(e.room, [...(v.get(e.room) ?? []), e])));
    });

    recv('join', (e) => {
      if (e.user == user) setRooms((v) => new Set(v.add(e.room)));
    });

    recv('leave', (e) => {
      if (e.user == user) {
        if (e.room == room) {
          setRoom('');
        }
        setRooms((v) => (v.delete(e.room), new Set(v)));
      }
    });

    return () => {
      sock.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket.current) return;
    console.log('UGLY HACK');

    const sock = socket.current;
    const f = () => {
      sock.emit('join', room);
    };
    sock.on('connect', f);
    return () => {
      sock.off('connect', f);
    };
  }, [room]);

  const cmdre = /^\/(owner|admin|pass|ban|kick|mute|join|leave)(.*)/;

  const handleCommand = (input: string) => {
    const m = input.match(cmdre);
    if (!m) return false;
    const args = m[2].trim().split(' ');
    const arg1 = args.length > 0 ? args[0] : '';
    switch (m[1]) {
      case 'owner':
      case 'admin':
      case 'kick':
      case 'ban':
        if (arg1) send(m[1], { user: arg1, room });
        break;
      case 'pass':
        if (arg1) send(m[1], { pass: arg1, room });
        break;
      case 'mute':
        if (args.length > 1)
          send(m[1], {
            date: new Date().getTime() + parseInt(args[1]) * 1000,
            user: arg1,
            room,
          });
        break;
      case 'join':
        if (arg1) send(m[1], arg1);
        break;
      case 'leave':
        send(m[1], room);
        break;
    }
    return true;
  };

  const handleInput = (): void => {
    if (socket && input.trim()) {
      if (handleCommand(input)) return;
      const msg: ChatClientMessage = { msg: input, room };
      send('message', msg);
      setInput('');
    }
  };

  return (
    <Row border={1} flexGrow={1}>
      <Col flexGrow={1}>
        <h3>
          {user}@{room}
        </h3>
        <Col flexGrow={1} overflow={'scroll'}>
          {msgs.get(room)?.map((v, i) => (
            <div key={i}>
              <Link to={'/u/' + v.user}>
                <span>{v.user}</span>
              </Link>
              : <span key={i}>{v.msg}</span>
            </div>
          ))}
        </Col>
        <Row>
          <TextField
            value={input}
            fullWidth
            variant="standard"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInput()}
          />
          <Button onClick={handleInput}>Send</Button>
        </Row>
      </Col>
      <Col borderLeft={1}>
        {Array.from(rooms.values()).map((v) => (
          <Button key={v} onClick={() => setRoom(v)}>
            {v}
          </Button>
        ))}
      </Col>
    </Row>
  );
}
