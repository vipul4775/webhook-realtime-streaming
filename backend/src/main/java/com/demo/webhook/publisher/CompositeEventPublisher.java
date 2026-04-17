package com.demo.webhook.publisher;

import com.demo.webhook.model.Event;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;

// Broadcasts events to multiple publishers (WebSocket + SSE)
@Component
@Primary
public class CompositeEventPublisher implements EventPublisher {
    
    private static final Logger logger = LoggerFactory.getLogger(CompositeEventPublisher.class);
    private final List<EventPublisher> publishers;
    
    public CompositeEventPublisher(List<EventPublisher> publishers) {
        this.publishers = publishers;
        logger.info("Composite publisher ready ({} publishers)", publishers.size());
    }
    
    @Override
    public void publish(Event event) {
        logger.debug("Broadcasting {} to {} publishers", event.getId(), publishers.size());
        
        for (EventPublisher publisher : publishers) {
            try {
                publisher.publish(event);
            } catch (Exception e) {
                // Log but don't fail - one publisher failure shouldn't affect others
                logger.error("{} failed for event {}", 
                    publisher.getClass().getSimpleName(), event.getId(), e);
            }
        }
    }
    
    @Override
    public int getActiveConnectionCount() {
        return publishers.stream()
            .mapToInt(EventPublisher::getActiveConnectionCount)
            .sum();
    }
}
