import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './css/index.css';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline, createTheme } from '@mui/material';
import { red } from '@mui/material/colors';
import theme from './theme.ts';


// const theme = createTheme({
//     palette: {
//       primary: {
//         main: '#556cd6',
//       },
//       secondary: {
//         main: '#19857b',
//       },
//       error: {
//         main: red.A400,
//       },
//     },
//   });
  

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  );

  