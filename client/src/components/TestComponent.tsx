import Button from '@mui/material/Button';
import { socket as gameSocket } from '../game.socket';
import { useParams } from 'react-router-dom';

type testMsgType = { userId: string, gameId: string};

function clicker(userID: string): void {
  console.log("test starts!");
  const myObj: testMsgType = {userId: userID, gameId: "myGameId"};
  console.log(myObj);
  gameSocket.emit("test", myObj);
};

const TestComponent = () => {
  const { id: userId = ""} = useParams();
  return (
    <>
      <Button onClick={() => clicker(userId)}>Test button</Button>
    </>
  );
}

export default TestComponent;
