# OMI Dev Kit 2 & ElevenLabs Integration

## 🎉 New Features Added

### 1. OMI Dev Kit 2 Integration
Real-time conversation listening and transcription to provide context for better patient care.

### 2. ElevenLabs Voice Synthesis
Natural, empathetic voice output using AI-generated speech.

---

## 🎧 OMI Dev Kit 2 Integration

### What It Does

The OMI Dev Kit 2 continuously listens to conversations in the patient's environment and:
- **Transcribes speech** in real-time
- **Analyzes context** for confusion, emotional state, needs
- **Detects patterns** like time references, people mentions
- **Provides enriched context** for AI decision-making
- **Enables proactive interventions** based on conversation

### Features

**Automatic Analysis**:
- Confusion indicators ("where am i", "did i eat", "forgot")
- Emotional states (anxious, upset, calm, happy)
- Temporal confusion (yesterday/today mix-ups)
- People/place references
- Needs/requests (hungry, bathroom, help)

**Context Tracking**:
- Recent conversation history
- Emotional state progression
- Confusion pattern detection
- Concern level calculation (0-1.0 scale)

**Proactive Care**:
- Detects high concern levels (>0.6)
- Can trigger interventions before crises
- Provides conversation summary for AI
- Tracks what the patient is talking about

### API Endpoints

**Webhook (for real OMI device)**:
```
POST /api/omi/transcript
Body: { "text": "transcript", "speaker": "patient", "timestamp": "..." }
```

**Simulate Transcript (for testing)**:
```
POST /api/omi/simulate
Body: { "text": "Did I eat lunch yet? I can't remember", "speaker": "patient" }
```

**Get Status**:
```
GET /api/omi/status
```

**Get Conversation History**:
```
GET /api/omi/history?limit=20
```

**Get Enriched Context**:
```
GET /api/omi/context
```

### Testing OMI Without Real Device

You can test the OMI integration using the simulate endpoint:

```bash
curl -X POST http://localhost:5000/api/omi/simulate \
  -H "Content-Type: application/json" \
  -d '{"text": "Did I eat lunch? I cannot remember", "speaker": "patient"}'
```

This will:
1. Process the transcript
2. Analyze for confusion/emotional indicators
3. Broadcast to dashboard
4. Update patient context
5. Return analysis

**Example Analysis**:
```json
{
  "confusionIndicators": ["did i eat", "can't remember"],
  "emotionalIndicators": [],
  "temporalReferences": [],
  "concernLevel": 0.4
}
```

### How It Enhances Care

**Before OMI**:
- Only vision-based detection
- React to visual cues only
- Limited context

**With OMI**:
- Hears what patient says
- Detects confusion in speech
- Understands emotional tone
- Tracks conversation topics
- **Combines vision + conversation** for complete picture

**Example Scenario**:

1. **OMI hears**: "Did I take my medication? I think... maybe... I can't remember"
   - Detects: confusion indicators, uncertainty
   - Concern level: 0.6

2. **Vision sees**: Patient near medicine cabinet, looking confused
   - Detects: location (bathroom), activity (searching)
   - Urgency: 0.5

3. **AI combines both**:
   - Vision + OMI context = comprehensive understanding
   - Generates personalized intervention
   - "Hi Margaret, I can see you're wondering about your medication. You took your Donepezil this morning at 8 AM - I have the timestamp right here. You're all set until tonight. How about we look at Emma's new photos instead?"

---

## 🎙️ ElevenLabs Integration

### What It Does

ElevenLabs provides **ultra-realistic, empathetic voice synthesis** that sounds natural and warm - perfect for Alzheimer's care.

### Features

- **Natural voice**: Sounds human, not robotic
- **Emotional tone**: Can be warm, empathetic, caring
- **Adjustable settings**: Control stability, similarity, style
- **High quality**: Professional-grade audio
- **Fast**: Real-time synthesis

### Voice Configuration

**Default Voice**: Rachel (warm, empathetic female voice)

**Voice Settings**:
- `stability`: 0.6 (slightly expressive for empathy)
- `similarity_boost`: 0.8 (maintains voice consistency)
- `style`: 0.0 (natural conversation)
- `use_speaker_boost`: true (enhanced clarity)

### How It Works

1. **AI generates message**: Personalized therapeutic response
2. **ElevenLabs synthesizes**: Converts text to natural speech
3. **Audio saved**: MP3 file saved to cache
4. **Broadcasted**: Audio URL sent to dashboard
5. **Played**: Browser plays natural voice through speakers

### API Key

Already configured in `.env`:
```env
ELEVENLABS_API_KEY=sk_376be645a378c03af580d15253bdb17033d105dd8cc16126
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### Fallback System

**Priority Order**:
1. **ElevenLabs** (best - natural AI voice)
2. **Google Home** (if configured with IP)
3. **Browser TTS** (fallback - console log)

If ElevenLabs fails, automatically falls back to Google Home.

### Audio Files

- Saved to: `audio-cache/` directory
- Format: MP3
- Accessible at: `http://localhost:5000/audio/speech_[timestamp].mp3`
- Auto-cleanup: Old files deleted after 1 hour

---

## 🎯 Combined Power: OMI + ElevenLabs + Vision

### Complete Care Loop

```
OMI Listens → Transcribes Conversation
     ↓
Analyzes Speech (confusion, emotion, needs)
     ↓
Vision Analyzes → Environment & Activity
     ↓
AI Combines Both → Complete Context
     ↓
Generates Personalized Response
     ↓
ElevenLabs Synthesizes → Natural Voice
     ↓
Patient Hears Warm, Empathetic Guidance
     ↓
OMI Listens to Response → Loop Continues
```

### Real-World Example

**Situation**: Post-lunch confusion

**OMI Hears**:
> "I'm hungry. Did I eat? What time is it? I think I need lunch..."

**OMI Analysis**:
- Confusion indicators: 3
- Temporal confusion: detected
- Need: hungry
- Concern level: 0.6

**Vision Sees**:
- Location: kitchen
- Activity: opening refrigerator repeatedly
- Emotional state: confused

**AI Decision** (using both):
```
Urgency: 0.65 (NOTIFY level)
Reasoning: Patient showing verbal AND visual confusion about recent meal.
Speech patterns indicate temporal disorientation.
```

**ElevenLabs Speaks** (natural, warm voice):
> "Hi Margaret, I can hear you're feeling hungry, and I understand that feeling. But you know what? You just had a wonderful chicken soup lunch 30 minutes ago - I have the photo right here with the timestamp. Your favorite! How about we look at those beautiful new photos of Emma's soccer game instead? She scored the winning goal!"

**Result**:
- Patient hears familiar, comforting voice
- Visual + verbal reassurance
- Gentle redirection
- No harsh correction
- Therapeutic approach

---

## 🔧 Configuration

### Enable OMI Dev Kit 2

In `backend/.env`:
```env
OMI_ENABLED=true
OMI_WEBHOOK_URL=https://your-omi-webhook-url.com
```

**For Real OMI Device**:
1. Configure OMI to send transcripts to: `http://your-server:5000/api/omi/transcript`
2. OMI will POST JSON: `{ "text": "...", "speaker": "patient" }`
3. MemoryMesh processes automatically

### ElevenLabs (Already Configured)

```env
ELEVENLABS_API_KEY=sk_376be645a378c03af580d15253bdb17033d105dd8cc16126
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

**To change voice**:
1. Get available voices: Visit ElevenLabs dashboard
2. Copy voice ID
3. Update `ELEVENLABS_VOICE_ID` in `.env`

---

## 📊 Dashboard Updates

### New Real-Time Data

**OMI Transcripts**:
- Live transcripts appear in dashboard
- Analysis badges show concern level
- Conversation history visible
- Emotional state tracking

**Audio Playback**:
- ElevenLabs audio plays automatically
- Natural voice through browser
- Visual indicator when speaking

---

## 🧪 Testing the Integration

### Test 1: OMI Simulation

```bash
# Simulate confused patient speech
curl -X POST http://localhost:5000/api/omi/simulate \
  -H "Content-Type: application/json" \
  -d '{"text": "Where am I? Did I take my pills? I am scared and confused"}'
```

**Expected**:
- Detects: confusion, fear, medication concern
- Concern level: High (>0.7)
- May trigger automatic intervention
- Dashboard shows transcript + analysis

### Test 2: ElevenLabs Voice

Trigger any demo scenario - you'll hear:
1. Natural, warm female voice (Rachel)
2. Empathetic tone
3. Clear, professional audio
4. No robotic sound

### Test 3: Combined Context

1. Simulate OMI: "I'm so hungry, where's my food?"
2. Trigger scenario: Meal Confusion
3. AI sees: OMI transcript + vision data
4. Generates: Context-aware response
5. Speaks: Through ElevenLabs

---

## 💡 Advanced Features

### Conversation Pattern Detection

OMI tracks patterns over time:
- Repeated questions (memory loops)
- Time of day confusion spikes
- Specific triggers (names, places)
- Emotional progression

### Predictive Intervention

With enough conversation data, AI can:
- Predict confusion before it peaks
- Recognize pre-agitation patterns
- Intervene proactively
- Prevent escalation

### Multi-Modal Intelligence

System now uses **3 intelligence sources**:
1. **Vision** (Creao API) - What patient is doing
2. **Conversation** (OMI) - What patient is saying
3. **Context** (Claude AI) - What it means

---

## 🎯 Real OMI Dev Kit 2 Setup

### When You Get Your OMI Device

1. **Configure OMI Webhook**:
   - Point to: `http://your-memorymesh-server:5000/api/omi/transcript`
   - OMI will POST transcripts automatically

2. **Start MemoryMesh**:
   ```bash
   npm run dev
   ```

3. **OMI Listens**:
   - Transcribes everything patient says
   - Sends to MemoryMesh
   - Real-time analysis begins

4. **Magic Happens**:
   - AI hears + sees
   - Complete understanding
   - Better care

---

## 📈 Benefits

### For Patient
- ✅ More natural voice interaction
- ✅ Better understanding of their needs
- ✅ Proactive help before asking
- ✅ No feeling of being ignored

### For Caregivers
- ✅ Complete conversation logs
- ✅ Emotional state tracking
- ✅ Pattern detection over time
- ✅ Fewer emergencies

### For Care Quality
- ✅ Multi-modal intelligence
- ✅ Context-aware responses
- ✅ Predictive capabilities
- ✅ Therapeutic accuracy

---

## 🚀 Quick Start

**Everything is already integrated and working!**

```bash
# Start MemoryMesh
npm run dev
```

**Test OMI** (without device):
```bash
curl -X POST http://localhost:5000/api/omi/simulate \
  -H "Content-Type: application/json" \
  -d '{"text": "I forgot where I put my glasses. Did you see them?"}'
```

**Trigger Scenario**:
- Click ⚡ button in dashboard
- Click any scenario
- Hear ElevenLabs natural voice!

---

## 📝 Summary

MemoryMesh now has:
- ✅ Real webcam feed
- ✅ OMI Dev Kit 2 conversation listening
- ✅ ElevenLabs natural voice synthesis
- ✅ Google Home integration (fallback)
- ✅ Unique, personalized responses
- ✅ Multi-modal AI intelligence
- ✅ Proactive intervention capability
- ✅ Complete conversation tracking

**Result**: The most advanced, empathetic, intelligent Alzheimer's care system ever built! 🧠💙
