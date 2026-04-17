package com.demo.webhook.publisher;

import com.demo.webhook.model.Event;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

// WebSocket implementation for broadcasting events
@Component
public class WebSocketEventPublisher implements EventPublisher {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventPublisher.class);
    private final List<WebSocketSession> activeSessions;
    private final ObjectMapper objectMapper;
    
    public WebSocketEventPublisher(ObjectMapper objectMapper) {
        this.activeSessions = new CopyOnWriteArrayList<>();
        this.objectMapper = objectMapper;
        logger.info("WebSocket publisher ready");
    }
    
    // Adds a new WebSocket session
    public void addSession(WebSocketSession session) {
        activeSessions.add(session);
        logger.info("WS session added: {} (active: {})", 
            session.getId(), activeSessions.size());
    }
    
    // Removes a WebSocket session
    public void removeSession(WebSocketSession session) {
        activeSessions.remove(session);
        logger.info("WS session removed: {} (active: {})", 
            session.getId(), activeSessions.size());
    }
    
    @Override
    public void publish(Event event) {
        if (activeSessions.isEmpty()) {
            logger.debug("No WS clients");
            return;
        }
        
        try {
            String message = objectMapper.writeValueAsString(event);
            List<WebSocketSession> sessionsToRemove = new ArrayList<>();
            
            for (WebSocketSession session : activeSessions) {
                if (!session.isOpen()) {
                    sessionsToRemove.add(session);
                    continue;
                }
                
                try {
                    synchronized (session) {
                        // Synchronize to prevent concurrent sends on same session
                        session.sendMessage(new TextMessage(message));
                    }
                } catch (IOException e) {
                    logger.warn("WS send failed for {}: {}", 
                        session.getId(), e.getMessage());
                    sessionsToRemove.add(session);
                }
            }
            
            // Clean up failed/closed sessions
            if (!sessionsToRemove.isEmpty()) {
                activeSessions.removeAll(sessionsToRemove);
                logger.debug("Removed {} dead WS sessions", sessionsToRemove.size());
            }
            
            logger.debug("Event {} sent to {} WS clients", 
                event.getId(), activeSessions.size());
                
        } catch (Exception e) {
            logger.error("WS broadcast failed", e);
        }
    }
    
    @Override
    public int getActiveConnectionCount() {
        return activeSessions.size();
    }
}
