import Col from '../components/Col';
import GameMaker from '../components/GameMaker';
import { Link } from 'react-router-dom';
import { getLogin } from '../util';

export default function Home() {
  const userId = getLogin();
  if (!userId) {
    return <p>please log in</p>;
  } else {
    return (
      <Col>
        <h1>Welcome!</h1>
        <GameMaker />
        <Link to={'/matchhistory'}>
          <p>View match history</p>
        </Link>
        <Link to={'/u/' + userId}>
          <p>View my profile</p>
        </Link>
      </Col>
    );
  }
}
