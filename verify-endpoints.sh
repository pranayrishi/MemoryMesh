#!/bin/bash

echo ""
echo "🔍 Verifying MemoryMesh Endpoints"
echo "=================================="
echo ""

# Check if backend is running
echo "1️⃣  Checking if backend is running on port 5000..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running"
    echo "   💡 Start it with: npm start"
    exit 1
fi

echo ""
echo "2️⃣  Testing tracking stats endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/tracking/stats)
if [ "$RESPONSE" = "200" ]; then
    echo "   ✅ /api/tracking/stats - Working!"
    curl -s http://localhost:5000/api/tracking/stats | python3 -m json.tool
else
    echo "   ❌ /api/tracking/stats - Failed (HTTP $RESPONSE)"
    echo "   💡 Backend needs to be restarted!"
fi

echo ""
echo "3️⃣  Testing Fetch.ai status endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/fetchai/status)
if [ "$RESPONSE" = "200" ]; then
    echo "   ✅ /api/fetchai/status - Working!"
else
    echo "   ❌ /api/fetchai/status - Failed (HTTP $RESPONSE)"
fi

echo ""
echo "4️⃣  Checking frontend..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   ✅ Frontend is running on port 3000"
else
    echo "   ⚠️  Frontend is NOT running"
    echo "   💡 Start it with: cd frontend && npm start"
fi

echo ""
echo "=================================="
echo "✅ Verification complete!"
echo ""
echo "📝 Next steps:"
echo "   1. If any endpoints failed, restart backend: npm start"
echo "   2. Open http://localhost:3000"
echo "   3. Click ⚡ Demo → Select scenario"
echo "   4. Watch for green tracking box! 🟢"
echo ""
