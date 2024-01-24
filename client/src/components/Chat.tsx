import { Button, TextField } from '@mui/material';
import {
  ChatClientEventData,
  ChatClientMessage,
  ChatEventType,
  ChatServerEventData,
  ChatServerMessage,
} from 'common';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { socket } from '../chat.socket';
import Col from './Col';
import Row from './Row';

export default function Chat({ id }: { id: string }) {
  const [msgs, setMsgs] = useState(new Map<string, ChatServerMessage[]>());
  const [input, setInput] = useState<string>('');
  const [rooms, setRooms] = useState(new Set<string>());
  const [public_, setPublic] = useState<string[]>([]);
  const [room, setRoom] = useState(id);
  const [badd, setBadd] = useState(false);
  const [pass, setPass] = useState('');
  const [dms, setDms] = useState<string[]>([]);
  const [block, setBlock] = useState(new Set<string>());

  let user = sessionStorage.getItem('user') ?? '';
  if (user.startsWith('$')) user = '$anon' + user;
  const [sev, setSev] = useState<[string, never][]>([]);
  const unload = () => {
    sev.forEach((v) => socket.off(v[0], v[1]));
  };

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
      // console.log(sev);
      unload();
    };
  }, []);

  useEffect(() => {
    socket.on('connect', recvs);
    return () => {
      socket.off('connect', recvs);
    };
  });

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
      const n = new Map(v);
      const a = [...(n.get(e.room) || []), e as never];
      n.set(e.room, a);
      return n;
    });
    console.log(msgs);
  };

  useEffect(() => {
    const msgsEl = document.querySelector('#msgs');

    Array.from(msgsEl?.children ?? [])
      .at(-1)
      ?.scrollIntoView();
  });

  const recvs = () => {
    console.log('recvs');

    send('join', { room, pass: '' });

    recv('message', (e) => {
      pushmsg(e);
    });

    recv('list', (e) => {
      setPublic(e);
    });

    recv('dms', (e) => {
      setDms(e);
    });

    recv('join', (e) => {
      setRooms((v) => new Set(v).add(e));
      console.log(rooms);
    });

    recv('leave', (e) => {
      if (e == room) setRoom('');
      setRooms((v) => {
        const n = new Set(v);
        n.delete(e);
        return n;
      });
    });
  };

  const cmdre =
    /^\/(owner|admin|pass|ban|kick|mute|join|leave|public|dm|block)(.*)/;

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
        if (arg1) send(m[1], { pass: args[1], room: arg1 });
        break;
      case 'public':
      case 'leave':
        send(m[1], room);
        break;
      case 'dm':
        if (arg1) send(m[1], arg1);
        break;
      case 'block':
        if (arg1) setBlock((v) => new Set(v).add(arg1));
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

  const tbad = () => {
    setBadd(!badd);
    if (badd) {
      send('list', []);
    }
  };

  const getcolor = (v: ChatServerMessage): string => {
    return { admin: 'red', owner: 'purple', server: 'grey', user: 'white' }[
      v.role
    ];
  };

  const joinRoom = (e: string) => {
    send('join', { room: e, pass });
  };

  const Message = ({ v }: { v: ChatServerMessage }) => {
    return (
      <Row color={getcolor(v)} gap={'.5rem'}>
        <span color="grey">{new Date(v.date).toLocaleTimeString()}</span>
        {v.role == 'server' ? (
          <span>{v.user}</span>
        ) : (
          <Link to={'/u/' + v.user}>
            <span>{v.user}</span>
          </Link>
        )}
        <span>{v.msg}</span>
      </Row>
    );
  };

  return (
    <Row border={1} flexGrow={1}>
      <Col flexGrow={1} padding={'.5rem'}>
        <h3>
          {user}@{room}
        </h3>
        <Col flexGrow={1} overflow={'scroll'} id="msgs">
          {msgs
            .get(room)
            ?.filter((v) => !block.has(v.user))
            .map((v, i) => <Message key={i} v={v} />)}
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
        {!badd ? (
          <Button onClick={tbad}>+ ADD +</Button>
        ) : (
          <React.Fragment>
            <Button onClick={tbad}>BACK</Button>
            <TextField
              fullWidth
              variant="standard"
              placeholder="password"
              onChange={(e) => setPass(e.target.value)}
            ></TextField>
          </React.Fragment>
        )}
        {!badd ? (
          <Col>
            {dms.map((v, i) => (
              <Button key={i} onClick={() => setRoom('+' + v)}>
                {v}
              </Button>
            ))}
            {Array.from(rooms.values()).map((v, i) => (
              <Button key={i} onClick={() => setRoom(v)}>
                {v}
              </Button>
            ))}
          </Col>
        ) : (
          public_.map((v, i) => (
            <Button key={i} onClick={() => joinRoom(v)}>
              {v}
            </Button>
          ))
        )}
      </Col>
    </Row>
  );
}
