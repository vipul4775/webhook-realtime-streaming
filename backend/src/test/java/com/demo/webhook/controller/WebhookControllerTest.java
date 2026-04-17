package com.demo.webhook.controller;

import com.demo.webhook.model.EventPayload;
import com.demo.webhook.util.SignatureUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class WebhookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    
    @Value("${webhook.secret}")
    private String webhookSecret;

    @Test
    void receiveWebhook_withValidSignature_returnsCreatedEvent() throws Exception {
        EventPayload payload = new EventPayload("test.event", "test123");
        String payloadJson = objectMapper.writeValueAsString(payload);
        String signature = SignatureUtil.generateSignature(payloadJson, webhookSecret);

        mockMvc.perform(post("/webhooks/events")
                .header("X-Signature", signature)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payloadJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.type").value("test.event"))
                .andExpect(jsonPath("$.value").value("test123"))
                .andExpect(jsonPath("$.timestamp").exists());
    }
    
    @Test
    void receiveWebhook_withInvalidSignature_returnsUnauthorized() throws Exception {
        EventPayload payload = new EventPayload("test.event", "test123");
        String payloadJson = objectMapper.writeValueAsString(payload);
        String invalidSignature = "invalid-signature-12345";

        mockMvc.perform(post("/webhooks/events")
                .header("X-Signature", invalidSignature)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payloadJson))
                .andExpect(status().isUnauthorized());
    }
    
    @Test
    void receiveWebhook_withMissingSignature_returnsUnauthorized() throws Exception {
        EventPayload payload = new EventPayload("test.event", "test123");

        mockMvc.perform(post("/webhooks/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void receiveWebhook_withEmptyType_returnsBadRequest() throws Exception {
        EventPayload payload = new EventPayload("", "test123");
        String payloadJson = objectMapper.writeValueAsString(payload);
        String signature = SignatureUtil.generateSignature(payloadJson, webhookSecret);

        mockMvc.perform(post("/webhooks/events")
                .header("X-Signature", signature)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payloadJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void receiveWebhook_withNullType_returnsBadRequest() throws Exception {
        String jsonPayload = "{\"type\": null, \"value\": \"test123\"}";
        String signature = SignatureUtil.generateSignature(jsonPayload, webhookSecret);

        mockMvc.perform(post("/webhooks/events")
                .header("X-Signature", signature)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void receiveWebhook_withMissingType_returnsBadRequest() throws Exception {
        String jsonPayload = "{\"value\": \"test123\"}";
        String signature = SignatureUtil.generateSignature(jsonPayload, webhookSecret);

        mockMvc.perform(post("/webhooks/events")
                .header("X-Signature", signature)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void receiveWebhook_withNullValue_returnsBadRequest() throws Exception {
        String jsonPayload = "{\"type\": \"test.event\", \"value\": null}";
        String signature = SignatureUtil.generateSignature(jsonPayload, webhookSecret);

        mockMvc.perform(post("/webhooks/events")
                .header("X-Signature", signature)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void receiveWebhook_withEmptyValue_returnsOk() throws Exception {
        EventPayload payload = new EventPayload("test.event", "");
        String payloadJson = objectMapper.writeValueAsString(payload);
        String signature = SignatureUtil.generateSignature(payloadJson, webhookSecret);

        mockMvc.perform(post("/webhooks/events")
                .header("X-Signature", signature)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payloadJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.value").value(""));
    }
}
