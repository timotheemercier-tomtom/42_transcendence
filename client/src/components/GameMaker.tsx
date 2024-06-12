import { Button } from '@mui/material';
import Row from './Row';
import Col from './Col';
import { useEffect } from 'react';
import { socket } from '../game.socket';
import { GameEventData } from '../GameCommon';
import { getLogin } from '../util';
import { useNavigate } from 'react-router-dom';
import { randomUUID } from 'crypto';

const GameMaker = () => {
  const userId = getLogin();
  const nav = useNavigate();

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const onjoin_game_room = (ug: GameEventData['join_game_room']) => {
      if (ug.userId == userId) nav('/r/' + ug.gameId);
    };
    const oncreate = (createMsg: GameEventData['create']) => {
      socket.emit('join_game_room', {
        userId: createMsg.userId,
        gameId: createMsg.gameId,
      });
      socket.emit('join', {
        userId: createMsg.userId,
        gameId: createMsg.gameId,
      });
    };
    socket.on('join_game_room', onjoin_game_room);
    socket.on('create', oncreate);
    return () => {
      socket.off('join_game_room', onjoin_game_room);
      socket.off('create', oncreate);
    };
  }, []);

  return (
    <>
      <Row alignItems={'center'} gap={'1rem'}>
        <Col>
          <Button
            onClick={() =>
              socket.emit('create', {
                userId: userId,
                gameId: 'game-' + randomUUID(),
                isPublic: false,
              })
            }
          >
            Play PONG with a friend!
          </Button>
        </Col>
      </Row>
      <Row alignItems={'center'} gap={'1rem'}>
        <Col>
          <Button onClick={() => socket.emit('enque', userId)}>
            Play PONG with a random opponent!
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default GameMaker;
