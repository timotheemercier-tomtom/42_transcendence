import Col from '../components/Col';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { GameType } from '../GameCommon';

interface MatchHistoryDTO {
  id: number;
  timestamp: Date;
  winner: string;
  playerA: string;
  playerB: string;
  scoreA: number;
  scoreB: number;
  gameType: GameType;
}
interface TableRowData {
  id: number;
  timestamp: Date;
  winner: string;
  playerA: string;
  playerB: string;
  score: string;
  gameType: string;
}

function createRowData(rec: MatchHistoryDTO): TableRowData {
  const id: number = rec.id;
  const timestamp: Date = new Date(rec.timestamp);
  const winner: string = rec.winner;
  const playerA: string = rec.playerA;
  const playerB: string = rec.playerB;
  const score: string = `${rec.scoreA} - ${rec.scoreB}`;
  const gameType: string =
    rec.gameType === GameType.Classic ? 'Classic' : 'Self-balancing';
  return { id, timestamp, winner, playerA, playerB, score, gameType };
}

function createTableRows(recs: MatchHistoryDTO[]): TableRowData[] {
  let rows: TableRowData[] = [];
  recs.forEach((rec) => {
    rows.push(createRowData(rec));
  });
  return rows;
}

export default function MatchHistory() {
  const [matchHistory, setMatchHistory] = useState<MatchHistoryDTO[]>([]);

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

  const rows = createTableRows(matchHistory);
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      type: 'dateTime',
      width: 230,
    },
    { field: 'winner', headerName: 'Winner', width: 130 },
    { field: 'playerA', headerName: 'Player A', width: 130 },
    { field: 'playerB', headerName: 'Player B', width: 130 },
    { field: 'score', headerName: 'Score', width: 130 },
    {
      field: 'gameType',
      headerName: 'Game type',
      type: 'singleSelect',
      valueOptions: ['Classic', 'Self-balancing'],
      width: 130,
    },
  ];

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
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </Col>
    );
  }
}
