/*
This module describes the behaviour of the ball and the paddles in the pong game.
Note:
  - point (0, 0) is on the top left of the screen
  - an angle of 0 rad is defined as the ball going downwards
*/

import { GameCommon, GameEventData } from './GameCommon';

type frame = GameEventData['frame'];

// Todo: ball can also bounce at the bottom or top of the paddle!!
function isPaddleBounch_A(frame: frame, newX: number) {
  ;
}

// Todo: vertical bounces are actutally the goals
function isGoal(frame: frame, newX: number) : boolean {
  return ((newX < GameCommon.BRAD && Math.sin(frame.ball_angle_rad) < 0)
    || (newX > GameCommon.W - GameCommon.BRAD && Math.sin(frame.ball_angle_rad) > 0));
}

function isCeilingOrFloorBounce(frame: frame, newY: number) : boolean {
  return (
    (newY < GameCommon.BRAD && Math.cos(frame.ball_angle_rad) < 0)
    || (newY > GameCommon.H - GameCommon.BRAD) && Math.cos(frame.ball_angle_rad) > 0);
}

// NOTE should only used for ceiling (and top of paddle), since vertial bounces are the goals!
function calcBounceEffect(ballAngle: number) : number {
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
function calcGoalBounceEffect(ballAngle: number) : number {
  return (Math.PI * 2 - ballAngle);
}

function updateBall(frame: frame) : void {
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


  let newX: number = frame.ball_xpos + Math.sin(frame.ball_angle_rad) * GameCommon.BSPEED;
  let newY: number = frame.ball_ypos + Math.cos(frame.ball_angle_rad) * GameCommon.BSPEED;

  if (isGoal(frame, newX))
  {
    if (newX < GameCommon.BRAD) {
      newX = GameCommon.BRAD;
    }
    if (newX > GameCommon.W - GameCommon.BRAD) {
      newX = GameCommon.W - GameCommon.BRAD
    }
    frame.ball_angle_rad = calcGoalBounceEffect(frame.ball_angle_rad);
    frame.ball_xpos = newX;
  }
  else if (isCeilingOrFloorBounce(frame, newY)) {
    if (newY < GameCommon.BRAD) {
      newY = GameCommon.BRAD;
    }
    if (newY > GameCommon.H - GameCommon.BRAD) {
      newY = GameCommon.H - GameCommon.BRAD
    }
    frame.ball_angle_rad = calcBounceEffect(frame.ball_angle_rad);
    frame.ball_ypos = newY;
  }
  else if (false) {
    // todo: paddle bounce
  }
  else {
    // no bounce
    frame.ball_xpos = newX;
    frame.ball_ypos = newY;
  }
}

function updatePaddle(frame: frame, keyUp: boolean, keydown: boolean) : void {
  if (keyUp && !keydown) {
    frame.playerA -= GameCommon.PSPEED;
  }
  if (keydown && !keyUp) {
    frame.playerA += GameCommon.PSPEED;
  }
}

export function updateFrame(frame: frame, keyUp: boolean, keydown: boolean): void
{
  updateBall(frame);
  updatePaddle(frame, keyUp, keydown);
}
