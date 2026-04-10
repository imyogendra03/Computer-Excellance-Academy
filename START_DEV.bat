@echo off
REM ==============================================================
REM Computer Excellence Academy - Development Environment Starter
REM ==============================================================

color 0A
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Computer Excellence Academy - Development Startup       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Found Node.js: 
node --version
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server on port 5000...
start "CEA-Backend" cmd /k "cd server && node index.js"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start Frontend
echo [2/2] Starting Frontend on port 5173...
start "CEA-Frontend" cmd /k "cd client && npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   ✅ Both servers are starting...                         ║
echo ║                                                            ║
echo ║   Backend:  http://localhost:5000                         ║
echo ║   Frontend: http://localhost:5173                         ║
echo ║                                                            ║
echo ║   You can now use the application!                       ║
echo ║                                                            ║
echo ║   ⚠️ Keep both terminal windows open                       ║
echo ║   Close them when you're done developing                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
