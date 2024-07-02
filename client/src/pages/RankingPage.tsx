import Ranking from '../components/Ranking'
import Col from '../components/Col';
import { useEffect } from 'react';
import { getLogin } from '../util';
import { useNavigate, Link } from 'react-router-dom';

export default function RankingPage() {
  const nav = useNavigate();

  useEffect(() => {
    const userId: string = getLogin();
    if (!userId) {
      nav('/');
    }
  }, []);

  return (
    <Col>
      <Link to={'/'}>
        <p>Back to homepage</p>
      </Link>
      <h1>Ranking</h1>
      <Ranking />
    </Col>
  );
}
