@echo off
REM Webhook Realtime Demo - Start All Components (Windows)
REM This script starts the backend, generator, and frontend in parallel

echo.
echo Starting Webhook Realtime Demo...
echo.

REM Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed. Please install Java 17 or higher.
    exit /b 1
)

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven is not installed. Please install Maven 3.6+.
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+.
    exit /b 1
)

echo [OK] All dependencies found
echo.

REM Install generator dependencies if needed
if not exist "generator\node_modules" (
    echo Installing generator dependencies...
    cd generator
    call npm install
    cd ..
    echo.
)

REM Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

REM Start backend
echo [BACKEND] Starting Spring Boot application on port 8080...
start "Backend" cmd /c "mvn spring-boot:run > backend.log 2>&1"
echo [OK] Backend started
echo.

REM Wait for backend to be ready
echo Waiting for backend to be ready...
timeout /t 15 /nobreak >nul
echo [OK] Backend should be ready
echo.

REM Start generator
echo [GENERATOR] Starting webhook generator...
cd generator
start "Generator" cmd /c "npm start > ..\generator.log 2>&1"
cd ..
echo [OK] Generator started
echo.

REM Start frontend
echo [FRONTEND] Starting React frontend on port 3000...
cd frontend
start "Frontend" cmd /c "set BROWSER=none && npm start > ..\frontend.log 2>&1"
cd ..
echo [OK] Frontend started
echo.

REM Wait for frontend to be ready
echo Waiting for frontend to be ready...
timeout /t 15 /nobreak >nul
echo.

echo ==========================================
echo All services are running!
echo ==========================================
echo.
echo Service URLs:
echo    Backend:   http://localhost:8080
echo    Frontend:  http://localhost:3000
echo    Generator: Sending events every 1 second
echo.
echo API Endpoints:
echo    GET  http://localhost:8080/events
echo    POST http://localhost:8080/webhooks/events
echo    WS   ws://localhost:8080/ws
echo    SSE  http://localhost:8080/sse/events
echo.
echo Logs:
echo    Backend:   type backend.log
echo    Generator: type generator.log
echo    Frontend:  type frontend.log
echo.
echo Opening frontend in browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo.
echo Press any key to stop all services...
pause >nul

REM Cleanup
taskkill /FI "WindowTitle eq Backend*" /T /F >nul 2>nul
taskkill /FI "WindowTitle eq Generator*" /T /F >nul 2>nul
taskkill /FI "WindowTitle eq Frontend*" /T /F >nul 2>nul
echo.
echo All services stopped.
