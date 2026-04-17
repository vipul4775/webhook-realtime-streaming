import { useState, useEffect, useRef, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';

// Custom hook for WebSocket or SSE connections with proper cleanup
export const useRealtimeConnection = (connectionType, onMessage) => {
  const [status, setStatus] = useState('disconnected');
  const connectionRef = useRef(null);
  const isMountedRef = useRef(true);

  // Stable cleanup function
  const cleanup = useCallback(() => {
    const connection = connectionRef.current;
    if (!connection) return;

    try {
      if (connection instanceof WebSocket) {
        // Remove all event listeners before closing
        connection.onopen = null;
        connection.onmessage = null;
        connection.onerror = null;
        connection.onclose = null;
        
        if (connection.readyState === WebSocket.OPEN || 
            connection.readyState === WebSocket.CONNECTING) {
          connection.close();
          logger.debug('WebSocket closed');
        }
      } else if (connection instanceof EventSource) {
        connection.close();
        logger.debug('SSE closed');
      }
    } catch (error) {
      logger.error('Cleanup error:', error);
    } finally {
      connectionRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Cleanup previous connection
    cleanup();
    
    // Update status only if mounted
    const updateStatus = (newStatus) => {
      if (isMountedRef.current) {
        setStatus(newStatus);
      }
    };

    updateStatus('connecting');

    try {
      if (connectionType === 'ws') {
        // WebSocket connection
        const ws = new WebSocket(API_ENDPOINTS.WS);
        connectionRef.current = ws;

        ws.onopen = () => {
          logger.info('WebSocket connected');
          updateStatus('connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            logger.error('Failed to parse WS message:', error);
          }
        };

        ws.onerror = (error) => {
          logger.error('WebSocket error:', error);
          updateStatus('error');
        };

        ws.onclose = (event) => {
          logger.info('WebSocket closed:', event.code, event.reason);
          updateStatus('disconnected');
        };
      } else if (connectionType === 'sse') {
        // SSE connection
        const es = new EventSource(API_ENDPOINTS.SSE);
        connectionRef.current = es;

        es.onopen = () => {
          logger.info('SSE connected');
          updateStatus('connected');
        };

        es.addEventListener('event', (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            logger.error('Failed to parse SSE message:', error);
          }
        });

        es.onerror = (error) => {
          logger.error('SSE error:', error);
          // SSE automatically reconnects, check readyState
          if (es.readyState === EventSource.CLOSED) {
            updateStatus('disconnected');
          } else {
            updateStatus('error');
          }
        };
      }
    } catch (error) {
      logger.error('Connection failed:', error);
      updateStatus('error');
    }

    // Cleanup on unmount or connection type change
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [connectionType, onMessage, cleanup]);

  return status;
};
