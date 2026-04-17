package com.demo.webhook.controller;

import com.demo.webhook.publisher.SSEEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

// Provides SSE streaming for real-time event updates
@RestController
@RequestMapping("/sse")
public class SSEController {
    
    private static final Logger logger = LoggerFactory.getLogger(SSEController.class);
    private final SSEEventPublisher sseEventPublisher;
    
    public SSEController(SSEEventPublisher sseEventPublisher) {
        this.sseEventPublisher = sseEventPublisher;
        logger.info("SSE controller ready");
    }
    
    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEvents() {
        logger.info("New SSE connection (active: {})", 
            sseEventPublisher.getActiveConnectionCount());
        
        try {
            SseEmitter emitter = sseEventPublisher.createEmitter();
            logger.debug("SSE emitter created");
            return emitter;
            
        } catch (Exception e) {
            logger.error("Failed to create SSE emitter", e);
            throw new RuntimeException("Failed to create SSE connection", e);
        }
    }
}
