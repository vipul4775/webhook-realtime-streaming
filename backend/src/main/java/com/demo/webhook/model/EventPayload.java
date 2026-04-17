package com.demo.webhook.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EventPayload {
    @NotBlank(message = "Event type must not be null or empty")
    private String type;
    
    @NotNull(message = "Event value must not be null")
    private String value;

    public EventPayload() {
    }

    public EventPayload(String type, String value) {
        this.type = type;
        this.value = value;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
