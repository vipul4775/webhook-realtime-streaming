package com.demo.webhook.service;

import com.demo.webhook.model.Event;
import com.demo.webhook.model.EventPayload;
import com.demo.webhook.publisher.EventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

// Handles event creation, storage, and broadcasting
@Service
public class EventService {
    
    private static final Logger logger = LoggerFactory.getLogger(EventService.class);
    private static final int MAX_EVENTS = 10000; // Prevent memory growth
    
    private final List<Event> eventStore;
    private final AtomicLong idGenerator;
    private final EventPublisher eventPublisher;
    
    public EventService(EventPublisher eventPublisher) {
        this.eventStore = Collections.synchronizedList(new ArrayList<>());
        this.idGenerator = new AtomicLong(1);
        this.eventPublisher = eventPublisher;
        logger.info("Event service ready (max: {})", MAX_EVENTS);
    }
    
    public Event saveEvent(EventPayload payload) {
        logger.debug("Saving {}", payload.getType());
        
        try {
            Long id = idGenerator.getAndIncrement();
            LocalDateTime timestamp = LocalDateTime.now();
            Event event = new Event(id, payload.getType(), payload.getValue(), timestamp);
            
            // Add event to store with size limit
            synchronized (eventStore) {
                eventStore.add(event);
                
                // Enforce size limit by removing oldest events
                if (eventStore.size() > MAX_EVENTS) {
                    int toRemove = eventStore.size() - MAX_EVENTS;
                    eventStore.subList(0, toRemove).clear();
                    logger.warn("Store full, removed {} old events", toRemove);
                }
            }
            
            logger.info("Saved event {}: {}", event.getId(), event.getType());
            return event;
            
        } catch (Exception e) {
            logger.error("Failed to save event", e);
            throw new RuntimeException("Failed to save event", e);
        }
    }
    
    // Broadcasts event to all connected clients (WebSocket + SSE)
    public void broadcastEvent(Event event) {
        logger.debug("Broadcasting event {}", event.getId());
        
        try {
            eventPublisher.publish(event);
            logger.debug("Broadcast complete (connections: {})", 
                eventPublisher.getActiveConnectionCount());
        } catch (Exception e) {
            // Log but don't fail - broadcasting failure shouldn't affect event storage
            logger.error("Broadcast failed for event {}", event.getId(), e);
        }
    }
    
    public List<Event> getAllEvents() {
        synchronized (eventStore) {
            logger.debug("Fetching {} events", eventStore.size());
            return new ArrayList<>(eventStore);
        }
    }
    
    public int getEventCount() {
        return eventStore.size();
    }
    
    public int getActiveConnectionCount() {
        return eventPublisher.getActiveConnectionCount();
    }
}
