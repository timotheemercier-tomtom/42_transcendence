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
  height: number;
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
  const ballSpeed: number = calcBallSpeed.bind(this)();
  let newX: number = this.ballXpos + Math.sin(this.ballAngle) * ballSpeed;
  let newY: number = this.ballYpos + Math.cos(this.ballAngle) * ballSpeed;
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
    const paddleHeightA: number =
      this.isSelfBalancing && this.scoreA < this.scoreB
        ? GameCommon.PH * this.selfBalancingFactor
        : GameCommon.PH;
    if (this.pa > GameCommon.H - paddleHeightA - GameCommon.PPAD) {
      this.pa = GameCommon.H - paddleHeightA - GameCommon.PPAD;
    }
  }
  if (this.keysB.up == true) {
    this.pb -= GameCommon.PSPEED;
    if (this.pb < GameCommon.PPAD) this.pb = GameCommon.PPAD;
  }
  if (this.keysB.down == true) {
    this.pb += GameCommon.PSPEED;
    const paddleHeightB: number =
      this.isSelfBalancing && this.scoreB < this.scoreA
        ? GameCommon.PH * this.selfBalancingFactor
        : GameCommon.PH;
    if (this.pb > GameCommon.H - paddleHeightB - GameCommon.PPAD) {
      this.pb = GameCommon.H - paddleHeightB - GameCommon.PPAD;
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
    this.selfBalancingFactor = calcSelfBalancingFactor.bind(this)();
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

/*
returns properties of the paddle that is hit
returns 'undefined' if no paddle is hit
*/
function getHitPaddle(newX: number, newY: number): paddle | undefined {
  if (
    newX > GameCommon.PPAD + GameCommon.PW + GameCommon.BRAD &&
    newX < GameCommon.W - GameCommon.PPAD - GameCommon.PW - GameCommon.BRAD
  ) {
    return undefined; // quick return: x-coordinate of ball rules out a hit
  }

  let paddle: paddle | undefined = undefined;
  const paddleHeight: number =
    this.isSelfBalancing && ballGoesToPlayerBehindInScore.bind(this)()
      ? GameCommon.PH * this.selfBalancingFactor
      : GameCommon.PH;

  if (
    newX <= GameCommon.PPAD + GameCommon.PW + GameCommon.BRAD &&
    newY <= this.pa + paddleHeight + GameCommon.BRAD &&
    newY >= this.pa - GameCommon.BRAD &&
    this.ballAngle > Math.PI
  ) {
    // ball goes to the left and hits paddle player A
    paddle = {
      front: GameCommon.PPAD + GameCommon.PW + GameCommon.BRAD,
      top: this.pa,
      bottom: this.pa + paddleHeight,
      height: paddleHeight,
      maxBallAngleUp: 0.9 * Math.PI,
      maxBallAngleDown: 0.1 * Math.PI,
    };
  } else if (
    newX >= GameCommon.W - GameCommon.PPAD - GameCommon.PW - GameCommon.BRAD &&
    newY <= this.pb + paddleHeight + GameCommon.BRAD &&
    newY >= this.pb - GameCommon.BRAD &&
    this.ballAngle < Math.PI
  ) {
    // ball goes to the right and hits paddle player B
    paddle = {
      front: GameCommon.W - (GameCommon.PPAD + GameCommon.PW + GameCommon.BRAD),
      top: this.pb,
      bottom: this.pb + paddleHeight,
      height: paddleHeight,
      maxBallAngleUp: 1.1 * Math.PI,
      maxBallAngleDown: 1.9 * Math.PI,
    };
  }
  return paddle;
}

function handlePaddleBounce(newX: number, newY: number): boolean {
  const paddle: paddle | undefined = getHitPaddle.bind(this)(newX, newY);
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
        newY > paddle.top + paddle.height / 2
          ? paddle.maxBallAngleDown
          : paddle.maxBallAngleUp;
      const bounce_symetric: number = Math.PI * 2 - this.ballAngle;
      const rel_dist_from_center: number =
        Math.abs(newY - (paddle.top + paddle.height / 2)) /
        (GameCommon.BRAD + paddle.height / 2);
      this.ballAngle =
        rel_dist_from_center * bounce_extreme +
        (1 - rel_dist_from_center) * bounce_symetric;
    }
    return true;
  }
  return false;
}

function calcBallSpeed() {
  return this.isSelfBalancing && ballGoesToPlayerBehindInScore.bind(this)()
    ? GameCommon.BSPEED / this.selfBalancingFactor
    : GameCommon.BSPEED;
}

function calcSelfBalancingFactor() {
  return this.isSelfBalancing ? 1 + Math.abs(this.scoreA - this.scoreB) / 5 : 1;
}

function ballGoesToPlayerBehindInScore(): boolean {
  return (
    (this.ballAngle < Math.PI && this.scoreB < this.scoreA) ||
    (this.ballAngle > Math.PI && this.scoreA < this.scoreB)
  );
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
