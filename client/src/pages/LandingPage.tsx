import * as React from 'react';
import { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AppBar from '../components/AppBar';
import Footer from '../components/Footer';
import getLPTheme from '../theme';
import Badges from '../components/Badges';
import { Outlet } from 'react-router-dom';

const defaultTheme = createTheme({});

interface ToggleCustomThemeProps {
  showCustomTheme: Boolean;
  toggleCustomTheme: () => void;
}

function ToggleCustomTheme({
  showCustomTheme,
  toggleCustomTheme,
}: ToggleCustomThemeProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100dvw',
        position: 'fixed',
        bottom: 24,
      }}
    >
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={showCustomTheme}
        onChange={toggleCustomTheme}
        aria-label="Platform"
        sx={{
          backgroundColor: 'background.default',
          '& .Mui-selected': {
            pointerEvents: 'none',
          },
        }}
      >
        <ToggleButton value>
          <AutoAwesomeRoundedIcon sx={{ fontSize: '20px', mr: 1 }} />
          Dark Mode
        </ToggleButton>
        <ToggleButton value={false}>Light Mode</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}


// function ColorSchemeToggle(props: IconButtonProps) {
//     const { onClick, ...other } = props;
//     const { mode, setMode } = useColorScheme();
//     const [mounted, setMounted] = React.useState(false);
//     React.useEffect(() => {
//       setMounted(true);
//     }, []);
//     if (!mounted) {
//       return <IconButton size="sm" variant="outlined" color="neutral" disabled />;
//     }
//     return (
//       <IconButton
//         id="toggle-mode"
//         size="sm"
//         variant="outlined"
//         color="neutral"
//         aria-label="toggle light/dark mode"
//         {...other}
//         onClick={(event) => {
//           if (mode === 'light') {
//             setMode('dark');
//           } else {
//             setMode('light');
//           }
//           onClick?.(event);
//         }}
//       >
//         {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
//       </IconButton>
//     );
//   }
  
export default function LandingPage() {
  const [mode, setMode] = React.useState<PaletteMode>('dark');
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const LPtheme = createTheme(getLPTheme(mode));

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };



  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <CssBaseline />
      <AppBar mode={mode} toggleColorMode={toggleColorMode} />
      <Outlet />
      <Box sx={{ bgcolor: 'background.default' }}>
        <Divider />
        <Badges />
        <Divider />
        <Footer />
      </Box>

      <ToggleCustomTheme
        showCustomTheme={showCustomTheme}
        toggleCustomTheme={toggleCustomTheme}
      />
    </ThemeProvider>
  );
}
