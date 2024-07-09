import { useRef, useEffect, useState } from 'react';
import GameClient from '../GameClient';
import Col from './Col';
import Row from './Row';
import { getLogin } from '../util';
import { useParams } from 'react-router-dom';
import { Avatar, Button, Typography } from '@mui/material';
import { GameEventData, GameState, GameType } from '../GameCommon';
import { socket } from '../game.socket';
import { API } from '../util';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableHead from '@mui/material/TableHead';
import Collapse from '@mui/material';

type SetterFunction = React.Dispatch<any>;

const GC = new GameClient();

const GameAvatar = (props: any) => {
  const picture: any =
    props.userData && props.userData.picture
      ? props.userData.picture
      : undefined;
  return (
    <Avatar
      src={picture}
      alt="Profile"
      style={{ width: '100px', height: '100px' }}
    />
  );
};

const Game = () => {
  const { id } = useParams(); // this is the room ID!
  const cr = useRef<HTMLCanvasElement>(null);
  const gameId: string = id!;
  const userId: string = getLogin();
  const [gameStateString, setGameStateStr] = useState('loading game');
  const [gameState, setGameState] = useState(GameState.WaitingForPlayers);
  const [playerA, setPlayerA] = useState<string | undefined>(undefined);
  const [playerB, setPlayerB] = useState<string | undefined>(undefined);
  const [spectators, setSpectators] = useState<string | undefined>(undefined);
  const [textMsg, setTextMsg] = useState<string | undefined>(undefined);
  const [scaleFactor, setScaleFactor] = useState<number>(1.0);
  const [gameTypeStr, setGameTypeStr] = useState<string>('Classic');
  const [publicOrPrivateStr, setPublicOrPrivateStr] =
    useState<string>('Public');
  const [userDataA, setUserDataA] = useState<any>(null);
  const [userDataB, setUserDataB] = useState<any>(null);

  useEffect(() => {
    const ctx = cr.current?.getContext('2d');
    if (!ctx) return;
    socket.connect();
    GC.load(ctx, getLogin(), id!);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      GC.unload();
      socket.disconnect();
    };
  }, [cr, id]);

  useEffect(() => {
    const onStateChange = (e: GameEventData['game_state']) => {
      setGameState(e.gameState);
      setPlayerA(e.playerA);
      fetchUserData(e.playerA, setUserDataA);
      setPlayerB(e.playerB);
      fetchUserData(e.playerB, setUserDataB);
      setSpectators([...e.spectators].join(', '));
      setTextMsg(e.textMsg);
      setScaleFactor(GC.calcScaleFactor(window.innerWidth, window.innerHeight));
      if (e.gameState == GameState.WaitingForPlayers)
        setGameStateStr('waiting for players');
      if (e.gameState == GameState.ReadyToStart)
        setGameStateStr('ready to start');
      if (e.gameState == GameState.Running) setGameStateStr('running');
      if (e.gameState == GameState.Finished) setGameStateStr('finished');

      switch (e.gameType) {
        case GameType.Classic: {
          setGameTypeStr('Classic');
          break;
        }
        case GameType.SelfBalancing: {
          setGameTypeStr('Self-balaning');
          break;
        }
      }
      if (e.isPublic == true) {
        setPublicOrPrivateStr('Public');
      } else {
        setPublicOrPrivateStr('Private');
      }
    };

    socket.on('game_state', onStateChange);
    return () => {
      socket.off('game_state', onStateChange);
    };
  }, [id]);

  function handleResize() {
    setScaleFactor(GC.calcScaleFactor(window.innerWidth, window.innerHeight));
  }

  const fetchUserData = async (
    newPlayer: string | undefined,
    setUserData: SetterFunction,
  ) => {
    if (newPlayer == undefined) {
      setUserData(undefined);
    } else {
      try {
        const response = await fetch(`${API}/user/${newPlayer}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        setUserData(await response.json());
      } catch (err: any) {
        console.log('error retrieving user: ', userId);
      }
    }
  };

  return (
    <Col align-items="flex-start">
      <Typography
        color="inherit"
        variant="h2"
        component="div"
        sx={{ margin: '10px' }}
      >
        Pong !
      </Typography>
      <Row>
        <Col sx={{ width: '100%' }}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="left" colSpan={2}>
                    <b>Game properties</b>
                  </TableCell>
                  <TableCell
                    align="left"
                    colSpan={1}
                    sx={{ padding: '6px 24px' }}
                  >
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <b>Game type:</b>
                  </TableCell>
                  <TableCell>{gameTypeStr}</TableCell>
                  <TableCell>
                    <Button
                      disabled={
                        gameState != GameState.WaitingForPlayers ||
                        playerA == userId ||
                        playerB == userId
                      }
                      onClick={() => GC.join()}
                    >
                      Join Game!
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <b>Availability</b>
                  </TableCell>
                  <TableCell>{publicOrPrivateStr}</TableCell>
                  <TableCell>
                    <Button
                      disabled={playerA != userId && playerB != userId}
                      onClick={() => GC.leave()}
                    >
                      Leave Game!
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <b>Game state</b>
                  </TableCell>
                  <TableCell>{gameStateString}</TableCell>
                  <TableCell>
                    <Button
                      disabled={
                        gameState != GameState.ReadyToStart ||
                        (playerA != userId && playerB != userId)
                      }
                      onClick={() => GC.start()}
                    >
                      Start Game!
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Col>
      </Row>
      <Row sx={{ justifyContent: 'space-between', padding: '30px' }}>
        <GameAvatar userData={userDataA} />
        <GameAvatar userData={userDataB} />
      </Row>

      <canvas
        ref={cr}
        width={GameClient.W * scaleFactor}
        height={GameClient.H * scaleFactor}
      ></canvas>
    </Col>
  );
};
// };

export default Game;
