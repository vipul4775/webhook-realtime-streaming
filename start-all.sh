#!/bin/bash

# Webhook Realtime Demo - Start All Components
# This script starts the backend, generator, and frontend in parallel

set -e

echo "🚀 Starting Webhook Realtime Demo..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $(jobs -p) 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# Check if dependencies are installed
echo "📦 Checking dependencies..."

# Check Java
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven 3.6+."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+."
    exit 1
fi

echo "✅ All dependencies found"
echo ""

# Install generator dependencies if needed
if [ ! -d "generator/node_modules" ]; then
    echo "📦 Installing generator dependencies..."
    cd generator
    npm install
    cd ..
    echo ""
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo ""
fi

# Start backend
echo -e "${BLUE}[BACKEND]${NC} Starting Spring Boot application on port 8080..."
cd backend
mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8080/events > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start. Check backend.log for details."
        cleanup
    fi
    sleep 1
done
echo ""

# Start generator
echo -e "${YELLOW}[GENERATOR]${NC} Starting webhook generator..."
cd ../generator
npm start > ../generator.log 2>&1 &
GENERATOR_PID=$!
cd ..
echo -e "${GREEN}✓${NC} Generator started (PID: $GENERATOR_PID)"
echo ""

# Start frontend
echo -e "${BLUE}[FRONTEND]${NC} Starting React frontend on port 3000..."
cd frontend
BROWSER=none npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"
echo ""

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Frontend is ready!"
        break
    fi
    sleep 1
done
echo ""

echo "=========================================="
echo "✅ All services are running!"
echo "=========================================="
echo ""
echo "📍 Service URLs:"
echo "   Backend:   http://localhost:8080"
echo "   Frontend:  http://localhost:3000"
echo "   Generator: Sending events every 1 second"
echo ""
echo "📋 API Endpoints:"
echo "   GET  http://localhost:8080/events"
echo "   POST http://localhost:8080/webhooks/events"
echo "   WS   ws://localhost:8080/ws"
echo "   SSE  http://localhost:8080/sse/events"
echo ""
echo "📝 Logs:"
echo "   Backend:   tail -f backend.log"
echo "   Generator: tail -f generator.log"
echo "   Frontend:  tail -f frontend.log"
echo ""
echo "🌐 Opening frontend in browser..."
sleep 2
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
else
    echo "   Please open http://localhost:3000 in your browser"
fi
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
wait
