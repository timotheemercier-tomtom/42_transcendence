import Button from '@mui/material/Button';
import { socket as gameSocket } from '../game.socket';

type testMsgType = { id: number, name: string};

function clicker(): void {
  const myObj: testMsgType = {id: 123, name: "John"};

  console.log("test starts!");
  console.log(myObj);
  gameSocket.emit("test", myObj);
};

const TestComponent = () => {
  return (
    <>
      <Button onClick={clicker}>Test button</Button>
    </>
  );
}

export default TestComponent;
