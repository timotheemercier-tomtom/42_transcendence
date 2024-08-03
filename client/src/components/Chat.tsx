import { Button, TextField } from '@mui/material';
import {
  ChatClientEventData,
  ChatClientMessage,
  ChatEventType,
  ChatServerEventData,
  ChatServerMessage,
  User,
} from 'common';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API, getLogin } from '../util';
import Col from './Col';
import Row from './Row';
import { socket } from '../chat.socket';

export default function Chat({ id }: { id: string }) {
  const [msgs, setMsgs] = useState(new Map<string, ChatServerMessage[]>());
  const [input, setInput] = useState<string>('');
  const [rooms, setRooms] = useState(new Set<string>());
  const [public_, setPublic] = useState<string[]>([]);
  const [room, setRoom] = useState(id);
  const [badd, setBadd] = useState(false);
  const [pass, setPass] = useState('');
  const [dms, setDms] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [block, setBlock] = useState(new Set<string>());
  const [showHelp, setShowHelp] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const nav = useNavigate();
  const user = getLogin();

  useEffect(() => {
    socket.connect();
    const getFriends = async () => {
      const res = await fetch(API + `/user/${user}/friends`, {
        credentials: 'include',
      });
      const data = await res.json();
      setFriends(data);
    };
    getFriends();
    const send = <EventType extends ChatEventType>(
      ev: EventType,
      data: ChatClientEventData[EventType],
    ) => {
      socket.emit(ev, data);
    };
    if (socket.connected) {
      send('join', { room: id, pass: '' });
      send('rooms', user);
    }
  }, [id, user]);

  useEffect(() => {
    console.log('adding listeneres');

    const onmessage = (e: ChatServerEventData['message']) => {
      console.log('push', e);

      setMsgs((v) => {
        const n = new Map(v);
        const a = [...(n.get(e.room) || []), e as never];
        n.set(e.room, a);
        return n;
      });
    };
    const send = <EventType extends ChatEventType>(
      ev: EventType,
      data: ChatClientEventData[EventType],
    ) => {
      socket.emit(ev, data);
    };
    const onconnect = () => {
      send('join', { room, pass: '' });
      send('rooms', user);
    };

    const onjoin = (e: ChatServerEventData['join']) => {
      setRooms((v) => new Set(v).add(e));
    };

    const onleave = (e: ChatServerEventData['leave']) => {
      if (e == room) setRoom('');
      setRooms((v) => {
        const n = new Set(v);
        n.delete(e);
        return n;
      });
    };

    socket.on('connect', onconnect);
    socket.on('message', onmessage);
    socket.on('list', setPublic);
    socket.on('rooms', setRooms);
    socket.on('dms', setDms);
    socket.on('join', onjoin);
    socket.on('error', setError);
    socket.on('leave', onleave);

    return () => {
      console.log('removing listeneres');

      socket.off('connect', onconnect);
      socket.off('message', onmessage);
      socket.off('list', setPublic);
      socket.off('dms', setDms);
      socket.off('join', onjoin);
      socket.off('rooms', setRooms);
      socket.off('error', setError);
      socket.off('leave', onleave);
    };
  }, [room, user]);

  useEffect(() => {
    setRoom(id);
  }, [id]);

  useEffect(() => {
    const msgsEl = document.querySelector('#msgs');

    Array.from(msgsEl?.children ?? [])
      .at(-1)
      ?.scrollIntoView();
  });

  const cmdre =
    /^\/(help|joingame|owner|admin|pass|ban|kick|mute|join|leave|public|dm|block)(.*)/;

  const cmdinfo = {
    help: 'toggle this help message',
    joingame: 'join the game with the same name as this chat channel',
    owner: 'set the owner to user arg1',
    admin: 'toggle admin on user arg1',
    pass: 'set the password of this room to arg1',
    kick: 'kick user arg1 from this room',
    ban: 'ban user arg1 from this room',
    mute: 'mute user arg1 in this room for arg2 seconds',
    join: 'join room arg1 with optional password arg2',
    public: 'toggle public flag of this room',
    leave: 'leave this room',
    dm: 'open a direct message to user arg1',
    block: 'block a user arg1',
  };

  const send = <EventType extends ChatEventType>(
    ev: EventType,
    data: ChatClientEventData[EventType],
  ) => {
    socket.emit(ev, data);
  };

  const handleCommand = (input: string) => {
    const m = input.match(cmdre);
    if (!m) return false;
    const args = m[2].trim().split(' ');
    const arg1 = args.length > 0 ? args[0] : '';
    switch (m[1]) {
      case 'help':
        setShowHelp(!showHelp);
        break;
      case 'owner':
      case 'admin':
      case 'kick':
      case 'ban':
        if (arg1) send(m[1], { user: arg1, room });
        break;
      case 'pass':
        if (arg1) send(m[1], { pass: arg1, room });
        else send(m[1], { pass: '', room });
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
      case 'joingame':
        nav('/r/' + room);
        break;
    }
    setInput('');
    setError('');
    return true;
  };

  const handleInput = (): void => {
    if (socket && input.trim()) {
      if (handleCommand(input)) return;
      const msg: ChatClientMessage = { msg: input, room };
      send('message', msg);
      setInput('');
      setError('');
    }
  };

  const tbad = () => {
    if (!badd) {
      send('list', []);
    }
    setBadd(!badd);
  };

  const getcolor = (v: ChatServerMessage): string => {
    return { admin: 'red', owner: 'purple', server: 'orange', user: 'black' }[
      v.role
    ];
  };

  const joinRoom = (e: string) => {
    send('join', { room: e, pass });
  };

  const invite = (u: User) => {
    send('dm', u.login);
    send('message', { msg: 'invite ' + id, room: '+' + u.login });
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
        <Col>
          <span color="red">{error}</span>
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
        {showHelp && (
          <Col>
            <span>Help:</span>
            <span>format: /command arg1 arg2</span>
            {Object.entries(cmdinfo).map(([k, v]) => (
              <span>
                /{k}: {v}
              </span>
            ))}
          </Col>
        )}
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
      {friends.length == 0 ? null : (
        <Col borderLeft={1}>
          <span>Invite</span>
          {friends.map((v) => (
            <Button onClick={() => invite(v)}>{v.login}</Button>
          ))}
        </Col>
      )}
    </Row>
  );
}
