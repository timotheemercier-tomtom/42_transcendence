import { Button } from '@mui/material';
import Row from './Row';
import Col from './Col';
import { useEffect } from 'react';
import { socket } from '../game.socket';
import { GameEventData } from '../GameCommon';
import { getLogin } from '../util';
import { useNavigate } from 'react-router-dom';
import { randomUUID } from '../util';

const GameMaker = () => {
  const userId = getLogin();
  const nav = useNavigate();

  useEffect(() => {
    const onjoin_game_room = (ug: GameEventData['join_game_room']) => {
      if (ug.userId == userId) nav('/r/' + ug.gameId);
    };
    socket.connect();
    socket.on('join_game_room', onjoin_game_room);
    return () => {
      socket.off('join_game_room', onjoin_game_room);
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
