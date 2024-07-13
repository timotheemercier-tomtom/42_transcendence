import { useEffect, useState, SyntheticEvent } from 'react';
import { socket } from '../game.socket';
import { GameEventData, GameType } from '../GameCommon';
import { getLogin } from '../util';
import { useNavigate } from 'react-router-dom';
import { randomUUID } from '../util';
import {
  Box,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Radio,
  Button,
} from '@mui/material';

const GameMaker = () => {
  const userId = getLogin();
  const nav = useNavigate();
  const [gameTypeStr, setGameTypeStr] = useState<string>('Classic');
  const [publicOrPrivateStr, setPublicOrPrivateStr] =
    useState<string>('Public');

  useEffect(() => {
    const onjoin_game_room = (ug: GameEventData['join_game_room']) => {
      if (ug.userId == userId) nav('/r/' + ug.gameId);
    };
    socket.connect();
    socket.on('join_game_room', onjoin_game_room);
    return () => {
      socket.off('join_game_room', onjoin_game_room);
    };
  }, []);

  function submitHandler(event: SyntheticEvent) {
    console.log(`submit handler: -${publicOrPrivateStr}-, ${gameTypeStr}`);
    event.preventDefault();
    const gameType: GameType =
      gameTypeStr == 'Classic' ? GameType.Classic : GameType.SelfBalancing;
    switch (publicOrPrivateStr) {
      case 'Public': {
        console.log('emitting Public..');
        socket.emit('enque', { userId: userId, gameType: gameType });
        break;
      }
      case 'Private': {
        console.log('emitting Private..');
        socket.emit('create', {
          userId: userId,
          gameId: 'game-' + randomUUID(),
          isPublic: false,
          gameType: gameType,
        });
        break;
      }
    }
  }
  return (
    <form onSubmit={submitHandler}>
      <Box component="fieldset">
        <legend>Create a game room to play PONG!</legend>
        <FormControl onSubmit={submitHandler}>
          <FormLabel id="game-type" sx={{ color: 'primary.main' }}>
            Which version of PONG! do you want to play?
          </FormLabel>
          <RadioGroup
            aria-labelledby="game-type"
            defaultValue="Classic"
            name="gameType"
            onChange={(e) => setGameTypeStr(e.target.value)}
          >
            <FormControlLabel
              value="Classic"
              control={<Radio />}
              label="PONG Classic!"
            />
            <FormControlLabel
              value="Self-balancing"
              control={<Radio />}
              label="Self-balancing PONG!"
            />
          </RadioGroup>

          <FormLabel id="public-private" sx={{ color: 'primary.main' }}>
            Public or Private?
          </FormLabel>
          <RadioGroup
            aria-labelledby="public-private"
            defaultValue="Public"
            name="publicPrivate"
            onChange={(e) => setPublicOrPrivateStr(e.target.value)}
          >
            <FormControlLabel
              value="Public"
              control={<Radio />}
              label="Public - play PONG with strangers!"
            />
            <FormControlLabel
              value="Private"
              control={<Radio />}
              label="Private - invite people to your game room!"
            />
          </RadioGroup>
          <Button type="submit" value="Create Game!">
            Submit
          </Button>
        </FormControl>
      </Box>
    </form>
  );
};

export default GameMaker;
