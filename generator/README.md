# Generator - Webhook Event Simulator

Node.js script that generates and sends webhook events with HMAC signatures to the backend.

## Features

- ✅ Generates random webhook events
- ✅ HMAC SHA256 signature generation
- ✅ Configurable interval
- ✅ Multiple event types
- ✅ Error handling and logging

## Prerequisites

- Node.js 16+

## Installation

```bash
cd generator
npm install
```

## Running

```bash
npm start
```

Sends events every second to `http://localhost:8080/webhooks/events`

## Configuration

Edit `webhook-generator.js`:

```javascript
// Target webhook URL
const WEBHOOK_URL = 'http://localhost:8080/webhooks/events';

// Send interval (milliseconds)
const INTERVAL_MS = 1000;

// Shared secret (must match backend)
const WEBHOOK_SECRET = 'my-super-secret-key-change-in-production';
```

## Event Types

The generator randomly sends these event types:
- `user.created`
- `order.placed`
- `payment.processed`
- `item.shipped`
- `notification.sent`

## How It Works

1. Generates random event with type and value
2. Serializes event to JSON
3. Computes HMAC SHA256 signature
4. Sends POST request with signature in `X-Signature` header

## Signature Generation

```javascript
const crypto = require('crypto');

function generateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}
```

## Output

```
========================================
Webhook Generator Started
Target URL: http://localhost:8080/webhooks/events
Interval: 1000ms
Security: HMAC SHA256 signature enabled
========================================

✓ Sent | user.created | Value-abc123 | Status: 200
✓ Sent | order.placed | Value-def456 | Status: 200
✗ Auth Failed | payment.processed | Invalid signature
```

## Customization

### Add Custom Event Types

```javascript
const eventTypes = [
  'user.created',
  'order.placed',
  'custom.event',  // Add your event type
];
```

### Change Event Structure

```javascript
function generateRandomEvent() {
  return {
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    value: `Value-${Math.random().toString(36).substring(7)}`,
    // Add custom fields
    metadata: {
      source: 'generator',
      timestamp: Date.now()
    }
  };
}
```

### Use Environment Variables

```javascript
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:8080/webhooks/events';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default-secret';
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS) || 1000;
```

Run with:
```bash
WEBHOOK_URL=https://api.example.com/webhooks npm start
```

## Testing Different Scenarios

### Test Invalid Signature
```javascript
// Temporarily use wrong secret
const signature = generateSignature(payloadJson, 'wrong-secret');
```

### Test High Volume
```javascript
const INTERVAL_MS = 100; // Send 10 events per second
```

### Test Specific Event Type
```javascript
function generateRandomEvent() {
  return {
    type: 'user.created',  // Always send this type
    value: `user-${Date.now()}`
  };
}
```

## Troubleshooting

### Connection refused
- Verify backend is running on port 8080
- Check `WEBHOOK_URL` configuration

### 401 Unauthorized
- Ensure `WEBHOOK_SECRET` matches backend configuration
- Verify signature generation logic

### Events not appearing in frontend
- Check backend logs for errors
- Verify WebSocket/SSE connection in frontend
- Check backend broadcasting logic

## Production Use

For production webhook testing:

1. Use environment variables for configuration
2. Add retry logic for failed requests
3. Implement exponential backoff
4. Add request logging
5. Consider using a queue (Redis, RabbitMQ)

Example with retry:
```javascript
async function sendWebhookWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await sendWebhook();
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
```
