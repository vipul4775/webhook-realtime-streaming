import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './theme/theme';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import EventsPage from './pages/EventsPage';
import { useRealtimeConnection } from './hooks/useRealtimeConnection';
import { useEvents } from './hooks/useEvents';

function App() {
  const [connectionType, setConnectionType] = useState('ws');
  const { events, latestEvent, addEvent, error, isLoading } = useEvents();
  const status = useRealtimeConnection(connectionType, addEvent);

  const handleConnectionTypeChange = useCallback((newType) => {
    setConnectionType(newType);
  }, []);

  // Shared props for all pages
  const sharedProps = {
    events,
    latestEvent,
    connectionType,
    status,
    error,
    isLoading,
    onConnectionTypeChange: handleConnectionTypeChange,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard {...sharedProps} />} />
            <Route path="/events" element={<EventsPage {...sharedProps} />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
