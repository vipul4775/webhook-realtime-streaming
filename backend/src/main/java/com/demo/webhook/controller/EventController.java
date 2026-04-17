package com.demo.webhook.controller;

import com.demo.webhook.model.Event;
import com.demo.webhook.service.EventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Provides read-only access to stored events
@RestController
@RequestMapping("/events")
public class EventController {
    
    private static final Logger logger = LoggerFactory.getLogger(EventController.class);
    private final EventService eventService;
    
    public EventController(EventService eventService) {
        this.eventService = eventService;
        logger.info("Event controller ready");
    }
    
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        logger.debug("Fetching all events");
        
        try {
            List<Event> events = eventService.getAllEvents();
            logger.debug("Found {} events", events.size());
            return ResponseEntity.ok(events);
            
        } catch (Exception e) {
            logger.error("Failed to fetch events", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
