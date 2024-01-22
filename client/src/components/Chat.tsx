import { Button, TextField } from '@mui/material';
import {
  ChatClientEventData,
  ChatClientMessage,
  ChatEventType,
  ChatServerEventData,
  ChatServerMessage,
} from 'common';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { socket } from '../chat.socket';
import Col from './Col';
import Row from './Row';

export default function Chat({ id }: { id: string }) {
  const [msgs, setMsgs] = useState(new Map<string, ChatServerMessage[]>());
  const [input, setInput] = useState<string>('');
  const [rooms, setRooms] = useState(new Set<string>());
  const [room, setRoom] = useState(id);
  const user = sessionStorage.getItem('user') ?? '';
  const [sev, setSev] = useState<[string, never][]>([]);

  useEffect(() => {
    socket.connect();
    socket.on('connect', recvs);
    setMsgs(new Map());

    return () => {
      socket.disconnect();
      socket.off('connect', recvs);
      console.log(sev);
      sev.forEach((v) => socket.off(v[0], v[1]));
    };
  }, []);

  const send = <EventType extends ChatEventType>(
    ev: EventType,
    data: ChatClientEventData[EventType],
  ) => {
    socket.emit(ev, data);
  };

  const recv = <EventType extends ChatEventType>(
    ev: EventType,
    cb: (data: ChatServerEventData[EventType]) => void,
  ) => {
    setSev((v) => [...v, [ev, cb as never]]);
    socket.on(ev, cb as never);
  };

  useEffect(() => {
    setRoom(id);
  }, [id]);

  const pushmsg = (e: ChatServerMessage) => {
    console.log('push', e);

    setMsgs((v) => {
      const a = [...(v.get(e.room) || []), e as never];
      v.set(e.room, a);
      return new Map(v);
    });
  };

  const pushServerMsg = (room: string, msg: string) => {
    pushmsg({
      room: room,
      date: new Date().getTime(),
      role: 'server',
      user: '$server',
      msg: msg,
    });
  };

  const recvs = () => {
    console.log('recvs');

    socket.emit('join', room);

    recv('message', (e) => {
      pushmsg(e);
    });

    recv('join', (e) => {
      if (e.user == user) setRooms((v) => new Set(v.add(e.room)));
      pushServerMsg(e.room, `+ ${e.user}`);
      console.log('joined');
    });

    recv('leave', (e) => {
      if (e.user == user) {
        if (e.room == room) {
          setRoom('');
        }
        setRooms((v) => (v.delete(e.room), new Set(v)));
      }
      pushServerMsg(e.room, `- ${e.user}`);
    });

    recv('kick', (e) => {
      pushServerMsg(e.room, `kicked ${e.user}`);
    });

    recv('ban', (e) => {
      pushServerMsg(e.room, `${e.on ? 'banned' : 'unbanned'} ${e.user}`);
    });

    recv('mute', (e) => {
      pushServerMsg(
        e.room,
        `muted ${e.user} until ${new Date(e.date).toLocaleString()}`,
      );
    });

    recv('admin', (e) => {
      pushServerMsg(e.room, `${e.user} ${e.on ? 'gained' : 'lost'} adminship`);
    });

    recv('owner', (e) => {
      pushServerMsg(e.room, `${e.user} became owner`);
    });
  };

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
    setInput('');
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

  const getcolor = (v: ChatServerMessage): string => {
    return { admin: 'red', owner: 'purple', server: 'grey', user: 'white' }[
      v.role
    ];
  };

  const Message = ({ v }: { v: ChatServerMessage }) => {
    return (
      <Row color={getcolor(v)}>
        {v.role == 'server' ? (
          <span>{v.user}</span>
        ) : (
          <Link to={'/u/' + v.user}>
            <span>{v.user}</span>
          </Link>
        )}
        <span>: {v.msg}</span>
      </Row>
    );
  };

  return (
    <Row border={1} flexGrow={1}>
      <Col flexGrow={1}>
        <h3>
          {user}@{room}
        </h3>
        <Col flexGrow={1} overflow={'scroll'}>
          {msgs.get(room)?.map((v, i) => <Message key={i} v={v} />)}
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
