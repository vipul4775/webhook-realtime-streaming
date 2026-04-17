package com.demo.webhook.publisher;

import com.demo.webhook.model.Event;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

// SSE implementation for broadcasting events
@Component
public class SSEEventPublisher implements EventPublisher {
    
    private static final Logger logger = LoggerFactory.getLogger(SSEEventPublisher.class);
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L; // 30 minutes
    
    private final List<SseEmitter> activeEmitters;
    
    public SSEEventPublisher() {
        this.activeEmitters = new CopyOnWriteArrayList<>();
        logger.info("SSE publisher ready");
    }
    
    // Creates and registers a new SSE emitter
    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        activeEmitters.add(emitter);
        
        emitter.onCompletion(() -> {
            activeEmitters.remove(emitter);
            logger.debug("SSE completed (active: {})", activeEmitters.size());
        });
        
        emitter.onTimeout(() -> {
            activeEmitters.remove(emitter);
            logger.debug("SSE timeout (active: {})", activeEmitters.size());
        });
        
        emitter.onError((e) -> {
            activeEmitters.remove(emitter);
            logger.warn("SSE error: {}", e.getMessage());
        });
        
        logger.info("SSE emitter created (active: {})", activeEmitters.size());
        return emitter;
    }
    
    @Override
    public void publish(Event event) {
        if (activeEmitters.isEmpty()) {
            logger.debug("No SSE clients");
            return;
        }
        
        List<SseEmitter> emittersToRemove = new ArrayList<>();
        
        for (SseEmitter emitter : activeEmitters) {
            try {
                emitter.send(SseEmitter.event()
                    .name("event")
                    .data(event));
            } catch (IOException e) {
                logger.warn("SSE send failed: {}", e.getMessage());
                emittersToRemove.add(emitter);
                try {
                    emitter.completeWithError(e);
                } catch (Exception ex) {
                    logger.debug("Error completing emitter: {}", ex.getMessage());
                }
            }
        }
        
        // Clean up failed emitters
        if (!emittersToRemove.isEmpty()) {
            activeEmitters.removeAll(emittersToRemove);
            logger.debug("Removed {} dead SSE emitters", emittersToRemove.size());
        }
        
        logger.debug("Event {} sent to {} SSE clients", 
            event.getId(), activeEmitters.size());
    }
    
    @Override
    public int getActiveConnectionCount() {
        return activeEmitters.size();
    }
}
