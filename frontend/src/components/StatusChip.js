import React from 'react';
import { Chip } from '@mui/material';
import { getStatusColor, getStatusIcon } from '../utils/statusUtils';
import './StatusChip.css';

/**
 * StatusChip component
 * Displays connection status with appropriate icon and color
 * 
 * @param {Object} props
 * @param {string} props.status - Connection status
 * @param {string} props.size - Chip size (default: 'large')
 */
function StatusChip({ status, size = 'large' }) {
  const StatusIcon = getStatusIcon(status);
  const isConnecting = status === 'connecting';

  return (
    <Chip
      icon={<StatusIcon className={isConnecting ? 'rotating-icon' : ''} />}
      label={status.toUpperCase()}
      color={getStatusColor(status)}
      size={size}
      sx={{ px: 2, py: 3, fontSize: '1rem', fontWeight: 'bold' }}
    />
  );
}

export default StatusChip;
