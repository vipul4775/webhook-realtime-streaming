/**
 * Logging utility
 * Consistent logging across the application
 */

const LOG_PREFIX = '[WebhookDemo]';

export const logger = {
  info: (message, ...args) => {
    console.log(`${LOG_PREFIX} ${message}`, ...args);
  },
  
  error: (message, ...args) => {
    console.error(`${LOG_PREFIX} ERROR: ${message}`, ...args);
  },
  
  warn: (message, ...args) => {
    console.warn(`${LOG_PREFIX} WARNING: ${message}`, ...args);
  },
  
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${LOG_PREFIX} DEBUG: ${message}`, ...args);
    }
  },
};
