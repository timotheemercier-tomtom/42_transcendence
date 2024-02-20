import { createRef, useEffect } from 'react';
import GameClient from '../GameClient';
import Col from './Col';

const GC = new GameClient();

const Game = () => {
  const cr = createRef<HTMLCanvasElement>();

  useEffect(() => {
    const ctx = cr.current?.getContext('2d');
    if (!ctx) return;
    GC.load(ctx);
  }, [cr]);

  return (
    <Col>
      <canvas ref={cr} width={800} height={600}></canvas>
    </Col>
  );
};

export default Game;
