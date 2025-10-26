#!/bin/bash

# MemoryMesh Startup Script
# Run this to start both backend and frontend servers

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║                🧠  MemoryMesh  🧠                         ║"
echo "║         AI-Powered Cognitive Co-Pilot                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Starting MemoryMesh..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Dependencies ready"
echo ""
echo "🔧 Starting services..."
echo ""
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo "   WebSocket: ws://localhost:5000"
echo ""
echo "🎯 Demo scenarios available in the dashboard"
echo "   Click the ⚡ button to trigger scenarios"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start both services
npm run dev
