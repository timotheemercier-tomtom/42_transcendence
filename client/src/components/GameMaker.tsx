import { Button, FormLabel, Input } from '@mui/material';
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
  const [paddle, setPaddle] = useState('');
  const [ball, setBall] = useState('');
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const onjoin = (ug: GameEventData['join']) => {
      if (ug.user == user) nav('/r/' + ug.id);
    };
    const oncreate = (ug: GameEventData['create']) => {
      socket.emit('join', ug);
      socket.emit('opt', { id: ug.id, user: { [ug.user]: { paddle, ball } } });
    };
    socket.on('join', onjoin);
    socket.on('create', oncreate);
    return () => {
      socket.off('join', onjoin);
      socket.off('create', oncreate);
    };
  }, [ball, nav, paddle, user]);

  return (
    <Row alignItems={'center'} gap={'1rem'}>
      <Col>
        <FormLabel>
          paddle
          <input
            type="color"
            onChange={(e) => setPaddle(e.target.value)}
          ></input>
        </FormLabel>
        <FormLabel>
          ball
          <input type="color" onChange={(e) => setBall(e.target.value)}></input>
        </FormLabel>
      </Col>
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
