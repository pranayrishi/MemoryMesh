# SMS Notification Setup Guide

MemoryMesh can now send text messages to caretakers when interventions occur! This guide will help you set up SMS notifications using Twilio.

## Features

- **Emergency Alerts**: Immediate SMS for critical situations requiring urgent attention
- **Notify Alerts**: Informational SMS when AI is handling but wants to keep you informed
- **AI-Only Updates**: Optional SMS when AI resolves situations independently (disabled by default)
- **Smart Messaging**: Different message formats based on intervention severity
- **Message History**: Track all SMS notifications sent

## Quick Setup

### Step 1: Install Twilio Package

```bash
npm install
```

This will install the Twilio SDK that was added to `package.json`.

### Step 2: Get Twilio Credentials

1. **Sign up for Twilio** (if you don't have an account):
   - Go to https://www.twilio.com/try-twilio
   - Sign up for a free trial account
   - You'll get $15 in free credit

2. **Get your credentials** from the Twilio Console:
   - **Account SID**: Found on your dashboard
   - **Auth Token**: Found on your dashboard (click to reveal)

3. **Get a Twilio phone number**:
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number (free with trial)
   - This will be your "from" number

### Step 3: Configure Environment Variables

Create or update your `.env` file in the project root:

```bash
# Twilio SMS Notifications
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
CARETAKER_PHONE_NUMBER=+15103754977
SMS_SEND_AI_ONLY=false
```

**Important Notes:**
- Phone numbers must be in E.164 format: `+1` followed by area code and number
- The caretaker number is already set to: `+15103754977`
- `SMS_SEND_AI_ONLY=false` means you'll only get texts for emergencies and notify-level events

### Step 4: Verify Phone Number (Trial Accounts Only)

If using a Twilio trial account:
1. Go to Twilio Console → Phone Numbers → Verified Caller IDs
2. Add and verify the caretaker phone number: `+15103754977`
3. Twilio will send a verification code to that number

### Step 5: Restart the Backend

```bash
# Stop the current backend (Ctrl+C)
# Then restart:
node backend/server.js
```

You should see:
```
✅ SMS Notification Service initialized
   Caretaker: ***-***-4977
```

## Testing SMS Notifications

### Test 1: Send a Test Message

```bash
curl -X POST http://localhost:5000/api/sms/test
```

You should receive a test SMS on the caretaker phone.

### Test 2: Trigger Demo Scenarios

1. Open the dashboard: `http://localhost:3000`
2. Click the **⚡ Demo Scenarios** button
3. Trigger different scenarios to see different message types:
   - **Meal Confusion** → AI-Only (no SMS by default)
   - **Stove Safety** → Emergency (SMS sent immediately)
   - **Wandering** → Notify (SMS sent with details)

## Message Examples

### Emergency Level (Stove Safety)
```
🚨 URGENT - MemoryMesh Alert

Margaret needs immediate attention!

Situation: Stove safety concern detected

AI Response: Margaret, I noticed the stove is on...

⚠️ CARETAKER ACTION REQUIRED
Please check on Margaret immediately.

Time: 12:34 PM
```

### Notify Level (Wandering)
```
⚠️ MemoryMesh Alert

Margaret - Attempting to leave home

AI is handling the situation but wanted to keep you informed.

What AI did: Showed family photos, Played calming music

Status: Monitoring closely

You may want to check in when convenient.

Time: 12:34 PM
```

### AI-Only Level (Optional)
```
✅ MemoryMesh Update

Margaret - Confusion about recent meals

AI has it covered! No action needed.

What happened: Showed meal evidence, Showed family photos

Status: Resolved independently

Time: 12:34 PM
```

## Configuration Options

### Enable SMS for AI-Only Interventions

If you want to receive texts even when AI handles things independently:

```bash
# In .env file
SMS_SEND_AI_ONLY=true
```

**Note**: This will send more frequent messages. Most users prefer to only receive emergency and notify-level alerts.

### Change Caretaker Phone Number

Update the `.env` file:

```bash
CARETAKER_PHONE_NUMBER=+1234567890
```

## API Endpoints

### Check SMS Status
```bash
curl http://localhost:5000/api/sms/status
```

Response:
```json
{
  "enabled": true,
  "caretakerNumber": "***-***-4977",
  "messagesSent": 5,
  "lastMessage": "2025-10-25T18:30:00.000Z"
}
```

### Get SMS History
```bash
curl http://localhost:5000/api/sms/history?limit=10
```

### Send Test Message
```bash
curl -X POST http://localhost:5000/api/sms/test
```

## Troubleshooting

### "SMS service not configured"

**Problem**: Missing Twilio credentials in `.env` file

**Solution**: 
1. Check that `.env` file exists in project root
2. Verify all three Twilio variables are set:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
3. Restart the backend server

### "Unable to create record"

**Problem**: Trial account trying to send to unverified number

**Solution**: 
1. Go to Twilio Console
2. Verify the caretaker phone number
3. Or upgrade to a paid account (no verification needed)

### "Invalid phone number format"

**Problem**: Phone number not in E.164 format

**Solution**: Use format `+1XXXXXXXXXX` (e.g., `+15103754977`)

### SMS not being sent for interventions

**Problem**: SMS service might be disabled or intervention level doesn't trigger SMS

**Solution**:
1. Check SMS status: `curl http://localhost:5000/api/sms/status`
2. Verify `enabled: true`
3. Remember: AI-only interventions don't send SMS by default
4. Try triggering a "stove_safety" scenario (emergency level)

## Cost Information

### Twilio Trial Account
- **Free credit**: $15
- **SMS cost**: ~$0.0075 per message (US)
- **Estimated messages**: ~2,000 messages with trial credit

### Paid Account
- **Monthly cost**: Pay-as-you-go, no monthly fee
- **SMS cost**: $0.0079 per message (US)
- **Example**: 100 messages/month = ~$0.79/month

## Privacy & Security

- Phone numbers are masked in logs: `***-***-4977`
- Twilio credentials stored in `.env` (not committed to git)
- Messages include only necessary information
- No sensitive medical data in SMS content

## Next Steps

1. **Set up Twilio account** and get credentials
2. **Add credentials to `.env`** file
3. **Verify phone number** (if using trial)
4. **Restart backend** server
5. **Send test message** to verify setup
6. **Trigger demo scenarios** to see it in action

For questions or issues, check the Twilio documentation: https://www.twilio.com/docs/sms
