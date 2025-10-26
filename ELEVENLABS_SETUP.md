# ElevenLabs Setup - Professional Voice Quality

## Quick Setup (5 minutes)

### 1. Get ElevenLabs API Key

1. Go to https://elevenlabs.io/
2. Sign up for free account
3. Go to Profile → API Keys
4. Copy your API key

### 2. Add to .env File

Open `/Users/rishinalem/MindMesh/.env` and add:

```bash
# ElevenLabs Voice Synthesis (Professional Quality)
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

**Note:** The voice ID `21m00Tcm4TlvDq8ikWAM` is "Rachel" - a warm, empathetic female voice perfect for elderly care.

### 3. Restart Backend

```bash
# Stop backend
lsof -ti:5000 | xargs kill -9

# Start backend
cd /Users/rishinalem/MindMesh
node backend/server.js
```

### 4. Test

1. Open dashboard: http://localhost:3000
2. Click **⚡ Demo** button
3. Select a scenario
4. **Wait 18 seconds** - High-quality ElevenLabs voice will play!

## What Changed

### Voice Timing
- **Delay:** 18 seconds after video starts
- **Why:** Syncs with video progression
- **Adjustable:** Change `delaySeconds` parameter if needed

### Duplicate Prevention
- Voice only plays **once per scenario**
- Prevents repeating messages
- Resets after speech finishes

### Voice Quality

| Method | Quality | Cost | Setup |
|--------|---------|------|-------|
| **ElevenLabs** | ⭐⭐⭐⭐⭐ Professional | Free tier available | API key needed |
| **Browser TTS** | ⭐⭐⭐ Good | Free | No setup |

## Free Tier Limits

ElevenLabs free tier:
- **10,000 characters/month**
- **3 custom voices**
- Perfect for demos and testing

## Alternative Voices

To use a different voice, get the voice ID from ElevenLabs and update `.env`:

```bash
# Popular voices:
# Rachel (warm female): 21m00Tcm4TlvDq8ikWAM
# Domi (confident female): AZnzlk1XvdvUeBnXmlld
# Bella (soft female): EXAVITQu4vr4xnSDxMaL
# Antoni (friendly male): ErXwobaYiN019PkySvjV

ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

## Testing Without ElevenLabs

If you don't have an API key:
- System automatically falls back to browser TTS
- Still works perfectly
- Just sounds more robotic

## Current Behavior

### With ElevenLabs API Key:
1. Demo triggered
2. Backend generates MP3 with ElevenLabs
3. **Wait 18 seconds**
4. High-quality voice plays from browser
5. Voice plays **once only**

### Without ElevenLabs API Key:
1. Demo triggered
2. Backend falls back to browser TTS
3. **Wait 18 seconds**
4. Browser TTS voice plays (Samantha on Mac)
5. Voice plays **once only**

## Troubleshooting

### No audio after 18 seconds?

**Check backend logs:**
```bash
# Should see:
✅ Voice synthesized with ElevenLabs
📡 Broadcast audio_ready to 1 client(s)
```

**Or:**
```bash
# If no API key:
⚠️  ElevenLabs error, falling back to Google Home
🔊 Broadcasting voice message to frontend...
```

### Voice repeats multiple times?

**Fixed!** The new system prevents duplicates:
- Tracks last message
- Checks if already speaking
- Skips duplicate calls

### Voice plays immediately (not at 18 seconds)?

**Check code:** The delay is set in `App.js`:
```javascript
setTimeout(() => {
  // Play audio
}, 18000); // 18 seconds = 18000ms
```

To change timing, edit the number (in milliseconds).

## Status

✅ **Voice works** (browser TTS confirmed)  
✅ **18-second delay** implemented  
✅ **Duplicate prevention** implemented  
⏳ **ElevenLabs** ready (just add API key)  

## Next Steps

1. **For Demo:** Current browser TTS works fine
2. **For Production:** Add ElevenLabs API key for professional quality
3. **Adjust Timing:** Change delay if needed (currently 18s)

---

**Ready for hackathon!** 🎉

Voice plays once, at 18 seconds, with professional quality (if ElevenLabs configured) or good quality (browser TTS).
