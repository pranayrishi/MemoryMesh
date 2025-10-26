#!/bin/bash

echo "🧠 Starting MemoryMesh with New Features..."
echo ""

# Check if .env has Gemini API key
if grep -q "GEMINI_API_KEY=your_gemini_api_key_here" .env 2>/dev/null; then
    echo "⚠️  Optional: Add Gemini API key to .env for enhanced pose analysis"
    echo "   Get free key: https://makersuite.google.com/app/apikey"
    echo ""
fi

# Start backend
echo "🚀 Starting backend server..."
node backend/server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend running on port 5000"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend
echo "🚀 Starting frontend..."
cd frontend && npm start &
FRONTEND_PID=$!

echo ""
echo "✨ MemoryMesh is starting!"
echo ""
echo "📊 New Features Available:"
echo "   1. Dashboard - Original dashboard (home)"
echo "   2. Statistics - Analytics with charts"
echo "   3. Live Camera - Real-time pose detection"
echo ""
echo "🌐 Open: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
