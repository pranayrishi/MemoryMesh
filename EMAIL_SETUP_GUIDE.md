# Email Notification Setup Guide

MemoryMesh sends email alerts to **pranayrishi.nalem@gmail.com** when interventions occur.

## Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already enabled

### Step 2: Create App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "MemoryMesh"
4. Click **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Add to .env File

Create `/Users/rishinalem/MindMesh/.env` with:

```bash
# Email Notifications
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_FROM=memorymesh@notifications.com
CARETAKER_EMAIL=pranayrishi.nalem@gmail.com
EMAIL_SEND_AI_ONLY=false
```

**Important**: 
- Use your Gmail address for `SMTP_USER`
- Use the 16-character app password (no spaces) for `SMTP_PASS`
- The caretaker email is already set to `pranayrishi.nalem@gmail.com`

### Step 4: Restart Backend

```bash
# Stop current backend (Ctrl+C if running)
node backend/server.js
```

You should see:
```
✅ Email Notification Service initialized
   Caretaker: p***l@gmail.com
```

### Step 5: Test It

```bash
curl -X POST http://localhost:5000/api/email/test
```

Check **pranayrishi.nalem@gmail.com** for the test email!

## Email Types

### 🚨 Emergency (Stove Safety, Falls)
**Subject**: `🚨 URGENT: Margaret - Stove safety concern detected`

Beautiful HTML email with:
- Red header indicating urgency
- AI response details
- "View Dashboard" button
- Clear action required message

### ⚠️ Notify (Wandering, Agitation)
**Subject**: `⚠️ Alert: Margaret - Attempting to leave home`

Orange-themed email with:
- What AI is doing
- Status update
- "Check in when convenient" message

### ✅ AI-Only (Optional, Disabled by Default)
**Subject**: `✅ Update: Margaret - Confusion about recent meals`

Green-themed email with:
- "AI has it covered" message
- What actions were taken
- No action needed

## Configuration

### Enable AI-Only Emails

To receive emails even for minor issues AI handles:

```bash
# In .env
EMAIL_SEND_AI_ONLY=true
```

**Default**: Only emergency and notify-level events send emails.

## API Endpoints

```bash
# Check email service status
curl http://localhost:5000/api/email/status

# View email history
curl http://localhost:5000/api/email/history

# Send test email
curl -X POST http://localhost:5000/api/email/test
```

## Troubleshooting

### "Email service not configured"
- Check `.env` file exists in project root
- Verify `SMTP_USER` and `SMTP_PASS` are set
- Restart backend

### "Invalid login" or "Authentication failed"
- Make sure 2FA is enabled on Gmail
- Use App Password, not regular Gmail password
- Remove spaces from app password
- Try generating a new app password

### Emails not arriving
- Check spam/junk folder
- Verify caretaker email is correct
- Check email history: `curl http://localhost:5000/api/email/history`
- Look for error messages in backend logs

### Using a different email provider

**Outlook/Hotmail**:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo**:
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

**Custom SMTP**:
Just update `SMTP_HOST` and `SMTP_PORT` in `.env`

## Cost

**100% FREE** - No API costs, no monthly fees!

## Privacy & Security

- Email addresses masked in logs: `p***l@gmail.com`
- Credentials stored in `.env` (gitignored)
- No sensitive medical data in emails
- Only patient first name and general scenario type

## What's Included in Emails

✅ Patient first name
✅ Scenario type (general)
✅ AI actions taken
✅ Timestamp
✅ Link to dashboard

❌ No medical records
❌ No personal health information
❌ No sensitive details

## Next Steps

1. **Enable 2FA** on your Gmail account
2. **Generate app password** for MemoryMesh
3. **Add credentials** to `.env` file
4. **Restart backend** server
5. **Send test email** to verify
6. **Trigger demo scenarios** to see real alerts

Emails will arrive within seconds of an intervention occurring!
