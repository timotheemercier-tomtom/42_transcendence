import { Button, Input } from '@mui/material';
import Row from './Row';
import Col from './Col';
import { useEffect, useState } from 'react';
import { socket } from '../game.socket';
import { GameEventData } from '../GameCommon';
import { getLogin } from '../util';
import { useNavigate } from 'react-router-dom';

const GameMaker = () => {
  const user = getLogin();
  const nav = useNavigate();
  const [id, setId] = useState('');
  useEffect(() => {
    socket.connect();
    const onjoin = (ug: GameEventData['join']) => {
      if (ug.user == user) nav('/r/' + ug.id);
    };
    const oncreate = (ug: GameEventData['create']) => {
      socket.emit('join', ug);
    };
    socket.on('join', onjoin);
    socket.on('create', oncreate);
    return () => {
      socket.off('join', onjoin);
      socket.off('create', oncreate);
      socket.disconnect();
    };
  }, [nav, user]);

  return (
    <Row alignItems={'center'} gap={'1rem'}>
      <Col>
        <Input
          placeholder="game id"
          value={id}
          onChange={(e) => setId(e.target.value)}
        ></Input>
        <Button onClick={() => socket.emit('create', id)}>Create</Button>
      </Col>
      <Col>
        <Button onClick={() => socket.emit('enque', user)}>Enqueue</Button>
      </Col>
    </Row>
  );
};

export default GameMaker;
