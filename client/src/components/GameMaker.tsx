import { useEffect, useState, SyntheticEvent } from 'react';
import { socket } from '../game.socket';
import { GameEventData, GameType } from '../GameCommon';
import { getLogin } from '../util';
import { useNavigate } from 'react-router-dom';
import { randomUUID } from '../util';

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
    event.preventDefault();
    const gameType: GameType =
      gameTypeStr == 'Classic' ? GameType.Classic : GameType.SelfBalancing;

    switch (publicOrPrivateStr) {
      case 'Public': {
        socket.emit('enque', { userId: userId, gameType: gameType });
        break;
      }
      case 'Private': {
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
      <fieldset>
        <legend>Create a game room to play PONG!</legend>
        <span>Which version of PONG! do you want to play? </span>
        <br />
        <input
          type="radio"
          id="classic"
          name="gameType"
          value="Classic"
          onChange={(e) => setGameTypeStr(e.target.value)}
          defaultChecked
        />
        <label htmlFor="classic">PONG Classic!</label>
        <br />
        <input
          type="radio"
          id="self-balancing"
          name="gameType"
          value="SelfBalancing"
          onChange={(e) => setGameTypeStr(e.target.value)}
        />
        <label htmlFor="self-balancing">Self-balancing PONG!</label>
        <br />
        <br />

        <span>Public or Private? </span>
        <br />
        <input
          type="radio"
          id="public"
          name="publicPrivate"
          value="Public"
          onChange={(e) => setPublicOrPrivateStr(e.target.value)}
          defaultChecked
        />
        <label htmlFor="public">Public - play with strangers!</label>
        <br />
        <input
          type="radio"
          id="private"
          name="publicPrivate"
          value="Private"
          onChange={(e) => setPublicOrPrivateStr(e.target.value)}
        />
        <label htmlFor="private">
          Private - invite people to your game room!
        </label>
        <br />
        <br />

        <input type="submit" value="Create Game!" />
      </fieldset>
    </form>
  );
};

export default GameMaker;
