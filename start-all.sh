#!/bin/bash

# Real-Time Event Pipeline - Start All Components
# This script starts the backend, generator, and frontend in parallel

set -euo pipefail

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting Real-Time Event Pipeline..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# PIDs for cleanup
BACKEND_PID=""
GENERATOR_PID=""
FRONTEND_PID=""

# Clear log files
> backend.log
> generator.log
> frontend.log

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    
    # Kill background jobs safely
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$GENERATOR_PID" ] && kill -0 "$GENERATOR_PID" 2>/dev/null; then
        kill "$GENERATOR_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    
    # Kill any remaining processes
    pkill -f "mvn spring-boot:run" 2>/dev/null || true
    pkill -f "node.*webhook-generator" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
    
    echo "✅ All services stopped"
    exit
}

trap cleanup SIGINT SIGTERM EXIT

# Check if dependencies are installed
echo "📦 Checking dependencies..."

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed. Please install Java 17 or higher.${NC}"
    exit 1
fi

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}❌ Maven is not installed. Please install Maven 3.6+.${NC}"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+.${NC}"
    exit 1
fi

# Check curl
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is not installed. Please install curl for health checks.${NC}"
    exit 1
fi

echo "✅ All dependencies found"
echo ""

# Install generator dependencies if needed
if [ ! -d "generator/node_modules" ]; then
    echo "📦 Installing generator dependencies..."
    cd generator
    npm install
    cd "$SCRIPT_DIR"
    echo ""
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd "$SCRIPT_DIR"
    echo ""
fi

# Start backend
echo -e "${BLUE}[BACKEND]${NC} Starting Spring Boot application on port 8080..."
cd backend
mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
cd "$SCRIPT_DIR"
echo -e "${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    # Try actuator health endpoint first, fallback to /events
    if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1 || \
       curl -sf http://localhost:8080/events > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start after 30 attempts. Check backend.log for details.${NC}"
        cleanup
    fi
    echo "   Attempt $i/30..."
    sleep 1
done
echo ""

# Start generator
echo -e "${YELLOW}[GENERATOR]${NC} Starting webhook generator..."
cd generator
npm start > ../generator.log 2>&1 &
GENERATOR_PID=$!
cd "$SCRIPT_DIR"
echo -e "${GREEN}✓${NC} Generator started (PID: $GENERATOR_PID)"
echo ""

# Start frontend
echo -e "${BLUE}[FRONTEND]${NC} Starting React frontend on port 3000..."
cd frontend
BROWSER=none npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"
echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"
echo ""

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
for i in {1..30}; do
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Frontend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  Frontend may still be starting. Check frontend.log if issues occur."
        break
    fi
    echo "   Attempt $i/30..."
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
