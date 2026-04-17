# Backend - Spring Boot Webhook Server

Spring Boot application that receives webhooks, verifies signatures, and broadcasts events via WebSocket and SSE.

## Features

- ✅ Webhook endpoint with HMAC signature verification
- ✅ WebSocket support for real-time updates
- ✅ Server-Sent Events (SSE) support
- ✅ In-memory event storage
- ✅ Composite publisher pattern
- ✅ Comprehensive error handling

## Prerequisites

- Java 17 or higher
- Maven 3.6+

## Installation

```bash
cd backend
mvn clean install
```

## Running

```bash
mvn spring-boot:run
```

Server starts on `http://localhost:8080`

## Configuration

Edit `src/main/resources/application.properties`:

```properties
# Server configuration
server.port=8080

# Webhook security
webhook.secret=my-super-secret-key-change-in-production

# CORS (adjust for production)
cors.allowed-origins=http://localhost:3000
```

## API Endpoints

### Receive Webhook
```http
POST /webhooks/events
Content-Type: application/json
X-Signature: sha256=<signature>

{
  "type": "user.created",
  "value": "user-123"
}
```

**Response**: `200 OK` with created event

**Error Responses**:
- `401 Unauthorized` - Invalid or missing signature
- `400 Bad Request` - Invalid payload
- `500 Internal Server Error` - Server error

### Get All Events
```http
GET /events
```

**Response**: Array of events

### WebSocket Connection
```
ws://localhost:8080/ws
```

Receives JSON events in real-time.

### SSE Connection
```http
GET /sse/events
Accept: text/event-stream
```

Receives server-sent events.

## Architecture

### Controllers
- `WebhookController` - Receives and validates webhooks
- `EventController` - REST API for events
- `SSEController` - SSE endpoint

### Services
- `EventService` - Event storage and broadcasting

### Publishers
- `EventPublisher` - Interface for broadcasting
- `WebSocketEventPublisher` - WebSocket implementation
- `SSEEventPublisher` - SSE implementation
- `CompositeEventPublisher` - Broadcasts to all publishers

### Security
- `SignatureUtil` - HMAC SHA256 verification

## Testing

Run all tests:
```bash
mvn test
```

Run specific test:
```bash
mvn test -Dtest=WebhookControllerTest
```

## HMAC Signature Generation

The signature is computed as:
```
HMAC-SHA256(payload_json, secret_key) -> hex_string
```

Example in Java:
```java
Mac hmac = Mac.getInstance("HmacSHA256");
SecretKeySpec key = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
hmac.init(key);
byte[] hash = hmac.doFinal(payload.getBytes());
String signature = bytesToHex(hash);
```

## Production Considerations

- Store secret in environment variable or secrets manager
- Add rate limiting
- Implement persistent storage (PostgreSQL, MongoDB)
- Add authentication for WebSocket/SSE
- Configure CORS properly
- Add monitoring and metrics
- Implement connection limits

## Troubleshooting

### Port already in use
```bash
# Find process using port 8080
lsof -i :8080  # Mac/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process or change port in application.properties
```

### Signature verification fails
- Ensure secret matches between backend and generator
- Check payload serialization (must be identical)
- Verify signature is sent in `X-Signature` header

### WebSocket connection fails
- Check CORS configuration
- Verify WebSocket URL format: `ws://` not `http://`
- Check firewall settings
