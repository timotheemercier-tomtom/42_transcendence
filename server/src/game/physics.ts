/*
This module describes the behaviour of the ball and the paddles in the pong game.
Note:
  - point (0, 0) is on the top left of the screen
  - an angle of 0 rad is defined as the ball going downwards on the screen
    (and therefore its y-value is increasing)
*/

import { GameCommon } from './GameCommon';

type paddle = {
  front: number;
  top: number;
  bottom: number;
  maxBallAngleUp: number;
  maxBallAngleDown: number;
};

// NOTE: the "this" of the GameServer instance should be bound to the function call!
export function runPhysics(): void {
  // Unpause after a second.
  if (this.pausingAfterGoal && Date.now() - this.goalTimeStamp > 1000) {
    this.pausingAfterGoal = false;
  }

  // update ball (except when game is paused)
  let newX: number =
    this.ballXpos + Math.sin(this.ballAngle) * GameCommon.BSPEED;
  let newY: number =
    this.ballYpos + Math.cos(this.ballAngle) * GameCommon.BSPEED;
  if (
    this.pausingAfterGoal ||
    handleGoal.bind(this)(newX) ||
    handleCeilingOrFloorBounce.bind(this)(newY) ||
    handlePaddleBounce.bind(this)(newX, newY)
  ) {
  } else {
    this.ballXpos = newX;
    this.ballYpos = newY;
  }

  // update paddles (also when game is paused)
  if (this.keysA.up == true) {
    this.pa -= GameCommon.PSPEED;
    if (this.pa < GameCommon.PPAD) this.pa = GameCommon.PPAD;
  }
  if (this.keysA.down == true) {
    this.pa += GameCommon.PSPEED;
    if (this.pa > GameCommon.H - GameCommon.PH - GameCommon.PPAD) {
      this.pa = GameCommon.H - GameCommon.PH - GameCommon.PPAD;
    }
  }
  if (this.keysB.up == true) {
    this.pb -= GameCommon.PSPEED;
    if (this.pb < GameCommon.PPAD) this.pb = GameCommon.PPAD;
  }
  if (this.keysB.down == true) {
    this.pb += GameCommon.PSPEED;
    if (this.pb > GameCommon.H - GameCommon.PH - GameCommon.PPAD) {
      this.pb = GameCommon.H - GameCommon.PH - GameCommon.PPAD;
    }
  }
}

function handleGoal(newX: number): boolean {
  if (
    (newX < GameCommon.BRAD && Math.sin(this.ballAngle) < 0) ||
    (newX > GameCommon.W - GameCommon.BRAD && Math.sin(this.ballAngle) > 0)
  ) {
    if (newX < GameCommon.BRAD) {
      this.scoreB++;
      this.ballAngle = 1.5 * Math.PI;
    }
    if (newX > GameCommon.W - GameCommon.BRAD) {
      this.ballAngle = 0.5 * Math.PI;
      this.scoreA++;
    }
    this.ballXpos = GameCommon.W / 2;
    this.ballYpos = GameCommon.H / 2;
    this.pausingAfterGoal = true;
    this.goalTimeStamp = Date.now();
    console.log('score: ', this.scoreA, this.scoreB);
    return true;
  } else {
    return false;
  }
}

function handleCeilingOrFloorBounce(newY: number): boolean {
  if (
    (newY < GameCommon.BRAD && Math.cos(this.ballAngle) < 0) ||
    (newY > GameCommon.H - GameCommon.BRAD && Math.cos(this.ballAngle) > 0)
  ) {
    if (newY < GameCommon.BRAD) {
      newY = GameCommon.BRAD;
    }
    if (newY > GameCommon.H - GameCommon.BRAD) {
      newY = GameCommon.H - GameCommon.BRAD;
    }
    this.ballAngle = calcBallAnlgeAfterBounce(this.ballAngle);
    this.ballYpos = newY;
    return true;
  } else {
    return false;
  }
}

function getPaddle(newX: number, newY: number): paddle | undefined {
  let paddle: paddle | undefined = undefined;
  if (
    newX <= GameCommon.PPAD + GameCommon.PW + GameCommon.BRAD &&
    newY <= this.pa + GameCommon.PH + GameCommon.BRAD &&
    newY >= this.pa - GameCommon.BRAD &&
    this.ballAngle > Math.PI
  ) {
    // ball goes to the left and hits paddle player A
    paddle = {
      front: GameCommon.PPAD + GameCommon.PW + GameCommon.BRAD,
      top: this.pa,
      bottom: this.pa + GameCommon.PH,
      maxBallAngleUp: 0.9 * Math.PI,
      maxBallAngleDown: 0.1 * Math.PI,
    };
  } else if (
    newX >= GameCommon.W - GameCommon.PPAD - GameCommon.PW - GameCommon.BRAD &&
    newY <= this.pb + GameCommon.PH + GameCommon.BRAD &&
    newY >= this.pb - GameCommon.BRAD &&
    this.ballAngle < Math.PI
  ) {
    // ball goes to the right and hits paddle player B
    paddle = {
      front: GameCommon.W - (GameCommon.PPAD + GameCommon.PW + GameCommon.BRAD),
      top: this.pb,
      bottom: this.pb + GameCommon.PH,
      maxBallAngleUp: 1.1 * Math.PI,
      maxBallAngleDown: 1.9 * Math.PI,
    };
  }
  return paddle;
}

function handlePaddleBounce(newX: number, newY: number): boolean {
  const paddle: paddle | undefined = getPaddle.bind(this)(newX, newY);
  if (paddle) {
    if (newY <= paddle.top) {
      // bounce on top of paddle
      this.ballYpos = paddle.top - GameCommon.BRAD;
      this.ballAngle = paddle.maxBallAngleUp;
    } else if (newY > paddle.bottom) {
      // bounce on bottom of paddle
      this.ballYpos = paddle.bottom + GameCommon.BRAD;
      this.ballAngle = paddle.maxBallAngleDown;
    } else {
      // bounce on paddle front; calc exact hit point on paddle
      newY =
        this.ballYpos +
        ((newY - this.ballYpos) * (paddle.front - this.ballXpos)) /
          (newX - this.ballXpos);
      this.ballYpos = newY;
      this.ballXpos = paddle.front;

      // calc angle; extremes are capped to prevent (nearly) pure vertical angles
      const bounce_extreme: number =
        newY > paddle.top + GameCommon.PH / 2
          ? paddle.maxBallAngleDown
          : paddle.maxBallAngleUp;
      const bounce_symetric: number = Math.PI * 2 - this.ballAngle;
      const rel_dist_from_center: number =
        Math.abs(newY - (paddle.top + GameCommon.PH / 2)) /
        (GameCommon.BRAD + GameCommon.PH / 2);
      this.ballAngle =
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
  if (ballAngle < Math.PI) {
    newAngle = Math.PI - ballAngle;
  }
  // floor/ceiling bounce; ball goes to the left
  else {
    newAngle = Math.PI * 3 - ballAngle;
  }
  return newAngle;
}
