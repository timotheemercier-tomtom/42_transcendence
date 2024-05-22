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

export function updateFrame(
  frame: frame,
  keyUp: boolean,
  keydown: boolean,
): void {
  // update ball
  let newX: number =
    frame.ball_xpos + Math.sin(frame.ball_angle_rad) * GameCommon.BSPEED;
  let newY: number =
    frame.ball_ypos + Math.cos(frame.ball_angle_rad) * GameCommon.BSPEED;
  if (
    handleGoal(frame, newX) ||
    handleCeilingOrFloorBounce(frame, newY) ||
    handlePaddleBounce(frame, newX, newY)
  ) {
  } else {
    frame.ball_xpos = newX;
    frame.ball_ypos = newY;
  }

  // update paddle player A
  if (keyUp && !keydown) {
    frame.playerA -= GameCommon.PSPEED;
    if (frame.playerA < GameCommon.PPAD) {
      frame.playerA = GameCommon.PPAD;
    }
  }
  if (keydown && !keyUp) {
    frame.playerA += GameCommon.PSPEED;
    if (frame.playerA > GameCommon.H - GameCommon.PH - GameCommon.PPAD) {
      frame.playerA = GameCommon.H - GameCommon.PH - GameCommon.PPAD;
    }
  }
}

function handleGoal(frame: frame, newX: number): boolean {
  if (
    (newX < GameCommon.BRAD && Math.sin(frame.ball_angle_rad) < 0) ||
    (newX > GameCommon.W - GameCommon.BRAD &&
      Math.sin(frame.ball_angle_rad) > 0)
  ) {
    if (newX < GameCommon.BRAD) {
      newX = GameCommon.BRAD;
    }
    if (newX > GameCommon.W - GameCommon.BRAD) {
      newX = GameCommon.W - GameCommon.BRAD;
    }
    frame.ball_angle_rad = calcGoalBounceEffect(frame.ball_angle_rad);
    frame.ball_xpos = newX;
    return true;
  } else {
    return false;
  }
}

function handleCeilingOrFloorBounce(frame: frame, newY: number): boolean {
  if (
    (newY < GameCommon.BRAD && Math.cos(frame.ball_angle_rad) < 0) ||
    (newY > GameCommon.H - GameCommon.BRAD &&
      Math.cos(frame.ball_angle_rad) > 0)
  ) {
    if (newY < GameCommon.BRAD) {
      newY = GameCommon.BRAD;
    }
    if (newY > GameCommon.H - GameCommon.BRAD) {
      newY = GameCommon.H - GameCommon.BRAD;
    }
    frame.ball_angle_rad = calcBounceEffect(frame.ball_angle_rad);
    frame.ball_ypos = newY;
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
    frame.ball_angle_rad > Math.PI
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
    frame.ball_angle_rad < Math.PI
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
      frame.ball_ypos = paddle.top - GameCommon.BRAD;
      frame.ball_angle_rad = paddle.maxBallAngleUp;
    } else if (newY > paddle.bottom) {
      // bounce on bottom of paddle
      frame.ball_ypos = paddle.bottom + GameCommon.BRAD;
      frame.ball_angle_rad = paddle.maxBallAngleDown;
    } else {
      // bounce on paddle front; calc exact hit point on paddle
      newY =
        frame.ball_ypos +
        ((newY - frame.ball_ypos) * (paddle.front - frame.ball_xpos)) /
          (newX - frame.ball_xpos);
      frame.ball_ypos = newY;
      frame.ball_xpos = paddle.front;

      // calc angle; extremes are capped to prevent (nearly) pure vertical angles
      const bounce_extreme: number =
        newY > paddle.top + GameCommon.PH / 2
          ? paddle.maxBallAngleDown
          : paddle.maxBallAngleUp;
      const bounce_symetric: number = Math.PI * 2 - frame.ball_angle_rad;
      const rel_dist_from_center: number =
        Math.abs(newY - (paddle.top + GameCommon.PH / 2)) /
        (GameCommon.BRAD + GameCommon.PH / 2);
      frame.ball_angle_rad =
        rel_dist_from_center * bounce_extreme +
        (1 - rel_dist_from_center) * bounce_symetric;
    }
    return true;
  }
  return false;
}

// NOTE should only used for ceiling (and top of paddle)
function calcBounceEffect(ballAngle: number): number {
  let newAngle!: number;

  // floor bounce, ball goes to the right
  if (ballAngle < Math.PI * 0.5) {
    newAngle = Math.PI - ballAngle;
  }
  // ceiling bounce, ball goes to the right
  else if (ballAngle < Math.PI) {
    newAngle = Math.PI - ballAngle;
  }
  // ceiling bounce, ball goes to the left
  else if (ballAngle < Math.PI * 1.5) {
    newAngle = Math.PI * 3 - ballAngle;
  }
  // floor bounce, ball goes to the left
  else {
    newAngle = Math.PI * 3 - ballAngle;
  }
  return newAngle;
}

// NOTE this is a temp function, since goals are not supposed to bounce. (maybe powerup!)
function calcGoalBounceEffect(ballAngle: number): number {
  return Math.PI * 2 - ballAngle;
}
