import { GameCommon, GameEventData } from './GameCommon';

type frame = GameEventData['frame'];

function updateBall(frame: frame) : void {
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
