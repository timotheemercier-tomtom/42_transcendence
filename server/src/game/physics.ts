import { GameCommon, GameEventData } from './GameCommon';

type frame = GameEventData['frame'];

function updateBall(frame: frame) : void {
  const paleft: number = GameCommon.PPAD;
  const paright: number = GameCommon.PPAD + GameCommon.PW;
  const pabottom: number = frame.playerA_ypos + GameCommon.PH;
  const patop: number = frame.playerA_ypos;

  const pbleft: number = GameCommon.W - (GameCommon.PPAD + GameCommon.PW);
  const pbright: number = GameCommon.W - GameCommon.PPAD;
  const pbbottom: number = frame.playerB_ypos + GameCommon.PH;
  const pbtop: number = frame.playerB_ypos;

  const bleft: number = frame.ball_xpos - GameCommon.BRAD;
  const bright: number = frame.ball_xpos + GameCommon.BRAD;
  const bbottom: number = frame.ball_ypos + GameCommon.BRAD;
  const btop: number = frame.ball_ypos - GameCommon.BRAD;

  // horizontal bounce

  // vertical bounce (a.k.a 'goal')

  // paddle bounce

  // no bounce

  // dummy code
  if (frame.ball_xpos > 15)
      frame.ball_xpos -= GameCommon.BSPEED;
}

function updatePaddle(frame: frame, keyUp: boolean, keydown: boolean) : void {
  if (keyUp && !keydown) {
    frame.playerA_ypos -= GameCommon.PSPEED;
  }
  if (keydown && !keyUp) {
    frame.playerA_ypos += GameCommon.PSPEED;
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
