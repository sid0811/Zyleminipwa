import { createTheme } from '@mui/material/styles';
import { Colors } from './colors';

// Theme configured to match original React Native app colors and styling
const theme = createTheme({
  palette: {
    primary: {
      main: Colors.primary,
      light: Colors.primary,
      dark: Colors.primaryDark,
    },
    secondary: {
      main: Colors.seconadary,
    },
    background: {
      default: Colors.mainBackground,
      paper: Colors.white,
    },
    text: {
      primary: Colors.textBlack,
      secondary: Colors.DarkBrown,
    },
  },
  typography: {
    fontFamily: [
      'Proxima Nova',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          borderRadius: 8,
          fontWeight: 'bold',
        },
      },
    },
  },
});

export default theme;

