import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  List as ListIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="sticky" elevation={3}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <NotificationsIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, fontSize: '1.5rem' }}
          >
            Webhook Demo
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component={Link}
              to="/"
              color="inherit"
              startIcon={<DashboardIcon />}
              variant={isActive('/') ? 'outlined' : 'text'}
              className={isActive('/') ? 'nav-button-active' : 'nav-button'}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              to="/events"
              color="inherit"
              startIcon={<ListIcon />}
              variant={isActive('/events') ? 'outlined' : 'text'}
              className={isActive('/events') ? 'nav-button-active' : 'nav-button'}
            >
              Events
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navigation;
