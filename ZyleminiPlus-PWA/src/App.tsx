import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Store, { persistor } from './redux/store';
import Routes from './navigation/Routes';
import { initDatabase } from './database/WebDatabase';
import theme from './theme/theme';
import './i18n/i18n';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize SQLite database on app start
    initDatabase().catch((error) => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;

