# MemoryMesh - Quick Start Guide

Get MemoryMesh up and running in 5 minutes!

## Prerequisites

- Node.js 16 or higher
- npm (comes with Node.js)

## Installation

### 1. Install Backend Dependencies

```bash
npm install
```

This installs all backend dependencies including:
- Express (web server)
- Anthropic SDK (Claude AI)
- OpenAI SDK
- WebSocket (real-time communication)
- And more...

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

This installs React, Tailwind CSS, and all frontend dependencies.

## Running MemoryMesh

### Option 1: Run Both Services Together (Recommended)

```bash
npm run dev
```

This will start:
- Backend server at http://localhost:5000
- Frontend dashboard at http://localhost:3000

Your browser will automatically open to the dashboard.

### Option 2: Run Services Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Testing the System

### Test Demo Scenarios (CLI)

Before running the full app, you can test the AI intervention system:

```bash
npm run test-demo
```

This will run through all four demo scenarios and show you:
- AI reasoning
- Generated voice messages
- Actions taken
- Intervention statistics

### Test Demo Scenarios (Dashboard)

1. Make sure both backend and frontend are running (`npm run dev`)
2. Open http://localhost:3000 in your browser
3. Click the ⚡ lightning bolt button in the bottom-right corner
4. Click any scenario button to trigger:
   - 🍽️ Meal Confusion
   - 🔥 Stove Safety
   - 🚶 Wandering
   - 😰 Agitation

5. Watch the dashboard update in real-time!

## What You'll See

### On the Dashboard

**Live Monitor (Top Left)**
- Simulated video feed
- AI annotations showing location and activity
- Safety concerns highlighted
- Urgency level indicator

**Latest Intervention (Top Right)**
- Scenario detected
- AI reasoning
- Voice message spoken to patient
- Actions taken
- Caregiver notifications

**Statistics Panel (Middle)**
- Total interventions
- AI-only handling percentage (target: 90%)
- Caregiver notifications (target: 8%)
- Emergency escalations (target: 2%)
- Success rate and response time

**Activity Timeline (Bottom Left)**
- Chronological log of all activities
- Interventions with details
- Color-coded by type

**Behavioral Patterns (Bottom Right)**
- Peak confusion times
- Common scenarios
- AI recommendations
- Learning progress

## Understanding the Demo

### Scenario 1: Meal Confusion
**Trigger**: Patient forgot they ate lunch 30 minutes ago

**Expected AI Response**:
- Shows timestamped meal evidence
- Gentle reminder with validation
- Redirection to pleasant activity (family photos)
- No caregiver alert (AI handles it)

**Example Voice Message**:
> "Hi Margaret, I see you're looking for something to eat. You know what? You just had a wonderful chicken soup lunch 30 minutes ago. How about we look at photos of Emma's soccer game instead?"

### Scenario 2: Stove Safety
**Trigger**: Stove burner on with no pot (critical safety issue)

**Expected AI Response**:
- Immediate calm engagement
- Smart home turns off stove automatically
- Gentle redirection to safe activity
- Caregiver notified immediately
- High urgency

**Example Voice Message**:
> "Hi Margaret, I see you're at the stove. What would you like to cook? Actually, how about we watch the birds at the feeder instead? I'll put on some Frank Sinatra for you."

### Scenario 3: Wandering
**Trigger**: Patient near door, attempting to leave

**Expected AI Response**:
- Validation without harsh restriction
- Reminiscence therapy (Hawaii trip memories)
- Engaging indoor activity
- Moderate caregiver notification

**Example Voice Message**:
> "Margaret, would you like to go somewhere? Let me show you these beautiful photos from your Hawaii trip with Robert first. The weather is so lovely in these pictures."

### Scenario 4: Agitation
**Trigger**: Patient showing signs of distress

**Expected AI Response**:
- Calming music (Frank Sinatra favorites)
- Comforting family photos
- Soothing environment
- Validation therapy

**Example Voice Message**:
> "Margaret, let's listen to 'Fly Me to the Moon' together. And I have some lovely photos of Emma and Lucas to show you. They're growing up so fast!"

## Key Features to Notice

### 1. Personalization
- Uses Margaret's actual name and preferences
- References specific family members (Emma, Lucas, Robert)
- Mentions favorite music (Frank Sinatra)
- Uses cherished memories (Hawaii trip)

### 2. Therapeutic Techniques
- **Validation**: Never says "that's wrong"
- **Reminiscence**: Uses long-term memories
- **Redirection**: Shifts to positive stimuli
- **Sensory**: Music and photos

### 3. Intervention Hierarchy
- **AI-Only (90%)**: No caregiver disturbance
- **Notify (8%)**: Gentle alert while AI handles it
- **Emergency (2%)**: Immediate escalation

### 4. Continuous Learning
- Tracks what works
- Analyzes patterns
- Improves over time
- Generates recommendations

## Troubleshooting

### Backend won't start
**Error**: "Cannot find module"
```bash
npm install
```

### Frontend won't start
**Error**: Dependencies missing
```bash
cd frontend
npm install
```

### Port already in use
**Error**: "EADDRINUSE"

Change ports in:
- `backend/.env`: Change PORT=5000 to PORT=5001
- `frontend/.env`: Change REACT_APP_API_URL to use new port

### WebSocket not connecting
1. Make sure backend is running first
2. Check console for errors
3. Refresh the frontend page

### API errors
Check that API keys are properly set in `backend/.env`:
- ANTHROPIC_API_KEY
- OPENAI_API_KEY
- CREAO_API_URL

## Next Steps

### Customize the Patient Profile

Edit `backend/models/PatientProfile.js` to:
- Change patient name and preferences
- Add different family members
- Update favorite music
- Modify routine and schedule

### Add New Scenarios

Create custom scenarios in `backend/services/ConversationEngine.js`

### Integrate Real Webcam

Replace simulated feed with actual webcam in production.

### Connect Google Home

Integrate real Google Home API for voice output.

## Getting Help

- Check the full README.md for detailed documentation
- Review code comments for implementation details
- Test scenarios with `npm run test-demo`

## Production Deployment

For actual deployment:
1. Add user authentication
2. Implement database for persistence
3. Set up proper error logging
4. Configure HTTPS
5. Integrate real webcam
6. Connect actual Google Home devices
7. Add comprehensive testing

---

**Ready to see MemoryMesh in action?**

```bash
npm run dev
```

Then click the ⚡ button and trigger scenarios!

🧠 **MemoryMesh** - Compassionate AI care that never sleeps.
