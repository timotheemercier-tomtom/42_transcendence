/*
This module describes the behaviour of the ball and the paddles in the pong game.
Note:
  - point (0, 0) is on the top left of the screen
  - an angle of 0 rad is defined as the ball going downwards on the screen
    (and therefore its y-value is increasing)
*/

import { GameCommon, GameEventData } from './GameCommon';
type frame = GameEventData['frame'];

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
    handle_goal(frame, newX) ||
    handle_ceilingOrFloorBounce(frame, newY) ||
    handle_paddleBounce_A(frame, newX, newY)
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

function handle_goal(frame: frame, newX: number): boolean {
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

function handle_ceilingOrFloorBounce(frame: frame, newY: number): boolean {
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

// Todo: ball can also bounce at the bottom or top of the paddle!!
// Todo: bounce on paddle B
// Todo: improve calculation to determine the new angle
function handle_paddleBounce_A(
  frame: frame,
  newX: number,
  newY: number,
): boolean {
  const paleft: number = GameCommon.PPAD;
  const paright: number = GameCommon.PPAD + GameCommon.PW;
  const pabottom: number = frame.playerA + GameCommon.PH;
  const patop: number = frame.playerA;

  const pbleft: number = GameCommon.W - (GameCommon.PPAD + GameCommon.PW);
  const pbright: number = GameCommon.W - GameCommon.PPAD;
  const pbbottom: number = frame.playerB + GameCommon.PH;
  const pbtop: number = frame.playerB;

  const bleft: number = frame.ball_xpos - GameCommon.BRAD;
  const bright: number = frame.ball_xpos + GameCommon.BRAD;
  const bbottom: number = frame.ball_ypos + GameCommon.BRAD;
  const btop: number = frame.ball_ypos - GameCommon.BRAD;

  if (
    newX <= paright + GameCommon.BRAD &&
    newY <= pabottom + GameCommon.BRAD &&
    newY >= patop - GameCommon.BRAD &&
    frame.ball_angle_rad > Math.PI // ball goes to the left
  ) {
    // calc exact hit point on paddle
    newY =
      frame.ball_ypos +
      ((newY - frame.ball_ypos) *
        (paright + GameCommon.BRAD - frame.ball_xpos)) /
        (newX - frame.ball_xpos);
    frame.ball_ypos = newY;
    frame.ball_xpos = paright + GameCommon.BRAD;

    // calc angle; extremes are capped to prevent (nearly) pure vertical angles
    const bounce_extreme: number =
      Math.PI * (newY > patop + (pabottom - patop) / 2 ? 0.1 : 0.9);
    const bounce_symetric: number = Math.PI * 2 - frame.ball_angle_rad;
    const rel_dist_from_center: number =
      Math.abs(newY - (patop + (pabottom - patop) / 2)) /
      (GameCommon.BRAD + (pabottom - patop) / 2);
    frame.ball_angle_rad =
      rel_dist_from_center * bounce_extreme +
      (1 - rel_dist_from_center) * bounce_symetric;
    console.log(frame.ball_angle_rad / Math.PI);
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
