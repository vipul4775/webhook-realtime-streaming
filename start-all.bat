@echo off
REM Real-Time Event Pipeline - Start All Components (Windows)
REM This script starts the backend, generator, and frontend in parallel

setlocal enabledelayedexpansion

REM Get script directory and change to project root
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo.
echo Starting Real-Time Event Pipeline...
echo.

REM Clear log files
type nul > backend.log 2>nul
type nul > generator.log 2>nul
type nul > frontend.log 2>nul

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

REM Check if curl is available (optional, fallback to timeout-based check)
set "HAS_CURL=0"
where curl >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "HAS_CURL=1"
)

echo [OK] All dependencies found
echo.

REM Install generator dependencies if needed
if not exist "generator\node_modules" (
    echo Installing generator dependencies...
    cd generator
    call npm install
    cd "%SCRIPT_DIR%"
    echo.
)

REM Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd "%SCRIPT_DIR%"
    echo.
)

REM Start backend
echo [BACKEND] Starting Spring Boot application on port 8080...
cd backend
start "Backend" cmd /c "mvn spring-boot:run > ..\backend.log 2>&1"
cd "%SCRIPT_DIR%"
echo [OK] Backend started
echo.

REM Wait for backend to be ready
echo Waiting for backend to be ready...
set /a attempts=0
:wait_backend
set /a attempts+=1
if %attempts% GTR 30 (
    echo [ERROR] Backend failed to start after 30 attempts. Check backend.log for details.
    goto cleanup
)
echo    Attempt %attempts%/30...
timeout /t 1 /nobreak >nul

REM Try health check with curl if available, otherwise use simple timeout
if %HAS_CURL% EQU 1 (
    curl -sf http://localhost:8080/actuator/health >nul 2>&1
    if %ERRORLEVEL% EQU 0 goto backend_ready
    curl -sf http://localhost:8080/events >nul 2>&1
    if %ERRORLEVEL% EQU 0 goto backend_ready
) else (
    REM Fallback: assume ready after reasonable wait time
    if %attempts% GEQ 15 goto backend_ready
)
goto wait_backend

:backend_ready
echo [OK] Backend is ready!
echo.

REM Start generator
echo [GENERATOR] Starting webhook generator...
cd generator
start "Generator" cmd /c "npm start > ..\generator.log 2>&1"
cd "%SCRIPT_DIR%"
echo [OK] Generator started
echo.

REM Start frontend
echo [FRONTEND] Starting React frontend on port 3000...
cd frontend
start "Frontend" cmd /c "set BROWSER=none && npm start > ..\frontend.log 2>&1"
cd "%SCRIPT_DIR%"
echo [OK] Frontend started
echo.

REM Wait for frontend to be ready
echo Waiting for frontend to be ready...
set /a attempts=0
:wait_frontend
set /a attempts+=1
if %attempts% GTR 30 (
    echo [WARNING] Frontend may still be starting. Check frontend.log if issues occur.
    goto services_ready
)
echo    Attempt %attempts%/30...
timeout /t 1 /nobreak >nul

if %HAS_CURL% EQU 1 (
    curl -sf http://localhost:3000 >nul 2>&1
    if %ERRORLEVEL% EQU 0 goto frontend_ready
) else (
    REM Fallback: assume ready after reasonable wait time
    if %attempts% GEQ 20 goto frontend_ready
)
goto wait_frontend

:frontend_ready
echo [OK] Frontend is ready!
echo.

:services_ready
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

:cleanup
REM Cleanup - stop all services
echo.
echo Stopping all services...
taskkill /FI "WindowTitle eq Backend*" /T /F >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Backend stopped
) else (
    echo Backend not running
)
taskkill /FI "WindowTitle eq Generator*" /T /F >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Generator stopped
) else (
    echo Generator not running
)
taskkill /FI "WindowTitle eq Frontend*" /T /F >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Frontend stopped
) else (
    echo Frontend not running
)
echo All services stopped.
