# Real-Time Event Pipeline (Webhooks + WebSocket + SSE)

Production-ready real-time event pipeline using Webhooks, WebSocket, and Server-Sent Events (SSE), built with Spring Boot and React for streaming live updates to frontend applications.

This project simulates real-world webhook providers and demonstrates production-ready patterns for ingesting, verifying, and streaming events to live clients.

## 💡 The Problem

Traditional polling is inefficient - clients repeatedly ask "any updates?" wasting bandwidth and adding latency. This project demonstrates real-time push architecture: webhooks deliver events to your backend, which instantly streams them to connected clients via WebSocket or SSE.

## 🎯 Use Cases

- **Payment Processing**: Real-time payment status updates (Stripe, Razorpay webhooks)
- **Call Tracking**: Live call status and analytics dashboards
- **Order Management**: Instant order status updates across systems
- **Notifications**: Push notifications to web/mobile clients without polling

## 🎯 What You'll Learn

- **Webhook Security**: HMAC SHA256 signature verification (like Stripe/Razorpay)
- **Real-Time Updates**: WebSocket and SSE implementation in Spring Boot
- **Frontend Integration**: React hooks for WebSocket/SSE connections
- **Event Broadcasting**: Composite pattern for multi-protocol support
- **Production Patterns**: Error handling, connection management, and cleanup

## 🔄 WebSocket vs SSE

| Feature | WebSocket | SSE |
|---------|-----------|-----|
| **Direction** | Bi-directional | Server → Client only |
| **Complexity** | Higher | Lower |
| **Best For** | Chat, gaming, collaborative editing | Live feeds, notifications, dashboards |
| **Reconnection** | Manual | Automatic |

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Generator  │─────▶│   Backend    │◀────▶│  Frontend   │
│  (Webhook)  │ POST │ Spring Boot  │ WS/  │   React     │
│             │      │              │ SSE  │             │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  In-Memory   │
                     │    Store     │
                     └──────────────┘
```
This flow shows how webhook events are ingested, processed, and pushed to clients in real-time.
It ensures low-latency, event-driven updates without relying on polling.

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Node.js 16+
- Maven 3.6+

### Run Everything

```bash
# Clone the repository
git clone https://github.com/vipul4775/webhook-realtime-streaming.git
cd webhook-realtime-streaming

# Using Makefile (Linux/Mac - recommended)
make run      # Auto-install dependencies and start all services

# Or manually
make install  # Install dependencies
make start    # Start all services

# Or using startup scripts
chmod +x start-all.sh
./start-all.sh  # Linux/Mac
start-all.bat   # Windows
```

This starts:
- Backend on `http://localhost:8080`
- Frontend on `http://localhost:3000`
- Generator sending events every second

### Using Makefile Commands

```bash
# View all available commands
make help

# Quick start (auto-install + start)
make run              # Recommended for first-time setup

# Common commands
make install          # Install all dependencies
make start            # Start all services
make stop             # Stop all services
make restart          # Restart all services
make test             # Run tests
make build            # Build for production
make logs             # View logs
make health           # Check service health
make clean            # Clean build artifacts
```

### Manual Setup

See individual README files:
- [Backend Setup](./backend/README.md)
- [Frontend Setup](./frontend/README.md)
- [Generator Setup](./generator/README.md)

## 📚 Key Features

### Webhook Security
- HMAC SHA256 signature verification
- Configurable shared secret
- Request validation and error handling

```java
// Backend verifies every webhook request
if (!SignatureUtil.verifySignature(payload, signature, secret)) {
    return ResponseEntity.status(401).body("Invalid signature");
}
```

### Dual Protocol Support
Switch between WebSocket and SSE in real-time:

```javascript
// Frontend hook handles both protocols
const status = useRealtimeConnection(connectionType, onMessage);
```

### Event Broadcasting
Composite pattern broadcasts to all connected clients:

```java
// Automatically broadcasts to WebSocket + SSE
eventPublisher.publish(event);
```

## 🔧 Configuration

### Backend
Edit `backend/src/main/resources/application.properties`:

```properties
server.port=8080
webhook.secret=your-secret-key
```

### Frontend
Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8080
```

### Generator
Edit `generator/webhook-generator.js`:

```javascript
const WEBHOOK_URL = 'http://localhost:8080/webhooks/events';
const WEBHOOK_SECRET = 'your-secret-key';
const INTERVAL_MS = 1000;
```

## 📖 API Reference

### Webhook Endpoint
```http
POST /webhooks/events
Content-Type: application/json
X-Signature: sha256=<signature>

{
  "type": "user.created",
  "value": "user-123"
}
```

### Get All Events
```http
GET /events
```

### WebSocket Connection
```javascript
ws://localhost:8080/ws
```

### SSE Connection
```http
GET /sse/events
Accept: text/event-stream
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Test Webhook Signature
```bash
curl -X POST http://localhost:8080/webhooks/events \
  -H "Content-Type: application/json" \
  -H "X-Signature: <your-signature>" \
  -d '{"type":"test.event","value":"test-value"}'
```

## 📁 Project Structure

```
webhook-realtime-streaming/
├── backend/           # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/demo/webhook/
│   │   │   │       ├── controller/    # REST & WebSocket controllers
│   │   │   │       ├── service/       # Business logic
│   │   │   │       ├── publisher/     # Event broadcasting
│   │   │   │       ├── handler/       # WebSocket handler
│   │   │   │       ├── model/         # Data models
│   │   │   │       └── util/          # HMAC utilities
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Dashboard & Events page
│   │   ├── hooks/         # WebSocket/SSE hooks
│   │   ├── utils/         # Helper functions
│   │   └── config/        # API configuration
│   └── package.json
├── generator/         # Webhook event generator
│   ├── webhook-generator.js
│   └── package.json
└── README.md
```

## 🚀 Production Considerations

For production deployment:

- **Persistence**: Replace in-memory storage with PostgreSQL/MongoDB
- **Message Broker**: Use Kafka or Redis Pub/Sub for event distribution
- **Scaling**: Implement sticky sessions for WebSocket load balancing
- **Security**: Store secrets in vault (AWS Secrets Manager, HashiCorp Vault)
- **Monitoring**: Add metrics for connection count, event throughput

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by real-world webhook implementations (Stripe, Razorpay, GitHub)
- Built with Spring Boot, React, and Material-UI

## 📧 Support

If you have questions or run into issues:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the code - it's well-commented!

## 🔍 Keywords

webhook, webhook-integration, websocket, sse, server-sent-events, realtime, spring-boot, react, event-driven, streaming, dashboard

---

**Star ⭐ this repo if it helped you!**
