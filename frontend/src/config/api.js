/**
 * API Configuration
 * Central configuration for all API endpoints
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';

export const API_ENDPOINTS = {
  EVENTS: `${API_BASE_URL}/events`,
  WEBHOOKS: `${API_BASE_URL}/webhooks/events`,
  SSE: `${API_BASE_URL}/sse/events`,
  WS: `${WS_BASE_URL}/ws`,
};

export const CONFIG = {
  MAX_EVENTS: 1000, // Maximum number of events to keep in memory
  RECONNECT_DELAY: 3000, // Delay before attempting reconnection (ms)
};
