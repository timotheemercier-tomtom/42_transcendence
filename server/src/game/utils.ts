import { GameEventData } from './GameCommon';

type frame = GameEventData['frame'];

// PLACEHOLDER physics
// required inputs: keypresses and current frame + attributes like frame dimensions
export function calcNewFrame(currFrame: frame): frame
{
  let newframe: frame = currFrame;
  if (newframe.b.p.x > 15)
      newframe.b.p.x = currFrame.b.p.x - 10;

  return (newframe);
}
