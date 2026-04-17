import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, CONFIG } from '../config/api';
import { addEventWithLimit } from '../utils/eventUtils';
import { logger } from '../utils/logger';

/**
 * Custom hook to manage events data
 * Handles initial fetch and provides callback for new events
 * 
 * @returns {Object} { events, latestEvent, addEvent, error, isLoading }
 */
export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [latestEvent, setLatestEvent] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(API_ENDPOINTS.EVENTS);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Create a new reversed array (don't mutate original)
        const reversedData = [...data].reverse();
        
        // Apply limit to initial data
        const limitedData = reversedData.slice(0, CONFIG.MAX_EVENTS);
        
        setEvents(limitedData);
        
        if (limitedData.length > 0) {
          setLatestEvent(limitedData[0]);
        }
        
        logger.info(`Loaded ${limitedData.length} initial events`);
      } catch (err) {
        logger.error('Failed to fetch initial events:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Stable callback for adding new events
  const addEvent = useCallback((newEvent) => {
    setEvents(prev => addEventWithLimit(prev, newEvent));
    setLatestEvent(newEvent);
  }, []);

  return {
    events,
    latestEvent,
    addEvent,
    error,
    isLoading,
  };
};
