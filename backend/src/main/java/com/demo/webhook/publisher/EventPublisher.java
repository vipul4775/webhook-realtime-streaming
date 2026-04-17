package com.demo.webhook.publisher;

import com.demo.webhook.model.Event;

// Interface for broadcasting events to connected clients
public interface EventPublisher {
    
    void publish(Event event);
    
    int getActiveConnectionCount();
}
