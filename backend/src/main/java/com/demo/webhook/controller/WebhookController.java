package com.demo.webhook.controller;

import com.demo.webhook.model.Event;
import com.demo.webhook.model.EventPayload;
import com.demo.webhook.service.EventService;
import com.demo.webhook.util.SignatureUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Receives webhook events and verifies HMAC signatures
@RestController
@RequestMapping("/webhooks")
public class WebhookController {
    
    private static final Logger logger = LoggerFactory.getLogger(WebhookController.class);
    private static final String SIGNATURE_HEADER = "X-Signature";
    
    private final EventService eventService;
    private final ObjectMapper objectMapper;
    private final String webhookSecret;
    
    public WebhookController(
            EventService eventService,
            ObjectMapper objectMapper,
            @Value("${webhook.secret}") String webhookSecret) {
        this.eventService = eventService;
        this.objectMapper = objectMapper;
        this.webhookSecret = webhookSecret;
        logger.info("Webhook controller ready");
    }
    
    // Verifies HMAC signature before processing webhook event
    @PostMapping("/events")
    public ResponseEntity<?> receiveWebhook(
            @RequestHeader(value = SIGNATURE_HEADER, required = false) String signature,
            @Valid @RequestBody EventPayload payload) {
        
        logger.debug("Webhook received: {} = {}", payload.getType(), payload.getValue());
        
        try {
            // Serialize payload to JSON for signature verification
            String payloadJson = objectMapper.writeValueAsString(payload);
            
            // Verify signature
            if (!SignatureUtil.verifySignature(payloadJson, signature, webhookSecret)) {
                logger.warn("Invalid signature for {}", payload.getType());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid signature");
            }
            
            // Process event
            Event event = eventService.saveEvent(payload);
            eventService.broadcastEvent(event);
            
            logger.info("Event {} saved: {}", event.getId(), event.getType());
            return ResponseEntity.ok(event);
            
        } catch (Exception e) {
            logger.error("Webhook processing failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error");
        }
    }
}
