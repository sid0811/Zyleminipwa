import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Store, { persistor } from './redux/store';
import Routes from './navigation/Routes';
import ErrorBoundary from './components/ErrorBoundary';
import { initDatabase } from './database/WebDatabase';
import theme from './theme/theme';
import './i18n/i18n';
import './App.css';

function App() {
  useEffect(() => {
    console.log('🚀 App component mounted');
    // Initialize SQLite database on app start
    initDatabase()
      .then(() => {
        console.log('✅ Database initialized');
      })
      .catch((error) => {
        console.error('❌ Failed to initialize database:', error);
      });
  }, []);

  console.log('🔄 App component rendering...');

  return (
    <ErrorBoundary>
      <Provider store={Store}>
        <PersistGate 
          loading={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
              <div>Loading Redux state...</div>
            </div>
          } 
          persistor={persistor}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

