import { createRef, useEffect, useState } from 'react';
import GameClient from '../GameClient';
import Col from './Col';
import { getLogin } from '../util';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { GameEventData, GameState } from '../GameCommon';
import { socket } from '../game.socket';

const GC = new GameClient();

const Game = () => {
  const { id } = useParams(); // this is the room ID!
  const cr = createRef<HTMLCanvasElement>();
  const gameId: string = id!;
  const userId: string = getLogin();
  const [gameStateString, setGameStateStr] = useState('waiting for players');
  const [gameState, setGameState] = useState(GameState.WaitingForPlayers);

  useEffect(() => {
    const ctx = cr.current?.getContext('2d');
    if (!ctx) return;
    GC.load(ctx, getLogin(), id!);
  }, [cr, id]);

  useEffect(() => {
    const onmessage = (e: GameEventData['game_state']) => {
      setGameState(e);
      console.log('game event data (component!)', e);
      if (e == GameState.WaitingForPlayers)
        setGameStateStr('waiting for players');
      if (e == GameState.ReadyToStart) setGameStateStr('ready to start');
      if (e == GameState.Running) setGameStateStr('running');
      if (e == GameState.Finished) setGameStateStr('finished');
    };

    socket.on('game_state', onmessage);
    return () => {
      console.log('removing listeneres');
      socket.off('game_state', onmessage);
    };
  }, [id]);

  return (
    <Col>
      <Button
        disabled={gameState != GameState.ReadyToStart}
        onClick={() => GC.start()}
      >
        Start Game!
      </Button>
      <Button onClick={() => GC.joinAnon()}>Join Anon</Button>
      <span>userId: {userId}</span>
      <span>gameId: {gameId}</span>
      <span>gameState: {gameStateString}</span>
      <canvas ref={cr} width={GameClient.W} height={GameClient.H}></canvas>
    </Col>
  );
};

export default Game;
