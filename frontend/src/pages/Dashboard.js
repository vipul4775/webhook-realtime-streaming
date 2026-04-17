import React, { useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Sync as SyncIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { formatTimestamp } from '../utils/dateUtils';
import { calculateEventStatistics } from '../utils/eventUtils';
import StatusChip from '../components/StatusChip';
import './Dashboard.css';

function Dashboard({ 
  events, 
  latestEvent, 
  connectionType, 
  status, 
  error, 
  isLoading, 
  onConnectionTypeChange 
}) {
  // Memoized statistics
  const statistics = useMemo(() => calculateEventStatistics(events), [events]);

  const handleConnectionTypeChange = (_event, newType) => {
    if (newType) {
      onConnectionTypeChange(newType);
    }
  };

  return (
    <Box className="dashboard-container">
      <Paper elevation={3} className="dashboard-header">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <DashboardIcon sx={{ fontSize: 40 }} />
            <Typography variant="h3" component="h1" fontWeight="bold">
              Webhook Analytics Dashboard
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Real-time monitoring and analytics for webhook events
          </Typography>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load events: {error}
          </Alert>
        )}

        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading events...
            </Typography>
          </Box>
        )}

        {!isLoading && (
          <>
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <SpeedIcon color="primary" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          Real-Time Processing
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Events are processed and displayed instantly
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} >
                      <SyncIcon color="primary" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          Dual Protocol Support
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Switch between WebSocket and SSE
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          Live Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Track patterns in real-time
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card elevation={2} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Connection Settings
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Protocol:
                    </Typography>
                    <ToggleButtonGroup
                      value={connectionType}
                      exclusive
                      onChange={handleConnectionTypeChange}
                      color="primary"
                    >
                      <ToggleButton value="ws">WebSocket</ToggleButton>
                      <ToggleButton value="sse">SSE</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <StatusChip status={status} />
                </Box>
              </CardContent>
            </Card>

            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2} className="stat-card stat-card-primary" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <EventIcon sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {statistics.total}
                        </Typography>
                        <Typography variant="body2">Total Events</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2} className="stat-card stat-card-secondary" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TrendingUpIcon sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography 
                          variant="h4" 
                          fontWeight="bold" 
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {statistics.topType ? statistics.topType[0].split('.')[0] : 'N/A'}
                        </Typography>
                        <Typography variant="body2">Top Event Type</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2} className="stat-card stat-card-success" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <CategoryIcon sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {Object.keys(statistics.typeCount).length}
                        </Typography>
                        <Typography variant="body2">Event Types</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2} className="stat-card stat-card-warning" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <InfoIcon sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {latestEvent ? latestEvent.id : '-'}
                        </Typography>
                        <Typography variant="body2">Latest Event ID</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card elevation={2} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Latest Event
                </Typography>
                {latestEvent ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">ID</Typography>
                      <Typography variant="h6">{latestEvent.id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Type</Typography>
                      <Chip label={latestEvent.type} color="primary" sx={{ mt: 0.5 }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Value</Typography>
                      <Typography variant="body1">{latestEvent.value}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Timestamp</Typography>
                      <Typography variant="body2">{formatTimestamp(latestEvent.timestamp)}</Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="info">Waiting for events...</Alert>
                )}
              </CardContent>
            </Card>

            <Card elevation={2} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Event Type Distribution
                </Typography>
                {Object.entries(statistics.typeCount).length > 0 ? (
                  <Box>
                    {Object.entries(statistics.typeCount)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => (
                        <Box key={type} mb={2}>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="body2" fontWeight="bold">{type}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {count} ({((count / statistics.total) * 100).toFixed(1)}%)
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(count / statistics.total) * 100}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                        </Box>
                      ))}
                  </Box>
                ) : (
                  <Alert severity="info">No event data available</Alert>
                )}
              </CardContent>
            </Card>

            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Recent Events (Last 10)
                </Typography>
                {events.length > 0 ? (
                  <List>
                    {events.slice(0, 10).map((event, index) => (
                      <React.Fragment key={event.id}>
                        <ListItem>
                          <Chip 
                            label={event.id} 
                            color="primary" 
                            size="small" 
                            sx={{ mr: 2, minWidth: 50 }} 
                          />
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip label={event.type} size="small" variant="outlined" />
                                <Typography variant="body2" color="text.secondary">
                                  {event.value}
                                </Typography>
                              </Box>
                            }
                            secondary={formatTimestamp(event.timestamp)}
                          />
                        </ListItem>
                        {index < Math.min(events.length, 10) - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">No events yet. Start the generator to see events appear!</Alert>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
}

export default Dashboard;
