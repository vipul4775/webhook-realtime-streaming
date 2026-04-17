# Frontend - React Dashboard

React application with Material-UI that displays webhook events in real-time using WebSocket or SSE.

## Features

- ✅ Real-time event updates (WebSocket/SSE)
- ✅ Switch between protocols on-the-fly
- ✅ Event analytics dashboard
- ✅ Event list with filtering
- ✅ Material-UI components
- ✅ Responsive design

## Prerequisites

- Node.js 16+
- npm or yarn

## Installation

```bash
cd frontend
npm install
```

## Running

```bash
npm start
```

App opens at `http://localhost:3000`

## Configuration

Create `.env` file (copy from `.env.example`):

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8080/ws
```

## Project Structure

```
src/
├── components/        # Reusable components
│   ├── Navbar.js
│   └── StatusChip.js
├── pages/            # Page components
│   ├── Dashboard.js
│   └── EventsPage.js
├── hooks/            # Custom React hooks
│   └── useRealtimeConnection.js
├── utils/            # Helper functions
│   ├── dateUtils.js
│   ├── eventUtils.js
│   └── logger.js
├── config/           # Configuration
│   └── api.js
├── theme/            # Material-UI theme
│   └── theme.js
└── App.js            # Main app component
```

## Key Components

### useRealtimeConnection Hook

Custom hook for WebSocket/SSE connections:

```javascript
const status = useRealtimeConnection(connectionType, onMessage);
```

**Parameters**:
- `connectionType`: `'ws'` or `'sse'`
- `onMessage`: Callback for incoming events

**Returns**: Connection status (`'connecting'`, `'connected'`, `'disconnected'`, `'error'`)

### Dashboard Page

Shows:
- Real-time statistics
- Event type distribution
- Latest event details
- Recent events list

### Events Page

Displays all events in a table with:
- Event ID
- Event type
- Value
- Timestamp

## Building for Production

```bash
npm run build
```

Creates optimized build in `build/` directory.

## Deployment

### Static Hosting (Netlify, Vercel)

1. Build the app: `npm run build`
2. Deploy `build/` directory
3. Configure environment variables in hosting platform

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
```

## Customization

### Change Theme

Edit `src/theme/theme.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // Change primary color
    },
  },
});
```

### Add New Event Types

Edit `src/utils/eventUtils.js` to add custom statistics or filtering.

## Troubleshooting

### Connection fails
- Verify backend is running on `http://localhost:8080`
- Check CORS configuration in backend
- Verify environment variables in `.env`

### WebSocket disconnects frequently
- Check network stability
- Increase timeout in backend SSE configuration
- Check browser console for errors

### Events not updating
- Open browser DevTools → Network tab
- Check WebSocket/EventSource connection status
- Verify backend is broadcasting events

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

- Events are stored in memory (limited to last 10,000)
- Use pagination for large event lists
- Consider virtualization for very long lists
- Debounce search/filter operations
