import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';

interface UserDTO {
  id: number;
  login: string;
  displayName: string;
  picture: string;
  won: number;
  lost: number;
  rank: number;
  twoFASecret: string;
  isTwoFAEnabled: boolean;
}

interface TableRowData {
  rank: number;
  username: string;
  winPercentage: number;
  wins: number;
  losses: number;
}

function createRowData(rec: UserDTO): TableRowData {
  const rank: number = 0; // temp value
  const username: string = rec.displayName;
  const winPercentage: number =
    rec.won + rec.lost != 0
      ? Math.floor((100 * rec.won) / (rec.won + rec.lost))
      : 0;
  const wins: number = rec.won;
  const losses: number = rec.lost;
  return { rank, username, winPercentage, wins, losses };
}

function calcRanking(rows: TableRowData[]) {
  rows.sort((a, b) => b.winPercentage - a.winPercentage);
  let i: number = 1;
  for (let row of rows) {
    row.rank = i;
    i++;
  }
}

function createTableRows(recs: UserDTO[]): TableRowData[] {
  let rows: TableRowData[] = [];
  recs.forEach((rec) => {
    rows.push(createRowData(rec));
  });
  calcRanking(rows);
  return rows;
}

const Ranking = () => {
  const [userData, setUserData] = useState<UserDTO[]>([]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `http://${location.hostname}:3000/user/all-users`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );
      if (!response.ok) throw new Error('Network response error');
      const jsonResponse = await response.json();
      setUserData(jsonResponse);
    } catch (err: any) {
      console.log('caught an error: ', err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const rows = createTableRows(userData);
  const columns: GridColDef[] = [
    { field: 'rank', headerName: 'Rank', type: 'number', width: 70 },
    { field: 'username', headerName: 'username', width: 100 },
    {
      field: 'winPercentage',
      headerName: 'win percentage',
      type: 'number',
      width: 150,
    },
    { field: 'wins', headerName: 'wins', type: 'number', width: 100 },
    { field: 'losses', headerName: 'losses', type: 'number', width: 100 },
  ];

  if (userData.length < 1) {
    return <p>no users found</p>;
  } else {
    return (
      <DataGrid
        rows={rows}
        columns={columns}
        disableColumnSorting
        getRowId={(row) => row.username}
        initialState={{
          sorting: {
            sortModel: [{ field: 'rank', sort: 'asc' }],
          },
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
      />
    );
  }
};

export default Ranking;
