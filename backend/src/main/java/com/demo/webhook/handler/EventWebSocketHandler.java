package com.demo.webhook.handler;

import com.demo.webhook.publisher.WebSocketEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

// Manages WebSocket connections and delegates to publisher
@Component
public class EventWebSocketHandler extends TextWebSocketHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(EventWebSocketHandler.class);
    private final WebSocketEventPublisher webSocketEventPublisher;
    
    public EventWebSocketHandler(WebSocketEventPublisher webSocketEventPublisher) {
        this.webSocketEventPublisher = webSocketEventPublisher;
        logger.info("WebSocket handler ready");
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        logger.info("WS connected: {} from {}", 
            session.getId(), session.getRemoteAddress());
        
        try {
            webSocketEventPublisher.addSession(session);
        } catch (Exception e) {
            logger.error("Failed to register WS session {}", session.getId(), e);
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        logger.info("WS closed: {} (code: {}, reason: {})", 
            session.getId(), status.getCode(), status.getReason());
        
        try {
            webSocketEventPublisher.removeSession(session);
        } catch (Exception e) {
            logger.error("Failed to unregister WS session {}", session.getId(), e);
        }
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // No client-to-server messages expected
        logger.debug("WS message from {}: {}", 
            session.getId(), message.getPayload());
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        logger.error("WS transport error for {}", session.getId(), exception);
        
        try {
            webSocketEventPublisher.removeSession(session);
        } catch (Exception e) {
            logger.error("Failed to remove session after error", e);
        }
    }
}
