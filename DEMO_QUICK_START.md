# Demo Quick Start Guide 🚀

## ✅ System Ready!

Both fixes complete:
1. ✅ **Grandmother Detection** - Green boxes working
2. ✅ **Audio Playback** - Browser TTS fallback active

## 🎬 Start Demo (3 Steps)

### 1. Start Servers
```bash
cd /Users/rishinalem/MindMesh
./start-servers.sh
```

### 2. Open Dashboard
```
http://localhost:3000
```

### 3. Trigger Demo
- Click **⚡ Demo** button
- Select any scenario
- **Watch & Listen!** 🎥🔊

## 🎯 What Judges Will See/Hear

### Visual
- ✅ Video of grandmother
- ✅ **Green bounding box** around her
- ✅ **"GRANDMOTHER" label**
- ✅ Box updates every second

### Audio
- ✅ **AI voice speaks from browser** 🔊
- ✅ Purple "AI Speaking" badge
- ✅ Warm, empathetic message
- ✅ Clear and natural

### Intelligence
- ✅ AI analyzes situation
- ✅ Detects scenario (meal confusion, stove safety, etc.)
- ✅ Generates personalized response
- ✅ Shows reasoning and confidence

## 🔍 Verify Everything Works

### Check Grandmother Detection
- [ ] Green box appears around grandmother
- [ ] "GRANDMOTHER" label visible
- [ ] Box updates as video plays
- [ ] No "no person detected" errors

### Check Audio Playback
- [ ] AI voice plays from speakers
- [ ] Purple badge shows "AI Speaking"
- [ ] Message text visible
- [ ] Audio is clear

### Check Backend Logs
```bash
# Should see:
✅ Person detected with AI!
   Bounding box: x=XX%, y=XX%, w=XX%, h=XX%
🔊 Broadcasting voice message to frontend...
📡 Broadcast tts_fallback to 1 client(s)
```

### Check Frontend Console (F12)
```javascript
// Should see:
👤 Person detected! Drawing box...
🗣️  TTS fallback event received
🗣️  Playing with browser TTS
▶️  TTS started
✅ TTS finished
```

## 🎤 Demo Scenarios Available

1. **Meal Confusion** - Grandmother checking fridge repeatedly
2. **Stove Safety** - Burner on with no pot (critical)
3. **Wandering** - Attempting to leave house
4. **Agitation** - Showing signs of distress

## 🐛 Quick Troubleshooting

### No green box?
- Check video is playing
- Check backend logs for detection
- Refresh page

### No audio?
- Check browser not muted
- Check system volume
- Check browser console for errors

### Both not working?
- Restart servers: `./start-servers.sh`
- Clear browser cache
- Check backend is running: `curl http://localhost:5000/api/health`

## 📱 Demo Tips

### For Best Results
1. **Use Chrome or Safari** (best TTS support)
2. **Turn up volume** (so judges hear AI)
3. **Full screen** (F11) for impact
4. **Point out features** as they happen

### What to Say
- "Watch the green box track the grandmother in real-time"
- "Listen to the AI speaking with empathy"
- "Notice how it remembers she just ate"
- "See the intervention reasoning and confidence scores"

## 🎉 Success!

If you see:
- ✅ Green box around grandmother
- ✅ AI voice playing from browser
- ✅ Purple "AI Speaking" badge
- ✅ Intervention card with reasoning

**YOU'RE READY TO DEMO!** 🚀

---

## 📞 Need Help?

**Check logs:**
```bash
# Backend
tail -f backend.log

# Or run backend in foreground
node backend/server.js
```

**Check documentation:**
- `COMPLETE_FIXES_SUMMARY.md` - Full overview
- `GRANDMOTHER_DETECTION_FIX.md` - Detection details
- `AUDIO_FALLBACK_GUIDE.md` - Audio details

---

**Current Status:** 🟢 **READY FOR DEMO!**

**Servers:** http://localhost:5000 (backend) + http://localhost:3000 (frontend)

**Next:** Open dashboard and click ⚡ Demo!
