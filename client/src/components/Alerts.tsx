import Alert, { AlertColor } from '@mui/material/Alert';
import Stack from '@mui/material/Stack';


export default function Alerts(alert: string, level: AlertColor) {
    return (
      <Stack sx={{ width: '100%' }} spacing={2}>
        <Alert severity={level}>{alert}</Alert>
      </Stack>
    );
  }
  