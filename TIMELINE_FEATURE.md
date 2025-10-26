# Key Moments Timeline Feature

## ✨ New Feature Added to Live Camera Feed

### **Visual Timeline of Detected Scenarios**

A color-coded timeline that tracks all scenario changes during a camera session, appearing below the camera feed when you stop recording.

---

## 🎨 How It Works

### **Color Coding**

The timeline bar changes color based on detected scenarios:

- 🟢 **Green** - Normal (no concerns)
- 🟡 **Yellow** - Confusion detected
- 🟠 **Orange** - Agitation detected
- 🔵 **Blue** - Wandering detected
- 🔴 **Red** - Fall Risk detected

### **Timeline Behavior**

1. **Start Camera**: Timeline is cleared, new session begins
2. **While Recording**: Timeline tracks scenario changes in background
3. **Stop Camera**: Timeline appears below video feed showing entire session
4. **Start Again**: Timeline is cleared for new session

---

## 📊 Timeline Components

### 1. **Visual Timeline Bar**

A horizontal bar that shows the entire session:
- Starts green (normal)
- Changes color when scenarios are detected
- Each segment represents time spent in that scenario
- Proportional to actual duration

### 2. **Time Markers**

Vertical lines with timestamps showing when each scenario change occurred.

### 3. **Event List**

Detailed list of all detected events showing:
- Icon for scenario type
- Scenario name
- Confidence percentage
- Exact time of detection
- Color-coded badges

### 4. **Legend**

Color key explaining what each color represents.

---

## 🎯 Use Cases

### **Example Session**

```
Session Start: 4:30:00 PM
├─ 4:30:00 - 4:30:45 → Normal (Green, 45 seconds)
├─ 4:30:45 - 4:31:10 → Confusion (Yellow, 25 seconds)
├─ 4:31:10 - 4:31:50 → Normal (Green, 40 seconds)
├─ 4:31:50 - 4:32:05 → Fall Risk (Red, 15 seconds)
└─ 4:32:05 - 4:32:30 → Normal (Green, 25 seconds)
Session End: 4:32:30 PM
```

**Timeline Visualization**:
```
[████████Green████████][█Yellow█][████Green████][Red][█Green█]
```

---

## 💡 Benefits

### **For Caregivers**

1. **Session Review**: See exactly when concerns occurred
2. **Pattern Recognition**: Identify triggers for confusion/agitation
3. **Documentation**: Visual record of monitoring session
4. **Quick Assessment**: At-a-glance view of session safety

### **For Healthcare Providers**

1. **Objective Data**: Timestamped events with confidence scores
2. **Risk Assessment**: Frequency and duration of concerning behaviors
3. **Progress Tracking**: Compare sessions over time
4. **Evidence-Based Care**: Data to support care decisions

### **For Demonstrations**

1. **Visual Impact**: Clear, colorful representation
2. **Easy to Understand**: Intuitive color coding
3. **Professional**: Polished, modern UI
4. **Comprehensive**: Shows both timeline and detailed events

---

## 🔧 Technical Details

### **Data Tracked**

Each timeline event includes:
```javascript
{
  timestamp: 45000,           // Milliseconds since session start
  scenario: 'fall_risk',      // Detected scenario
  confidence: 0.85,           // AI confidence (0-1)
  time: '4:30:45 PM'         // Human-readable time
}
```

### **Scenario Detection**

Timeline updates when:
- Scenario changes from previous state
- Example: Normal → Confusion (adds event)
- Example: Confusion → Confusion (no event, continues)

### **Performance**

- Minimal overhead (only updates on scenario change)
- Efficient rendering (CSS-based visualization)
- Smooth animations
- Responsive design

---

## 🎨 UI Features

### **Timeline Bar**

- Height: 48px (3rem)
- Rounded corners
- Smooth color transitions
- Overflow handling for long sessions

### **Event Cards**

- Color-coded backgrounds
- Icons for each scenario type
- Confidence percentage
- Timestamp
- Hover effects

### **Responsive Design**

- Desktop: 5-column legend
- Tablet: 3-column legend
- Mobile: 2-column legend
- Timeline scales to container width

---

## 📱 User Flow

### **Step 1: Start Camera**

```
User clicks "Start Camera"
↓
Timeline cleared
Session start time recorded
Background tracking begins
```

### **Step 2: Recording Session**

```
Camera running
↓
Pose detection active
↓
Scenario detected: Confusion
↓
Timeline event added (silently)
↓
Scenario returns to Normal
↓
Timeline event added
```

### **Step 3: Stop Camera**

```
User clicks "Stop Camera"
↓
Camera stops
↓
Timeline appears below video
↓
Shows visual bar + event list + legend
```

### **Step 4: Start Again**

```
User clicks "Start Camera" again
↓
Timeline cleared
New session begins
Previous data lost
```

---

## 🎯 Example Scenarios

### **Scenario 1: Brief Confusion**

**Session**: 2 minutes
**Events**:
- 0:00-1:30 → Normal (green)
- 1:30-1:45 → Confusion (yellow)
- 1:45-2:00 → Normal (green)

**Timeline**: Mostly green with small yellow segment

**Interpretation**: Brief moment of confusion, quickly resolved

---

### **Scenario 2: Fall Risk Alert**

**Session**: 3 minutes
**Events**:
- 0:00-2:00 → Normal (green)
- 2:00-2:15 → Fall Risk (red)
- 2:15-3:00 → Normal (green)

**Timeline**: Green with prominent red segment

**Interpretation**: Significant fall risk detected, requires attention

---

### **Scenario 3: Multiple Concerns**

**Session**: 5 minutes
**Events**:
- 0:00-1:00 → Normal (green)
- 1:00-1:30 → Confusion (yellow)
- 1:30-2:00 → Agitation (orange)
- 2:00-3:00 → Normal (green)
- 3:00-3:20 → Wandering (blue)
- 3:20-5:00 → Normal (green)

**Timeline**: Multiple color segments

**Interpretation**: Session with several concerning behaviors, needs review

---

## 📊 Data Insights

### **What You Can Learn**

1. **Duration**: How long each scenario lasted
2. **Frequency**: How often scenarios change
3. **Patterns**: Which scenarios follow others
4. **Severity**: Confidence levels for each detection
5. **Timing**: When during session concerns occurred

### **Example Analysis**

```
Session: 10 minutes
Total Events: 5
Normal: 8 minutes (80%)
Confusion: 1 minute (10%)
Fall Risk: 1 minute (10%)

Insight: Mostly stable session with brief concerns
```

---

## 🎨 Visual Design

### **Colors**

- Green (#10b981): Safe, normal
- Yellow (#f59e0b): Caution, confusion
- Orange (#f97316): Warning, agitation
- Blue (#3b82f6): Alert, wandering
- Red (#ef4444): Danger, fall risk

### **Typography**

- Headers: Bold, 18px
- Event names: Medium, 16px
- Timestamps: Monospace, 14px
- Confidence: Regular, 14px

### **Spacing**

- Timeline bar: 12px height
- Event cards: 12px padding
- Section gaps: 24px
- Legend items: 12px gap

---

## ✅ Summary

**New Feature**: Key Moments Timeline

**Location**: Live Camera Feed tab, below video (when stopped)

**Functionality**:
- ✅ Color-coded timeline bar
- ✅ Scenario change tracking
- ✅ Detailed event list
- ✅ Confidence scores
- ✅ Timestamps
- ✅ Visual legend
- ✅ Clears on new session

**Benefits**:
- Visual session review
- Pattern recognition
- Documentation
- Professional presentation
- Easy to understand

**Perfect for demonstrating the system's real-time monitoring and analysis capabilities!** 🎉
