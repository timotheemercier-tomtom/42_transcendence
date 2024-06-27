import { useParams, Link } from 'react-router-dom';
import Chat from '../components/Chat';
import Game from '../components/Game';
import Row from '../components/Row';

export default function Room() {
  const { id = '' } = useParams();

  return (
    <Row flexGrow={1} minHeight={0}>
      <Link to={'/'}>
        <p>Back to homepage</p>
      </Link>
      <Game />
      <Chat id={id}></Chat>
    </Row>
  );
}
