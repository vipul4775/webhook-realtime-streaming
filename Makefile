# Real-Time Event Pipeline - Makefile
# Production-grade commands for development and deployment

# Detect OS
ifeq ($(OS),Windows_NT)
	DETECTED_OS := Windows
	START_SCRIPT := start-all.bat
else
	DETECTED_OS := $(shell uname -s)
	START_SCRIPT := ./start-all.sh
endif

.PHONY: help install install-frontend install-generator \
        start stop backend frontend generator \
        test test-backend build build-backend build-frontend \
        logs logs-backend logs-frontend logs-generator \
        health health-backend health-frontend \
        clean clean-backend clean-frontend \
        run dev restart package

# Default target
help:
	@echo "Real-Time Event Pipeline - Available Commands"
	@echo ""
	@echo "Quick Start:"
	@echo "  make run              Install dependencies (if needed) and start all services"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install          Install all dependencies and build all components"
	@echo "  make install-frontend Install frontend dependencies only"
	@echo "  make install-generator Install generator dependencies only"
	@echo ""
	@echo "Running Services:"
	@echo "  make start            Start all services (backend + frontend + generator)"
	@echo "  make backend          Start backend only"
	@echo "  make frontend         Start frontend only"
	@echo "  make generator        Start generator only"
	@echo "  make stop             Stop all running services"
	@echo "  make restart          Restart all services"
	@echo ""
	@echo "Testing & Building:"
	@echo "  make test             Run all tests"
	@echo "  make test-backend     Run backend tests only"
	@echo "  make build            Build all components"
	@echo "  make build-backend    Build backend JAR"
	@echo "  make build-frontend   Build frontend for production"
	@echo ""
	@echo "Logs & Monitoring:"
	@echo "  make logs             Show all logs (tail -f)"
	@echo "  make logs-backend     Show backend logs"
	@echo "  make logs-frontend    Show frontend logs"
	@echo "  make logs-generator   Show generator logs"
	@echo ""
	@echo "Health Checks:"
	@echo "  make health           Check if all services are running"
	@echo "  make health-backend   Check backend health"
	@echo "  make health-frontend  Check frontend health"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            Clean all build artifacts and logs"
	@echo "  make clean-backend    Clean backend build files"
	@echo "  make clean-frontend   Clean frontend build files"
	@echo ""
	@echo "Production:"
	@echo "  make package          Build and package for production"

# Install all dependencies
install: build-backend install-frontend install-generator
	@echo "✅ All dependencies installed"

install-frontend:
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install

install-generator:
	@echo "📦 Installing generator dependencies..."
	@cd generator && npm install

# Start all services (cross-platform)
start:
	@echo "🚀 Starting all services on $(DETECTED_OS)..."
ifeq ($(DETECTED_OS),Windows)
	@$(START_SCRIPT)
else
	@chmod +x $(START_SCRIPT)
	@$(START_SCRIPT)
endif

# Start individual services
backend:
	@echo "🚀 Starting backend on port 8080..."
	@cd backend && mvn spring-boot:run

frontend:
	@echo "🚀 Starting frontend on port 3000..."
	@cd frontend && npm start

generator:
	@echo "🚀 Starting webhook generator..."
	@cd generator && npm start

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
ifeq ($(DETECTED_OS),Windows)
	@taskkill /FI "WindowTitle eq Backend*" /T /F >nul 2>nul || echo "Backend not running"
	@taskkill /FI "WindowTitle eq Generator*" /T /F >nul 2>nul || echo "Generator not running"
	@taskkill /FI "WindowTitle eq Frontend*" /T /F >nul 2>nul || echo "Frontend not running"
else
	@pkill -f "mvn spring-boot:run" 2>/dev/null && echo "Backend stopped" || echo "Backend not running"
	@pkill -f "node.*webhook-generator" 2>/dev/null && echo "Generator stopped" || echo "Generator not running"
	@pkill -f "react-scripts start" 2>/dev/null && echo "Frontend stopped" || echo "Frontend not running"
endif
	@echo "✅ Stop command completed"

# Run tests
test: test-backend
	@echo "✅ All tests completed"

test-backend:
	@echo "🧪 Running backend tests..."
	@cd backend && mvn test

# Build for production
build: build-backend build-frontend
	@echo "✅ Build completed"

build-backend:
	@echo "🔨 Building backend JAR..."
	@cd backend && mvn clean package -DskipTests

build-frontend:
	@echo "🔨 Building frontend for production..."
	@cd frontend && npm run build

# View logs
logs:
	@echo "📝 Showing all logs (Ctrl+C to exit)..."
	@touch backend.log generator.log frontend.log 2>/dev/null || true
	@tail -f backend.log generator.log frontend.log 2>/dev/null || echo "Unable to read logs"

logs-backend:
	@touch backend.log 2>/dev/null || true
	@tail -f backend.log 2>/dev/null || echo "backend.log not found"

logs-frontend:
	@touch frontend.log 2>/dev/null || true
	@tail -f frontend.log 2>/dev/null || echo "frontend.log not found"

logs-generator:
	@touch generator.log 2>/dev/null || true
	@tail -f generator.log 2>/dev/null || echo "generator.log not found"

# Health checks
health: health-backend health-frontend
	@echo "✅ Health check completed"

health-backend:
	@echo "🔍 Checking backend health..."
	@curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1 && echo "✅ Backend is running" || \
	(curl -sf http://localhost:8080/events > /dev/null 2>&1 && echo "✅ Backend is running" || echo "❌ Backend is not responding")

health-frontend:
	@echo "🔍 Checking frontend health..."
	@curl -sf http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend is running" || echo "❌ Frontend is not responding"

# Clean build artifacts and logs
clean: clean-backend clean-frontend
	@echo "🧹 Cleaning log files..."
	@rm -f backend.log frontend.log generator.log
	@echo "✅ Cleanup completed"

clean-backend:
	@echo "🧹 Cleaning backend build files..."
	@cd backend && mvn clean

clean-frontend:
	@echo "🧹 Cleaning frontend build files..."
	@cd frontend && rm -rf build node_modules/.cache

# Development shortcuts
run: check-deps
	@echo "🔍 Checking dependencies..."
	@if ! ls backend/target/*.jar >/dev/null 2>&1; then \
		echo "🔨 Building backend JAR..."; \
		$(MAKE) build-backend; \
	fi
	@if [ ! -d "frontend/node_modules" ]; then \
		echo "📦 Installing frontend dependencies..."; \
		$(MAKE) install-frontend; \
	fi
	@if [ ! -d "generator/node_modules" ]; then \
		echo "📦 Installing generator dependencies..."; \
		$(MAKE) install-generator; \
	fi
	@$(MAKE) start

check-deps:
	@command -v java >/dev/null 2>&1 || (echo "❌ Java not found. Install Java 17+"; exit 1)
	@command -v mvn >/dev/null 2>&1 || (echo "❌ Maven not found. Install Maven 3.6+"; exit 1)
	@command -v node >/dev/null 2>&1 || (echo "❌ Node.js not found. Install Node.js 16+"; exit 1)

dev: install start

# Quick restart
restart: stop
	@sleep 2
	@$(MAKE) start

# Production build and package
package: clean build
	@echo "📦 Creating production package..."
	@mkdir -p dist
	@cp -r backend/target/*.jar dist/ 2>/dev/null || true
	@cp -r frontend/build dist/frontend 2>/dev/null || true
	@echo "✅ Production package created in dist/"
