import Col from '../components/Col';
import Dashboard from '../components/Dashboard';
import GameMaker from '../components/GameMaker';

export default function Home() {
  return (
    <Col>
      <h1>Welcome!</h1>
          <GameMaker /> 
          <Dashboard />
    </Col>
  );
}
