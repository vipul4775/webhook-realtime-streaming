package com.demo.webhook.service;

import com.demo.webhook.model.Event;
import com.demo.webhook.model.EventPayload;
import com.demo.webhook.publisher.EventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EventServiceTest {

    private EventService eventService;
    private EventPublisher mockPublisher;

    @BeforeEach
    void setUp() {
        mockPublisher = mock(EventPublisher.class);
        eventService = new EventService(mockPublisher);
    }

    @Test
    void saveEvent_shouldGenerateUniqueId() {
        EventPayload payload1 = new EventPayload("user.created", "value1");
        EventPayload payload2 = new EventPayload("order.placed", "value2");

        Event event1 = eventService.saveEvent(payload1);
        Event event2 = eventService.saveEvent(payload2);

        assertNotNull(event1.getId());
        assertNotNull(event2.getId());
        assertNotEquals(event1.getId(), event2.getId());
    }

    @Test
    void saveEvent_shouldSetTimestamp() {
        EventPayload payload = new EventPayload("user.created", "value1");

        Event event = eventService.saveEvent(payload);

        assertNotNull(event.getTimestamp());
    }

    @Test
    void saveEvent_shouldStoreEventData() {
        EventPayload payload = new EventPayload("user.created", "value1");

        Event event = eventService.saveEvent(payload);

        assertEquals("user.created", event.getType());
        assertEquals("value1", event.getValue());
    }

    @Test
    void getAllEvents_shouldReturnEmptyListInitially() {
        List<Event> events = eventService.getAllEvents();

        assertNotNull(events);
        assertTrue(events.isEmpty());
    }

    @Test
    void getAllEvents_shouldReturnAllStoredEvents() {
        EventPayload payload1 = new EventPayload("user.created", "value1");
        EventPayload payload2 = new EventPayload("order.placed", "value2");

        eventService.saveEvent(payload1);
        eventService.saveEvent(payload2);

        List<Event> events = eventService.getAllEvents();

        assertEquals(2, events.size());
    }

    @Test
    void saveEvent_shouldGenerateSequentialIds() {
        EventPayload payload1 = new EventPayload("event1", "value1");
        EventPayload payload2 = new EventPayload("event2", "value2");
        EventPayload payload3 = new EventPayload("event3", "value3");

        Event event1 = eventService.saveEvent(payload1);
        Event event2 = eventService.saveEvent(payload2);
        Event event3 = eventService.saveEvent(payload3);

        assertTrue(event1.getId() < event2.getId());
        assertTrue(event2.getId() < event3.getId());
    }

    @Test
    void broadcastEvent_shouldCallPublisher() {
        EventPayload payload = new EventPayload("test.event", "test-value");
        Event event = eventService.saveEvent(payload);

        eventService.broadcastEvent(event);

        verify(mockPublisher, times(1)).publish(event);
    }
}
