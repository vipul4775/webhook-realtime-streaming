package com.demo.webhook.controller;

import com.demo.webhook.publisher.SSEEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.junit.jupiter.api.Assertions.*;

class SSEControllerTest {

    private SSEController controller;
    private SSEEventPublisher publisher;

    @BeforeEach
    void setUp() {
        // Use real SSEEventPublisher - it's a simple component with no external dependencies
        publisher = new SSEEventPublisher();
        controller = new SSEController(publisher);
    }

    @Test
    void testStreamEventsCreatesEmitter() {
        SseEmitter emitter = controller.streamEvents();
        
        assertNotNull(emitter);
        assertEquals(1, publisher.getActiveConnectionCount());
    }
    
    @Test
    void testMultipleEmittersCanBeCreated() {
        SseEmitter emitter1 = controller.streamEvents();
        SseEmitter emitter2 = controller.streamEvents();
        
        assertNotNull(emitter1);
        assertNotNull(emitter2);
        assertNotSame(emitter1, emitter2);
        assertEquals(2, publisher.getActiveConnectionCount());
    }
}
