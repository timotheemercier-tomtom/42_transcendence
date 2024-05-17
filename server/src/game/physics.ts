import { GameCommon, GameEventData } from './GameCommon';

type frame = GameEventData['frame'];

function updateBall(frame: frame) : void {
  const paleft: number = GameCommon.PPAD;
  const paright: number = GameCommon.PPAD + GameCommon.PW;
  const pabottom: number = frame.pa + GameCommon.PH;
  const patop: number = frame.pa;

  const pbleft: number = GameCommon.W - (GameCommon.PPAD + GameCommon.PW);
  const pbright: number = GameCommon.W - GameCommon.PPAD;
  const pbbottom: number = frame.pb + GameCommon.PH;
  const pbtop: number = frame.pb;

  const bleft: number = frame.b.p.x - GameCommon.BRAD;
  const bright: number = frame.b.p.x + GameCommon.BRAD;
  const bbottom: number = frame.b.p.y + GameCommon.BRAD;
  const btop: number = frame.b.p.y - GameCommon.BRAD;

  // horizontal bounce

  // vertical bounce (a.k.a 'goal')

  // paddle bounce

  // no bounce

  // dummy code
  if (frame.b.p.x > 15)
      frame.b.p.x -= GameCommon.BSPEED;
}

function updatePaddle(frame: frame, keyUp: boolean, keydown: boolean) : void {
  if (keyUp && !keydown) {
    frame.pa -= GameCommon.PSPEED;
  }
  if (keydown && !keyUp) {
    frame.pa += GameCommon.PSPEED;
  }
}

// PLACEHOLDER physics:
// Todo: check boundaries, speed etc.
// required inputs: keypresses and current frame
export function updateFrame(frame: frame, keyUp: boolean, keydown: boolean): void
{
  updateBall(frame);
  updatePaddle(frame, keyUp, keydown);
}
