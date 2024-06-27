import Col from '../components/Col';
import { useEffect, useState } from 'react';
import { GameType } from '../GameCommon';

type MatchHistoryType = {
  id: number;
  timestamp: Date;
  winner: string;
  playerA: string;
  playerB: string;
  scoreA: number;
  scoreB: number;
  gameType: GameType;
};

type MatchHistoryProps = {
  matchhistory: MatchHistoryType[];
};

function TableHeader() {
  return (
    <thead>
      <tr>
        <th>Id</th>
        <th>Time Stamp</th>
        <th>Winner</th>
        <th>Player A</th>
        <th>Player B</th>
        <th>Score</th>
        <th>gameType</th>
      </tr>
    </thead>
  );
}

function TableBody({ matchhistory }: MatchHistoryProps) {
  const arrayDataItems = matchhistory.map((rec) => (
    <tr>
      <td>{rec.id}</td>
      <td>
        {new Date(rec.timestamp).toLocaleDateString()}{' '}
        {new Date(rec.timestamp).toLocaleTimeString()}
      </td>
      <td>{rec.winner}</td>
      <td>{rec.playerA}</td>
      <td>{rec.playerB}</td>
      <td>
        {rec.scoreA} - {rec.scoreB}
      </td>
      <td>{rec.gameType == GameType.Classic ? 'Classic' : 'Self-balancing'}</td>
    </tr>
  ));
  return <tbody>{arrayDataItems}</tbody>;
}

export default function MatchHistory() {
  const [matchHistory, setMatchHistory] = useState<MatchHistoryType[]>([]);

  const fetchMatchHistory = async () => {
    try {
      const response = await fetch(
        `http://${location.hostname}:3000/game/matchhistory`,
        {
          method: 'GET',
        },
      );
      if (!response.ok) throw new Error('Network response error');
      const jsonResponse = await response.json();
      setMatchHistory(jsonResponse);
    } catch (err: any) {
      console.log('caught an error: ', err);
    }
  };

  useEffect(() => {
    fetchMatchHistory();
  }, []);

  if (matchHistory.length < 1) {
    return (
      <Col>
        <h1>Match History</h1>
        <p>no matches found</p>
      </Col>
    );
  } else {
    return (
      <Col>
        <h1>Match History</h1>
        <table>
          <TableHeader />
          <TableBody matchhistory={matchHistory} />
        </table>
      </Col>
    );
  }
}
