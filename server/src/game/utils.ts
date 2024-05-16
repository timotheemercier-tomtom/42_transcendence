import { GameEventData } from './GameCommon';

type frame = GameEventData['frame'];

// PLACEHOLDER physics:
// Todo: check boundaries, speed etc.
// required inputs: keypresses and current frame + attributes like frame dimensions
export function calcNewFrame(currFrame: frame, keyUp: boolean, keydown: boolean): frame
{
  let newframe: frame = currFrame;
  if (newframe.b.p.x > 15)
      newframe.b.p.x = currFrame.b.p.x - 10;
  if (keyUp && !keydown) {
    newframe.pa -= 10;
  }
  if (keydown && !keyUp) {
    newframe.pa += 10;
  }
  return (newframe);
}
