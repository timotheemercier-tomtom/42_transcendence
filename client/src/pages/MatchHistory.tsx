import Col from '../components/Col';

import { useEffect, useState } from 'react';

export default function MatchHistory() {
  const [matchHistoryRaw, setMatchHistoryRaw] = useState('');
  const [error, setError] = useState(null);

  const fetchMatchHistory = async () => {
    try {
      const response = await fetch(
        `http://${location.hostname}:3000/game/matchhistory`,
        {
          method: 'GET',
        },
      );
      console.log('response: ', response);  // type 'cors'
      if (!response.ok) throw new Error('Network response error');
      const jsonResponse = await response.json();  // array with objects
      console.log('jsonResponse', jsonResponse);
      const rawResponse = JSON.stringify(jsonResponse);
      console.log('rawResponse:', rawResponse);
      setMatchHistoryRaw(rawResponse); // toString() is temp solution
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchMatchHistory();
  }, []);

  return (
    <Col>
      <h1>Match History Placeholder</h1>
      <p>Raw data:</p>
      <p>{matchHistoryRaw}</p>
      <p>error: {error}</p>
    </Col>
  );
}
