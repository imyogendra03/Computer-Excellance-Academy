# Network Error During Login - Troubleshooting Guide

## Problem
You're seeing: **"Network error. Check your internet connection."** when trying to login.

## Root Cause
The backend server was not running on `http://localhost:5000`. This error occurs when:
- ❌ Backend server is not started
- ❌ Backend server crashed or stopped
- ❌ Incorrect API URL configuration
- ❌ MongoDB connection failed
- ❌ Port 5000 is blocked or in use

## Solution

### 1. **Start the Backend Server** (REQUIRED)

#### Option A: Using npm (Recommended)
```bash
cd server
npm start
```

#### Option B: Using node directly
```bash
cd server
node index.js
```

#### Option C: Using development mode with hot-reload
```bash
cd server
npm run dev  # Requires nodemon
```

You should see this output:
```
✅ CEA Server running on port 5000
✅ MongoDB Connected
```

### 2. **Verify Configuration**

#### Check server/.env
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...
```

#### Check client/.env
```env
VITE_API_URL=http://localhost:5000
```

### 3. **Test Server Connectivity**

Run the diagnostic script from the root directory:
```bash
node CHECK_SERVER_STATUS.js
```

Expected output:
```
✓ Basic Server Response
✓ Health Check
✓ Database Connection
```

### 4. **Start the Frontend** (In a separate terminal)

```bash
cd client
npm run dev
```

Navigate to: `http://localhost:5173`

## Permanent Fix for Future Logins

### Create a Start Script
Create a `package.json` script in the root to start both servers:

```json
{
  "scripts": {
    "server": "cd server && npm start",
    "client": "cd client && npm run dev",
    "dev": "conc \"npm run server\" \"npm run client\""
  }
}
```

Then run:
```bash
npm run dev
```

### Docker Setup (Optional - for production)
Coming soon...

## Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Network error. Check internet connection. | Server not running | Run `cd server && npm start` |
| Connection timeout | Server slow/overloaded | Wait or restart server |
| Cannot reach server at http://localhost:5000 | Port blocked | Check if port 5000 is free |
| Database connection lost | MongoDB offline | Check MONGO_URI in .env |
| 401 Invalid credentials | Wrong email/password | Check your login details |

## Debugging Tips

### Check if Port 5000 is in Use
```bash
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

### View Server Logs
The server will show detailed logs when:
- Database connects/disconnects
- Authentication requests
- API errors
- Middleware processing

### Enable Debug Mode
Add this to server/.env:
```env
DEBUG=cea:*
```

## Still Having Issues?

If you're still getting the network error after following these steps:

1. ✅ Restart the backend server
2. ✅ Clear browser cache (Ctrl+Shift+Delete)
3. ✅ Check browser console for detailed errors (F12)
4. ✅ Verify MongoDB connection is active
5. ✅ Check firewall isn't blocking port 5000

## Quick Start Script

Save this as `start.cmd` and run it:
```batch
@echo off
cd server
start "Backend Server" cmd /k node index.js

cd ..\client
start "Frontend" cmd /k npm run dev

echo.
echo ✅ Both servers started!
echo 📱 Frontend: http://localhost:5173
echo 🔌 Backend: http://localhost:5000
```

---

**Last Updated:** April 11, 2026  
**Status:** ✅ Backend Server is now running and accessible
