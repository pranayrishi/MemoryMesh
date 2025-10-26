# Dashboard Data Display Guide

## Why Dashboard Components Are Empty

The Activity Timeline, Statistics Overview, and Behavioral Patterns components are currently empty because:

1. **No interventions have been triggered yet** - The system starts with a clean slate
2. **Data is stored in memory** - When the backend restarts, all intervention history is cleared
3. **Components require intervention data** - They display information from triggered demo scenarios

## How to Populate the Dashboard

### Step 1: Start Both Servers

```bash
# Option 1: Use the startup script
./start-servers.sh

# Option 2: Start manually
# Terminal 1 - Backend
node backend/server.js

# Terminal 2 - Frontend
cd frontend && npm start
```

### Step 2: Trigger Demo Scenarios

Once the dashboard loads at `http://localhost:3000`, click the **⚡ Demo Scenarios** button at the bottom of the screen to trigger interventions:

- **Meal Confusion** - Patient asking about meals they already ate
- **Stove Safety** - Burner left on, potential fire hazard
- **Wandering** - Patient attempting to leave home

### Step 3: Watch Data Populate

After triggering scenarios, you'll see:

#### Statistics Overview
- **Total Interventions** - Count of all triggered scenarios
- **AI-Only Handled** - Percentage handled without caregiver notification
- **Caregiver Notified** - Situations requiring caregiver awareness
- **Emergencies** - Critical situations requiring immediate action
- **Success Rate** - Effectiveness of AI interventions
- **Response Time** - Average time to respond

#### Activity Timeline
- Chronological list of all interventions
- Shows timestamp, scenario type, AI response
- Displays actions taken (voice message, photos shown, etc.)
- Color-coded by intervention level (AI-only, Notify, Emergency)

#### Behavioral Patterns
- **Peak Confusion Times** - Hours with most interventions
- **Common Scenarios** - Most frequent intervention types
- **AI Recommendations** - Proactive care suggestions
- **Intervention Breakdown** - Visual breakdown by level

## Understanding the Data Flow

```
Demo Scenario Triggered
    ↓
Backend processes intervention
    ↓
Statistics updated in memory
    ↓
WebSocket broadcasts to frontend
    ↓
Dashboard components re-render with new data
```

## Important Notes

### Data Persistence
- **Current State**: Data is stored in memory only
- **On Restart**: All statistics and history are cleared
- **Future Enhancement**: Could add database persistence for long-term tracking

### Real-time Updates
- Dashboard updates automatically via WebSocket
- No page refresh needed
- Statistics refresh after each intervention

### Empty State Messages
When no data is available, components show helpful messages:
- "No events yet today" - Timeline is empty
- "No patterns yet" - Behavioral patterns need data
- "Ready to Monitor" - Statistics waiting for interventions

## Testing the System

### Quick Test Flow
1. Open dashboard: `http://localhost:3000`
2. Click **⚡ Demo Scenarios** button
3. Click **Meal Confusion** scenario
4. Watch the intervention card update with AI response
5. Check Statistics Overview - should show 1 intervention
6. Check Activity Timeline - should show the meal confusion event
7. Trigger 2-3 more scenarios
8. Check Behavioral Patterns - should show patterns and recommendations

### Expected Results After 3 Scenarios
- **Statistics**: 3 total interventions, percentages calculated
- **Timeline**: 3 events listed chronologically
- **Patterns**: Peak times identified, recommendations generated

## Troubleshooting

### "Loading statistics..." never changes
- **Cause**: Backend not running or not connected
- **Fix**: Check backend is running on port 5000
- **Test**: Visit `http://localhost:5000/api/health`

### Statistics show 0% or incorrect values
- **Cause**: Bug in percentage calculation (now fixed)
- **Fix**: Restart backend server to apply the fix
- **Verify**: Trigger a scenario and check if percentages update

### Timeline shows "No events yet today"
- **Cause**: No interventions have been triggered
- **Fix**: Click ⚡ button and trigger a demo scenario
- **Note**: This is the expected initial state

### Behavioral Patterns empty
- **Cause**: Requires multiple interventions to detect patterns
- **Fix**: Trigger 3+ scenarios to see pattern analysis
- **Note**: Shows helpful empty state until data is available

## API Endpoints for Manual Testing

```bash
# Check backend health
curl http://localhost:5000/api/health

# Get current statistics
curl http://localhost:5000/api/statistics

# Get timeline
curl http://localhost:5000/api/timeline

# Get daily summary
curl http://localhost:5000/api/summary/daily

# Trigger a scenario via API
curl -X POST http://localhost:5000/api/demo/scenario/meal_confusion

# Get intervention history
curl http://localhost:5000/api/history/interventions?limit=10
```

## Next Steps

1. **Start the servers** using `./start-servers.sh`
2. **Open the dashboard** at `http://localhost:3000`
3. **Trigger demo scenarios** using the ⚡ button
4. **Watch the data populate** in real-time
5. **Explore the insights** generated by the AI

The dashboard is designed to be intuitive and self-explanatory once data starts flowing. The empty states provide clear guidance on what to do next.
