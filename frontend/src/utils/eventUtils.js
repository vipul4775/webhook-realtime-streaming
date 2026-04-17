/**
 * Event utility functions
 * Helper functions for event data manipulation
 */

import { CONFIG } from '../config/api';

/**
 * Adds a new event to the events array and limits the total size
 * 
 * @param {Array} currentEvents - Current events array
 * @param {Object} newEvent - New event to add
 * @returns {Array} Updated events array with size limit applied
 */
export const addEventWithLimit = (currentEvents, newEvent) => {
  const updatedEvents = [newEvent, ...currentEvents];
  
  // Limit array size to prevent memory growth
  if (updatedEvents.length > CONFIG.MAX_EVENTS) {
    return updatedEvents.slice(0, CONFIG.MAX_EVENTS);
  }
  
  return updatedEvents;
};

/**
 * Calculates statistics from events array
 * 
 * @param {Array} events - Events array
 * @returns {Object} Statistics object with total, typeCount, and topType
 */
export const calculateEventStatistics = (events) => {
  const typeCount = {};
  
  events.forEach(event => {
    typeCount[event.type] = (typeCount[event.type] || 0) + 1;
  });

  const topType = Object.keys(typeCount).length > 0 
    ? Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0] 
    : null;

  return {
    total: events.length,
    typeCount,
    topType,
  };
};
