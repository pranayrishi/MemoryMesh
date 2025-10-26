# 🔄 Restart Instructions - Fix 404 Error

## ❌ The Problem

**Error**: `POST http://localhost:5000/api/tracking/detect-frame 404 (Not Found)`

**Cause**: The backend server is running an old version that doesn't have the new tracking endpoints.

---

## ✅ The Solution: Restart Backend

### **Step 1: Stop Backend**

In the terminal running the backend server:
```bash
Press Ctrl+C
```

You should see:
```
^C
Shutting down gracefully...
Server closed
```

### **Step 2: Start Backend**

In the same terminal:
```bash
npm start
```

### **Step 3: Wait for Services to Load**

You should see these messages:
```
🤖 Loading COCO-SSD model for person detection...
✅ COCO-SSD model loaded successfully!

🚀 Server running on http://localhost:5000
🔌 WebSocket server running on ws://localhost:5000

📊 Services Status:
   ✅ Vision Service (Creao API)
   ✅ Conversation Engine (Claude AI)
   ✅ Voice Service (Google Home)
   ✅ Intervention Coordinator
   🤖 Fetch.ai Agent Coordination
```

**IMPORTANT**: Wait for "✅ COCO-SSD model loaded successfully!" before testing!

### **Step 4: Refresh Frontend**

In your browser:
```
Press Ctrl+Shift+R (Windows/Linux)
Press Cmd+Shift+R (Mac)
```

Or just refresh normally (F5).

### **Step 5: Test Tracking**

1. Click **⚡ Demo** button
2. Select any scenario
3. **Watch for green box!** 🟢

---

## 🔍 Verify Endpoints Are Working

### **Test 1: Check Tracking Stats**

In a new terminal:
```bash
curl http://localhost:5000/api/tracking/stats
```

**Expected response**:
```json
{"cachedFrames":0,"videos":0}
```

**If you get 404**: Backend not restarted properly. Try again.

### **Test 2: Check Fetch.ai Status**

```bash
curl http://localhost:5000/api/fetchai/status
```

**Expected response**:
```json
{"enabled":true,"stats":{...}}
```

---

## 📋 Full Restart Checklist

- [ ] Stop backend (Ctrl+C)
- [ ] Start backend (`npm start`)
- [ ] Wait for "✅ COCO-SSD model loaded successfully!"
- [ ] Refresh browser (Ctrl+Shift+R)
- [ ] Test endpoint: `curl http://localhost:5000/api/tracking/stats`
- [ ] Trigger demo scenario
- [ ] Watch for green box!

---

## 🐛 If Still Getting 404

### **Check 1: Backend Port**

Make sure backend is running on port 5000:
```bash
lsof -i :5000
```

Should show:
```
COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345  user   23u  IPv6  ...      0t0  TCP *:5000 (LISTEN)
```

### **Check 2: Backend Logs**

Look for errors in backend terminal. Should NOT see:
```
❌ Failed to load COCO-SSD model
❌ Error loading VideoTrackingService
```

### **Check 3: Frontend API URL**

In `VideoMonitor.js`, the URL should be:
```javascript
axios.post('http://localhost:5000/api/tracking/detect-frame', ...)
```

### **Check 4: CORS**

Backend should have:
```javascript
app.use(cors());
```

---

## 🚀 Quick Restart Commands

### **Option 1: Manual Restart**

```bash
# Terminal 1: Backend
cd /Users/rishinalem/MindMesh
# Press Ctrl+C to stop
npm start

# Terminal 2: Frontend (if needed)
cd /Users/rishinalem/MindMesh/frontend
npm start
```

### **Option 2: Use Start Script**

```bash
# Stop all (Ctrl+C in both terminals)
# Then run:
./start-servers.sh
```

---

## ✅ Expected Behavior After Restart

### **Backend Console**:
```
🤖 Loading COCO-SSD model for person detection...
✅ COCO-SSD model loaded successfully!
🚀 Server running on http://localhost:5000
```

### **Browser Console** (when video plays):
```
🎯 Starting video tracking...
📸 Capturing frame for tracking...
🔍 Sending frame to backend...
✅ Detection response: { person_detected: true, ... }
👤 Person detected! Drawing box...
```

### **Visual**:
- 🟢 Green box around grandparent
- 📍 Corner markers
- 🏷️ "TRACKING" label
- 🟢 Pulsing "TRACKING" badge

---

## 🎯 Summary

**The 404 error means the backend needs to be restarted to load the new endpoints.**

**Just restart the backend and it will work!** 🚀

```bash
# Stop backend (Ctrl+C)
npm start
# Wait for COCO-SSD to load
# Refresh browser
# Test!
```
