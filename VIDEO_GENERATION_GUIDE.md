# Video Generation & Persona Detection Guide

## Overview

MemoryMesh now uses **pre-generated AI videos** instead of live webcam feeds for demo scenarios. Each scenario has two versions: one with a grandma and one with a grandpa. The system uses computer vision to detect which persona is in the video and makes intervention decisions accordingly.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Demo Scenario Trigger                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           VideoPlaybackService (Node.js)                     │
│  • Selects pre-generated video for scenario                 │
│  • Serves video to frontend                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│        PersonaDetectionService (Node.js → Python)            │
│  • Detects grandma vs grandpa from video                    │
│  • Uses filename parsing (fast) or CV analysis (accurate)   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Intervention Decision Logic                     │
│  • Uses detected persona in decision context                │
│  • Generates personalized AI response                       │
│  • Speaks through Google Home / ElevenLabs                  │
└─────────────────────────────────────────────────────────────┘
```

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install openai opencv-python numpy python-dotenv
```

### 2. Set OpenAI API Key

```bash
export OPENAI_API_KEY='your-openai-api-key-here'
```

Or add to `.env` file:
```
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Generate Videos (One-Time)

Generate all 8 videos (4 scenarios × 2 personas):

```bash
python video/generate_persona_videos.py
```

This will create:
- `assets/videos/meal_confusion_grandma.mp4`
- `assets/videos/meal_confusion_grandpa.mp4`
- `assets/videos/stove_safety_grandma.mp4`
- `assets/videos/stove_safety_grandpa.mp4`
- `assets/videos/wandering_grandma.mp4`
- `assets/videos/wandering_grandpa.mp4`
- `assets/videos/agitation_grandma.mp4`
- `assets/videos/agitation_grandpa.mp4`

**Duration**: Each video is 24 seconds, 1080p
**Caching**: Videos are generated once and reused for all demos
**Fingerprinting**: Prompts are hashed; videos regenerate only if prompts change

### 4. Generate Specific Videos

Generate one scenario:
```bash
python video/generate_persona_videos.py --scenario meal_confusion
```

Generate one persona:
```bash
python video/generate_persona_videos.py --persona grandma
```

Generate specific combination:
```bash
python video/generate_persona_videos.py --scenario stove_safety --persona grandpa
```

Force regeneration:
```bash
python video/generate_persona_videos.py --force
```

List all combinations:
```bash
python video/generate_persona_videos.py --list
```

## Scenarios

### 1. Meal Confusion
**Description**: Patient confused about whether they ate lunch  
**Video**: Patient repeatedly checking refrigerator, mild confusion  
**Intervention**: Show timestamped meal photo, redirect to family photos

### 2. Stove Safety
**Description**: Burner on with no pot - critical safety issue  
**Video**: Patient turns on stove, forgets purpose, burner left on  
**Intervention**: Auto-shutoff stove, calm redirection to bird watching

### 3. Wandering
**Description**: Patient attempting to leave the house  
**Video**: Patient approaching door, trying handle, uncertain  
**Intervention**: Validation therapy, reminiscence with travel photos

### 4. Agitation
**Description**: Patient showing signs of stress  
**Video**: Patient fidgeting, pacing, restless movements  
**Intervention**: Calming music, family photos, soothing environment

## Persona Detection

The system detects whether the video shows a grandma or grandpa using two methods:

### Method 1: Filename Parsing (Fast, 100% accurate)
- Parses filename: `{scenario}_{persona}.mp4`
- Instant detection
- Used by default for pre-generated videos

### Method 2: Computer Vision (Slower, heuristic)
- Uses OpenCV face detection
- Analyzes hair color, skin texture, face features
- Fallback for unknown videos
- Currently uses heuristics (can be upgraded to DNN models)

### Test Detection

```bash
python cv/persona_detector.py
```

This will test detection on all videos in `assets/videos/`.

## Integration with Existing System

### No Changes to Other Features

✅ All existing features remain unchanged:
- ElevenLabs voice synthesis
- Google Home integration
- OMI conversation capture
- Claude AI decision engine
- Intervention coordinator
- Dashboard and timeline
- Statistics and patterns

### What Changed

1. **Video Source**: Pre-generated videos instead of live webcam
2. **Persona Context**: Intervention decisions now include detected persona
3. **Demo Flow**: Scenario trigger → Video selection → Persona detection → Intervention

### API Endpoints Added

```javascript
// Get available videos
GET /api/videos/available

// Get video status
GET /api/videos/status

// Get video for scenario
GET /api/videos/scenario/:scenario?persona=grandma

// Get current playing video
GET /api/videos/current

// Get persona detection status
GET /api/persona/status

// Get latest detected persona
GET /api/persona/latest

// Detect persona from video
POST /api/persona/detect
{
  "videoPath": "/path/to/video.mp4",
  "scenario": "meal_confusion"
}
```

## Frontend Integration

The frontend receives video information via WebSocket:

```javascript
// When scenario is triggered
{
  type: 'video_selected',
  scenario: 'meal_confusion',
  persona: 'grandma',
  videoUrl: '/videos/meal_confusion_grandma.mp4',
  detection: {
    persona: 'grandma',
    confidence: 1.0,
    method: 'filename'
  }
}
```

Frontend should:
1. Display the video URL in the LiveMonitor component
2. Show detected persona in the UI
3. Play video when scenario is triggered

## Video Specifications

- **Model**: Sora-2 (OpenAI)
- **Duration**: 24 seconds
- **Resolution**: 1080p (1920×1080)
- **Format**: MP4
- **Style**: Warm home interior, natural lighting, elderly person centered
- **Audio**: Ambient home sounds only (AI speaks separately via Google Home)

## Prompt Engineering

All videos use a consistent visual style defined in `CONSISTENT_STYLE`:
- Warm, comfortable home interior
- Natural daylight and soft indoor lighting
- Elderly person clearly visible and centered
- Calm, peaceful atmosphere
- Professional cinematography
- Realistic behavior and expressions

Each scenario has persona-specific prompts with:
- Visual sequence (0-24s timeline)
- Persona details (age, appearance, clothing)
- Behavior characteristics
- Environment description

## Cost Considerations

**Sora-2 Pricing** (as of 2024):
- ~$0.20-0.40 per second of video
- 24-second video ≈ $5-10
- 8 videos total ≈ $40-80 one-time cost

**Caching Benefits**:
- Videos generated once
- Reused indefinitely for demos
- No recurring generation costs
- Fingerprinting prevents unnecessary regeneration

## Troubleshooting

### Videos Not Found

```
⚠️  No video available for scenario: meal_confusion
   Run: python video/generate_persona_videos.py
```

**Solution**: Generate videos with the command above.

### OpenAI API Key Error

```
❌ Error: OPENAI_API_KEY environment variable not set
```

**Solution**: Set the environment variable:
```bash
export OPENAI_API_KEY='your-key-here'
```

### Python Script Not Found

```
⚠️  Persona detector script not found
```

**Solution**: Ensure `cv/persona_detector.py` exists and is executable.

### OpenCV Not Installed

```
ModuleNotFoundError: No module named 'cv2'
```

**Solution**: Install OpenCV:
```bash
pip install opencv-python
```

### Video Generation Failed

```
❌ Video generation failed: Rate limit exceeded
```

**Solution**: Wait a few minutes and retry. Sora-2 has rate limits.

## Development Workflow

### Adding New Scenarios

1. Add scenario to `SCENARIO_PROMPTS` in `generate_persona_videos.py`
2. Define prompts for both grandma and grandpa
3. Run generator: `python video/generate_persona_videos.py --scenario new_scenario`
4. Update `DemoResponseService.js` with intervention logic
5. Update frontend demo controller

### Updating Video Prompts

1. Edit prompts in `generate_persona_videos.py`
2. Run with `--force` to regenerate: `python video/generate_persona_videos.py --force`
3. New fingerprint will be saved automatically

### Testing

```bash
# Test video generation (dry run)
python video/generate_persona_videos.py --list

# Test persona detection
python cv/persona_detector.py

# Test backend integration
curl http://localhost:5000/api/videos/available
curl http://localhost:5000/api/persona/status
```

## Production Considerations

### For Production Deployment

1. **Store videos in CDN** (S3, CloudFront, etc.)
2. **Upgrade CV detection** to use proper DNN models:
   - Age-gender classification models
   - Face recognition for patient identification
3. **Add video preprocessing**:
   - Compression for faster loading
   - Multiple resolutions (adaptive streaming)
4. **Implement video analytics**:
   - Track which videos are most effective
   - A/B test different personas per patient
5. **Privacy considerations**:
   - Encrypt videos at rest
   - Secure video URLs with signed tokens
   - HIPAA compliance for patient videos

## Support

For issues or questions:
1. Check this guide
2. Review console logs in backend
3. Test individual components (video generation, detection, playback)
4. Verify API keys and dependencies

---

**Built for MemoryMesh - AI-Powered Cognitive Co-Pilot**
