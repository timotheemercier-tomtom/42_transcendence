import { useRef, useEffect, useState } from 'react';
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
  const cr = useRef<HTMLCanvasElement>(null);
  const gameId: string = id!;
  const userId: string = getLogin();
  const [gameStateString, setGameStateStr] = useState('loading game');
  const [gameState, setGameState] = useState(GameState.WaitingForPlayers);
  const [playerA, setPlayerA] = useState<string | undefined>(undefined);
  const [playerB, setPlayerB] = useState<string | undefined>(undefined);
  const [spectators, setSpectators] = useState<string | undefined>(undefined);

  useEffect(() => {
    const ctx = cr.current?.getContext('2d');
    if (!ctx) return;
    GC.load(ctx, getLogin(), id!);
  }, [cr, id]);

  useEffect(() => {
    const onStateChange = (e: GameEventData['game_state']) => {
      setGameState(e.gameState);
      setPlayerA(e.playerA);
      setPlayerB(e.playerB);
      setSpectators([...e.spectators].join(', '));
      if (e.gameState == GameState.WaitingForPlayers)
        setGameStateStr('waiting for players');
      if (e.gameState == GameState.ReadyToStart)
        setGameStateStr('ready to start');
      if (e.gameState == GameState.Running) setGameStateStr('running');
      if (e.gameState == GameState.Finished) setGameStateStr('finished');
    };

    // request state, to sync after page load
    socket.on('game_state', onStateChange);
    socket.emit('request_game_state', gameId);
    return () => {
      socket.off('game_state', onStateChange);
    };
  }, [id]);

  return (
    <Col>
      <Button
        disabled={
          gameState != GameState.WaitingForPlayers ||
          playerA == userId ||
          playerB == userId
        }
        onClick={() => GC.join()}
      >
        Join Game!
      </Button>
      <Button
        disabled={playerA != userId && playerB != userId}
        onClick={() => GC.leave()}
      >
        Leave Game!
      </Button>
      <Button
        disabled={
          gameState != GameState.ReadyToStart ||
          (playerA != userId && playerB != userId)
        }
        onClick={() => GC.start()}
      >
        Start Game!
      </Button>
      <span>userId: {userId}</span>
      <span>gameId: {gameId}</span>
      <span>gameState: {gameStateString}</span>
      <span>player A: {playerA}</span>
      <span>player B: {playerB}</span>
      <span>People in the room: {spectators}</span>
      <canvas ref={cr} width={GameClient.W} height={GameClient.H}></canvas>
    </Col>
  );
};

export default Game;
