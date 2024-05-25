/*
This module describes the behaviour of the ball and the paddles in the pong game.
Note:
  - point (0, 0) is on the top left of the screen
  - an angle of 0 rad is defined as the ball going downwards on the screen
    (and therefore its y-value is increasing)
*/

import { GameCommon, GameEventData } from './GameCommon';

type frame = GameEventData['frame'];
type paddle = {
  front: number;
  top: number;
  bottom: number;
  maxBallAngleUp: number;
  maxBallAngleDown: number;
};
type keyStatus = { up: boolean; down: boolean };

// NOTE: the "this" of the GameServer object should be bound the function call!
export function updateFrame(
  frame: frame,
  keysA: keyStatus,
  keysB: keyStatus,
): void {
  // Unpause after a second.
  if (this.pausingAfterGoal && Date.now() - this.goalTimeStamp > 1000) {
    this.pausingAfterGoal = false;
  }

  // update ball (except when game is paused)
  let newX: number =
    frame.ballXpos + Math.sin(frame.ballAngle) * GameCommon.BSPEED;
  let newY: number =
    frame.ballYpos + Math.cos(frame.ballAngle) * GameCommon.BSPEED;
  if (
    this.pausingAfterGoal ||
    handleGoal.bind(this)(frame, newX) ||
    handleCeilingOrFloorBounce(frame, newY) ||
    handlePaddleBounce(frame, newX, newY)
  ) {
  } else {
    frame.ballXpos = newX;
    frame.ballYpos = newY;
  }

  // update paddles (also when game is paused)
  if (keysA.up == true) {
    frame.playerA -= GameCommon.PSPEED;
    if (frame.playerA < GameCommon.PPAD) frame.playerA = GameCommon.PPAD;
  }
  if (keysA.down == true) {
    frame.playerA += GameCommon.PSPEED;
    if (frame.playerA > GameCommon.H - GameCommon.PH - GameCommon.PPAD) {
      frame.playerA = GameCommon.H - GameCommon.PH - GameCommon.PPAD;
    }
  }
  if (keysB.up == true) {
    frame.playerB -= GameCommon.PSPEED;
    if (frame.playerB < GameCommon.PPAD) frame.playerB = GameCommon.PPAD;
  }
  if (keysB.down == true) {
    frame.playerB += GameCommon.PSPEED;
    if (frame.playerB > GameCommon.H - GameCommon.PH - GameCommon.PPAD) {
      frame.playerB = GameCommon.H - GameCommon.PH - GameCommon.PPAD;
    }
  }
}

function handleGoal(frame: frame, newX: number): boolean {
  if (
    (newX < GameCommon.BRAD && Math.sin(frame.ballAngle) < 0) ||
    (newX > GameCommon.W - GameCommon.BRAD &&
      Math.sin(frame.ballAngle) > 0)
  ) {
    if (newX < GameCommon.BRAD) {
      frame.scoreB++;
    }
    if (newX > GameCommon.W - GameCommon.BRAD) {
      frame.scoreA++;
    }
    frame.ballXpos = GameCommon.W / 2;
    frame.ballYpos = GameCommon.H / 2;
    frame.ballAngle = 1.5 * Math.PI;
    this.pausingAfterGoal = true;
    this.goalTimeStamp = Date.now();
    console.log('score: ', frame.scoreA, frame.scoreB);
    return true;
  } else {
    return false;
  }
}

function handleCeilingOrFloorBounce(frame: frame, newY: number): boolean {
  if (
    (newY < GameCommon.BRAD && Math.cos(frame.ballAngle) < 0) ||
    (newY > GameCommon.H - GameCommon.BRAD &&
      Math.cos(frame.ballAngle) > 0)
  ) {
    if (newY < GameCommon.BRAD) {
      newY = GameCommon.BRAD;
    }
    if (newY > GameCommon.H - GameCommon.BRAD) {
      newY = GameCommon.H - GameCommon.BRAD;
    }
    frame.ballAngle = calcBallAnlgeAfterBounce(frame.ballAngle);
    frame.ballYpos = newY;
    return true;
  } else {
    return false;
  }
}

function getPaddle(
  frame: frame,
  newX: number,
  newY: number,
): paddle | undefined {
  let paddle: paddle | undefined = undefined;
  if (
    newX <= GameCommon.PPAD + GameCommon.PW + GameCommon.BRAD &&
    newY <= frame.playerA + GameCommon.PH + GameCommon.BRAD &&
    newY >= frame.playerA - GameCommon.BRAD &&
    frame.ballAngle > Math.PI
  ) {
    // ball goes to the left and hits paddle player A
    paddle = {
      front: GameCommon.PPAD + GameCommon.PW + GameCommon.BRAD,
      top: frame.playerA,
      bottom: frame.playerA + GameCommon.PH,
      maxBallAngleUp: 0.9 * Math.PI,
      maxBallAngleDown: 0.1 * Math.PI,
    };
  } else if (
    newX >= GameCommon.W - GameCommon.PPAD - GameCommon.PW - GameCommon.BRAD &&
    newY <= frame.playerB + GameCommon.PH + GameCommon.BRAD &&
    newY >= frame.playerB - GameCommon.BRAD &&
    frame.ballAngle < Math.PI
  ) {
    // ball goes to the right and hits paddle player B
    paddle = {
      front: GameCommon.W - (GameCommon.PPAD + GameCommon.PW + GameCommon.BRAD),
      top: frame.playerB,
      bottom: frame.playerB + GameCommon.PH,
      maxBallAngleUp: 1.1 * Math.PI,
      maxBallAngleDown: 1.9 * Math.PI,
    };
  }
  return paddle;
}

function handlePaddleBounce(frame: frame, newX: number, newY: number): boolean {
  const paddle: paddle | undefined = getPaddle(frame, newX, newY);
  if (paddle) {
    if (newY <= paddle.top) {
      // bounce on top of paddle
      frame.ballYpos = paddle.top - GameCommon.BRAD;
      frame.ballAngle = paddle.maxBallAngleUp;
    } else if (newY > paddle.bottom) {
      // bounce on bottom of paddle
      frame.ballYpos = paddle.bottom + GameCommon.BRAD;
      frame.ballAngle = paddle.maxBallAngleDown;
    } else {
      // bounce on paddle front; calc exact hit point on paddle
      newY =
        frame.ballYpos +
        ((newY - frame.ballYpos) * (paddle.front - frame.ballXpos)) /
          (newX - frame.ballXpos);
      frame.ballYpos = newY;
      frame.ballXpos = paddle.front;

      // calc angle; extremes are capped to prevent (nearly) pure vertical angles
      const bounce_extreme: number =
        newY > paddle.top + GameCommon.PH / 2
          ? paddle.maxBallAngleDown
          : paddle.maxBallAngleUp;
      const bounce_symetric: number = Math.PI * 2 - frame.ballAngle;
      const rel_dist_from_center: number =
        Math.abs(newY - (paddle.top + GameCommon.PH / 2)) /
        (GameCommon.BRAD + GameCommon.PH / 2);
      frame.ballAngle =
        rel_dist_from_center * bounce_extreme +
        (1 - rel_dist_from_center) * bounce_symetric;
    }
    return true;
  }
  return false;
}

// symetrice bounce on floor or ceiling
function calcBallAnlgeAfterBounce(ballAngle: number): number {
  let newAngle!: number;

  // floor/ceiling bounce; ball goes to the right
  if (ballAngle < Math.PI * 0.5) {
    newAngle = Math.PI - ballAngle;
  }
  // floor/ceiling bounce; ball goes to the left
  else if (ballAngle < Math.PI * 1.5) {
    newAngle = Math.PI * 3 - ballAngle;
  }
  return newAngle;
}
