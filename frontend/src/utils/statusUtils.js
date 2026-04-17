/**
 * Status utility functions
 * Shared helper functions for connection status handling
 */

import {
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';

/**
 * Gets the Material-UI color for a given status
 * 
 * @param {string} status - Connection status
 * @returns {string} Material-UI color name
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'connected':
      return 'success';
    case 'connecting':
      return 'info';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Gets the appropriate icon component for a given status
 * 
 * @param {string} status - Connection status
 * @returns {JSX.Element} Icon component
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'connected':
      return WifiIcon;
    case 'connecting':
      return SyncIcon;
    case 'error':
      return ErrorIcon;
    default:
      return WifiOffIcon;
  }
};

/**
 * Checks if a status indicates an active connection
 * 
 * @param {string} status - Connection status
 * @returns {boolean} True if connected or connecting
 */
export const isActiveStatus = (status) => {
  return status === 'connected' || status === 'connecting';
};
