# Real-Time Event Pipeline

A complete end-to-end real-time event pipeline that ingests webhook events and streams them to a live UI using WebSocket and Server-Sent Events (SSE).

## 🎯 What You'll Learn

- **Webhook Security**: HMAC SHA256 signature verification (like Stripe/Razorpay)
- **Real-Time Updates**: WebSocket and SSE implementation in Spring Boot
- **Frontend Integration**: React hooks for WebSocket/SSE connections
- **Event Broadcasting**: Composite pattern for multi-protocol support
- **Production Patterns**: Error handling, connection management, and cleanup

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

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Node.js 16+
- Maven 3.6+

### Run Everything

```bash
# Clone the repository
git clone https://github.com/yourusername/realtime-event-pipeline.git
cd realtime-event-pipeline

# Start all services (Linux/Mac)
chmod +x start-all.sh
./start-all.sh

# Or on Windows
start-all.bat
```

This starts:
- Backend on `http://localhost:8080`
- Frontend on `http://localhost:3000`
- Generator sending events every second

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
X-Signature: <hmac-sha256-signature>

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
ws://localhost:8080/ws/events
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
realtime-event-pipeline/
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

---

**Star ⭐ this repo if it helped you!**
