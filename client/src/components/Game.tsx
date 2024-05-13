import { createRef, useEffect } from 'react';
import GameClient from '../GameClient';
import Col from './Col';
import TestComponent from './TestComponent';
import { getLogin } from '../util';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { GameEventData } from '../GameCommon';
import { socket } from '../game.socket';

const GC = new GameClient();

const Game = () => {
  const { id } = useParams();
  const cr = createRef<HTMLCanvasElement>();


  // console.log("----");
  // console.log("GC.gameId", GC.gameId);
  // console.log("(user?)id", id);

  useEffect(() => {
    const ctx = cr.current?.getContext('2d');
    if (!ctx) return;
    GC.load(ctx, getLogin(), id!);
  }, [cr, id]);

  useEffect(() => {
    const onframe = (frameReceived: GameEventData['frame']) => {
      console.log("frame received", frameReceived);
    };
    socket.on('frame', onframe);
    return () => {
      socket.off('frame', onframe);
    };
  }, []);

  return (
    <Col>
      <Button onClick={() => GC.start()}>Start</Button>
      <Button onClick={() => GC.joinAnon()}>Join Anon</Button>
      {/* passing a json object */}
      {/* <TestComponent myObj={{gameId: "abcd", userId: {id}}}/> */}
      <TestComponent myObj={{gameId: GC.gameId, userId: {id}}}/>

      <canvas ref={cr} width={GameClient.W} height={GameClient.H}></canvas>
    </Col>
  );
};

export default Game;
