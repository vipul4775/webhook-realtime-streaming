import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { formatTimestamp } from '../utils/dateUtils';
import StatusChip from '../components/StatusChip';
import './EventsPage.css';

function EventsPage({ 
  events, 
  connectionType, 
  status, 
  error, 
  isLoading, 
  onConnectionTypeChange 
}) {
  const handleConnectionTypeChange = (_event, newType) => {
    if (newType) {
      onConnectionTypeChange(newType);
    }
  };

  return (
    <Box className="events-page-container">
      <Paper elevation={3} className="events-page-header">
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Webhook Events
          </Typography>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load events: {error}
          </Alert>
        )}

        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Connection Protocol:
                </Typography>
                <ToggleButtonGroup
                  value={connectionType}
                  exclusive
                  onChange={handleConnectionTypeChange}
                  color="primary"
                >
                  <ToggleButton value="ws">WebSocket</ToggleButton>
                  <ToggleButton value="sse">Server-Sent Events</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <StatusChip status={status} />
            </Box>
          </CardContent>
        </Card>

        <Paper elevation={2}>
          <Box p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Events
              </Typography>
              <Chip 
                label={`${events.length} ${events.length === 1 ? 'event' : 'events'}`}
                color="primary"
              />
            </Box>

            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Loading events...
                </Typography>
              </Box>
            ) : events.length === 0 ? (
              <Alert severity="info">
                No events yet. Start the generator to see events appear!
              </Alert>
            ) : (
              <TableContainer className="events-table-container">
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Value</strong></TableCell>
                      <TableCell><strong>Timestamp</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow 
                        key={event.id}
                        hover
                        className="events-table-row"
                      >
                        <TableCell>
                          <Chip label={event.id} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Chip label={event.type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{event.value}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatTimestamp(event.timestamp)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default EventsPage;
