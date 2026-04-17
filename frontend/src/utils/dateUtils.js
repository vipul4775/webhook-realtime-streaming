/**
 * Date utility functions
 * Shared helper functions for date/timestamp formatting
 */

/**
 * Formats a timestamp to a localized string
 * Handles both ISO string format and Java LocalDateTime array format
 * 
 * @param {string|Array} timestamp - The timestamp to format
 * @returns {string} Formatted date string or 'Invalid Date'
 */
export const formatTimestamp = (timestamp) => {
  try {
    // Handle Java LocalDateTime serialized as array: [year, month, day, hour, minute, second, nano]
    if (Array.isArray(timestamp)) {
      const [year, month, day, hour, minute, second] = timestamp;
      const date = new Date(year, month - 1, day, hour, minute, second);
      return date.toLocaleString();
    }
    
    // Handle ISO string format
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting timestamp:', timestamp, error);
    return 'Invalid Date';
  }
};
