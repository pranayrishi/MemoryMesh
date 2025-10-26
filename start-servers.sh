#!/bin/bash

# MemoryMesh Server Startup Script
# This script starts both the backend and frontend servers

echo "🧠 Starting MemoryMesh Servers..."
echo ""

# Kill any existing processes on the ports
echo "Cleaning up existing processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Start backend server
echo "Starting backend server on port 5000..."
cd "$(dirname "$0")"
node backend/server.js &
BACKEND_PID=$!
sleep 3

# Start frontend server
echo "Starting frontend server on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
