import Button from '@mui/material/Button';
import { socket as gameSocket } from '../game.socket';
import { useParams } from 'react-router-dom';

type testMsgType = { userId: string, gameId: string};

function clicker(userId: string, gameId: string): void {
  console.log("test starts!");
  const myObj: testMsgType = {userId: userId, gameId: gameId};
  gameSocket.emit("test", myObj); // emit to server
};


// const TestComponent = ({mykey}) => {
const TestComponent = (props: any) => {
  const gameId: string = props.myObj.gameId;
  const userId: string = props.myObj.userId;
  return (
    <>
      <p>userId: {userId}</p>
      <p>gameId: {gameId}</p>
      <Button onClick={() => clicker(userId, gameId)}>Test button</Button>
    </>
  );
}

export default TestComponent;
