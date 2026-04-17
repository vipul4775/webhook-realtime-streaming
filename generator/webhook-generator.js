const axios = require('axios');
const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = 'http://localhost:8080/webhooks/events';
const INTERVAL_MS = 1000; // 1 second

// Webhook secret (use env var in production)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'my-super-secret-key-change-in-production';

// Predefined event types
const eventTypes = [
  'user.created',
  'order.placed',
  'payment.processed',
  'item.shipped',
  'notification.sent'
];

// Generates HMAC SHA256 signature for webhook payload
function generateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

// Generates a random event (backend generates ID and timestamp)
function generateRandomEvent() {
  return {
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    value: `Value-${Math.random().toString(36).substring(7)}`
  };
}

// Sends webhook event with HMAC signature
async function sendWebhook() {
  const event = generateRandomEvent();

  try {
    // Serialize payload to JSON (must match backend serialization)
    const payloadJson = JSON.stringify(event);
    
    // Generate HMAC signature
    const signature = generateSignature(payloadJson, WEBHOOK_SECRET);
    
    // Send request with signature in header
    const response = await axios.post(WEBHOOK_URL, event, {
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature
      }
    });

    console.log(
      `✓ Sent | ${event.type} | ${event.value} | Status: ${response.status}`
    );
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data || error.message;
    
    if (status === 401) {
      console.error(`✗ Auth Failed | ${event.type} | Invalid signature`);
    } else {
      console.error(`✗ Error | ${event.type} | ${status || message}`);
    }
  }
}

// Start generator
console.log('========================================');
console.log('Webhook Generator Started');
console.log(`Target URL: ${WEBHOOK_URL}`);
console.log(`Interval: ${INTERVAL_MS}ms`);
console.log(`Security: HMAC SHA256 signature enabled`);
console.log('========================================\n');

// Run immediately + interval
sendWebhook();
const interval = setInterval(sendWebhook, INTERVAL_MS);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping generator...');
  clearInterval(interval);
  process.exit();
});
