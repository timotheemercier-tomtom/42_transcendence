import * as React from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

export default function BasicAlerts(alert: string) {
  return (
    <Stack sx={{ width: '100%' }} spacing={2}>
      <Alert severity="success">{alert}</Alert>
      <Alert severity="info">{alert}</Alert>
      <Alert severity="warning">{alert}</Alert>
      <Alert severity="error">{alert}</Alert>
    // </Stack>
  );
}
