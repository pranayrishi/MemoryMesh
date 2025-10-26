# MemoryMesh Quick Start Guide

## 🚀 System is Running!

**Backend**: http://localhost:5000 ✅  
**Frontend**: http://localhost:3000 ✅

## 📺 What You'll See Now

### 1. Open Dashboard
Navigate to: **http://localhost:3000**

### 2. New Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│  MemoryMesh - AI-Powered Cognitive Co-Pilot                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────────────┐
│   VIDEO MONITOR          │   LATEST INTERVENTION            │
│                          │                                  │
│   [AI Video Analysis]    │   AI Reasoning: ...              │
│   • No webcam needed     │   Voice Message: ...             │
│   • Shows AI videos      │   Actions: ...                   │
│   • Persona detection    │   Learning: ...                  │
│                          │                                  │
└──────────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│   STATISTICS OVERVIEW                                        │
│   [6 stat cards with real-time data]                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────────────┐
│   ACTIVITY TIMELINE      │   BEHAVIORAL PATTERNS            │
│   • All interventions    │   • Peak confusion times         │
│   • Real-time updates    │   • Common scenarios             │
│   • Full details         │   • AI recommendations           │
└──────────────────────────┴──────────────────────────────────┘
```

## 🎯 How to Trigger Demo

### Step 1: Click ⚡ Button
Look for the **purple lightning bolt button** in the bottom-right corner.

### Step 2: Select Scenario
Choose from:
- **Meal Confusion** - Patient checking fridge repeatedly
- **Stove Safety** - Burner on with no pot (EMERGENCY)
- **Wandering** - Patient attempting to leave house
- **Agitation** - Patient showing signs of distress

### Step 3: Watch Everything Update

**Immediately**:
- ✅ VideoMonitor shows video (if generated) or scenario info
- ✅ Persona detection appears (grandma/grandpa)
- ✅ Intervention card fills with details
- ✅ Voice plays through speakers

**Within 1 second**:
- ✅ Statistics increment
- ✅ Timeline adds new event
- ✅ Behavioral patterns update

## 📊 What Each Section Shows

### VideoMonitor (Top-Left)
**Before Demo**:
```
┌────────────────────────┐
│   No Active Scenario   │
│   Click ⚡ to trigger  │
└────────────────────────┘
```

**After Demo**:
```
┌────────────────────────┐
│  [AI VIDEO PLAYING]    │
│  👁️ Grandma (100%)     │
│  Meal Confusion        │
└────────────────────────┘
```

### InterventionCard (Top-Right)
Shows:
- ✅ AI Reasoning (why intervention needed)
- ✅ Voice Message (what AI said)
- ✅ Actions Planned (4-6 items)
- ✅ AI Learning (insights)
- ✅ Caregiver Notifications (if applicable)

### Statistics (Middle)
Shows:
- Total Interventions: **Count**
- AI-Only Handled: **Percentage**
- Caregiver Notified: **Count**
- Emergencies: **Count**
- Success Rate: **Percentage**
- Response Time: **Seconds**

### Timeline (Bottom-Left)
Shows each intervention with:
- ⏰ Timestamp
- 📝 AI reasoning
- 🔊 Voice message
- ✅ Actions taken
- 🏷️ Level badge (AI-only/Notify/Emergency)

### Behavioral Patterns (Bottom-Right)
Shows:
- 📈 Peak confusion times (by hour)
- 🎯 Most common scenarios
- 💡 AI recommendations
- 📊 Intervention breakdown

## 🧪 Test Scenarios

### Test 1: Single Intervention
```
1. Click ⚡
2. Select "Meal Confusion"
3. Verify:
   - Intervention card shows details
   - Statistics: Total = 1, AI-Only = 1
   - Timeline has 1 event
```

### Test 2: Multiple Interventions
```
1. Trigger "Meal Confusion"
2. Wait 2 seconds
3. Trigger "Wandering"
4. Wait 2 seconds
5. Trigger "Agitation"
6. Verify:
   - Statistics: Total = 3
   - Timeline has 3 events
   - Patterns show data
```

### Test 3: Emergency Scenario
```
1. Trigger "Stove Safety"
2. Verify:
   - Intervention level: EMERGENCY
   - Statistics: Emergency = 1
   - Timeline shows red badge
   - Caregiver notification displayed
```

## 🔍 Troubleshooting

### "No interventions yet"
✅ **Normal** - Trigger a scenario using ⚡ button

### Statistics showing all zeros
✅ **Normal** - No interventions triggered yet
❌ **Problem** - If zeros after triggering, refresh browser

### Timeline empty
✅ **Normal** - No interventions yet
❌ **Problem** - Check browser console (F12) for errors

### VideoMonitor shows placeholder
✅ **Normal** - Videos not generated yet (optional feature)
✅ **Expected** - System works without videos

### Actions not showing
❌ **Check** - Refresh browser
❌ **Check** - Look in browser console for errors
❌ **Check** - Verify backend is running

## 📝 Expected Behavior

### Meal Confusion Scenario
**What Happens**:
1. AI detects meal confusion
2. Shows timestamped meal photo
3. Redirects to family photos
4. Plays calming music
5. Suggests bird watching

**Statistics Update**:
- Total: +1
- AI-Only: +1
- Success Rate: Increases

**Timeline Entry**:
- Type: AI_ONLY (green badge)
- 4 actions listed
- Voice message shown

### Stove Safety Scenario
**What Happens**:
1. AI detects critical safety issue
2. Turns off stove automatically
3. Calm redirection (no alarm)
4. Bird watching suggestion
5. Plays calming music
6. **Notifies caregiver immediately**

**Statistics Update**:
- Total: +1
- Emergency: +1
- Caregiver Notified: +1

**Timeline Entry**:
- Type: EMERGENCY (red badge)
- 6 actions listed
- Critical notification shown

## 🎨 Visual Indicators

### Badges
- 🟢 **Green** (AI-Only) - Handled independently
- 🟡 **Yellow** (Notify) - Caregiver informed
- 🔴 **Red** (Emergency) - Critical situation

### Icons
- 🎬 **Film** - AI video active
- 👁️ **Eye** - Persona detected
- 🔊 **Speaker** - Voice message
- ✅ **Check** - Action completed
- 🧠 **Brain** - AI insights
- ⚡ **Lightning** - Demo trigger

## 💡 Pro Tips

### See More Data
Trigger 5-10 scenarios to see:
- Meaningful percentages in statistics
- Pattern analysis in behavioral section
- Peak confusion times
- AI recommendations

### Test Different Times
The system tracks time-of-day patterns. Trigger scenarios at different times to see peak hour analysis.

### Watch Timeline
The timeline is chronological - newest at top. Scroll to see full history.

### Check Patterns
After 3+ interventions, behavioral patterns will show:
- Which scenarios are most common
- What times need more attention
- AI-generated recommendations

## 🚫 What's Removed

### ❌ No More Webcam
- No camera permission needed
- No black screen issues
- No privacy concerns
- Cleaner interface

### ✅ What's Added
- AI video analysis
- Persona detection
- Real-time statistics
- Functional timeline
- Behavioral insights

## 📞 Need Help?

### Check These First:
1. **Browser console** (F12) - Look for errors
2. **Backend running?** - http://localhost:5000/api/health
3. **Frontend loaded?** - http://localhost:3000
4. **Refresh browser** - Clear cache if needed

### Common Issues:
- **Blank page**: Check backend is running
- **No updates**: Refresh browser
- **WebSocket errors**: Ignore (React dev server)
- **Videos not playing**: Normal (not generated yet)

## 🎯 Success Checklist

After triggering a scenario, you should see:

- [ ] VideoMonitor shows scenario info
- [ ] Intervention card has full details
- [ ] Statistics increment
- [ ] Timeline adds new event
- [ ] All sections update automatically
- [ ] No errors in console

If all checked ✅ - **System working perfectly!**

---

**Your MemoryMesh system is now fully functional with AI video analysis, real-time statistics, and comprehensive behavioral insights!**

Open http://localhost:3000 and click ⚡ to see it in action!
