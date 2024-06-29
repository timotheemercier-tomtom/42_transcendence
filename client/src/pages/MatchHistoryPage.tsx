import MatchHistory from '../components/MatchHistory'
import Col from '../components/Col';
import { useEffect } from 'react';
import { getLogin } from '../util';
import { useNavigate, Link } from 'react-router-dom';

export default function MatchHistoryPage() {
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
      <h1>Match History</h1>
      <MatchHistory filterUser={false}/>
    </Col>
  );
}
