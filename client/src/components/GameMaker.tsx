import { Button } from '@mui/material';
import Row from './Row';
import Col from './Col';
import { useEffect } from 'react';
import { socket } from '../game.socket';
import { GameEventData } from '../GameCommon';
import { getLogin } from '../util';
import { useNavigate } from 'react-router-dom';

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
    const onjoin = (ug: GameEventData['join']) => {
      if (ug.userId == userId) nav('/r/' + ug.gameId);
    };
    const oncreate = (createMsg: GameEventData['create']) => {
      socket.emit('join', {
        userId: createMsg.userId,
        gameId: createMsg.gameId,
      });
    };
    socket.on('join', onjoin);
    socket.on('create', oncreate);
    return () => {
      socket.off('join', onjoin);
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
                gameId: userId + '_game',
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
