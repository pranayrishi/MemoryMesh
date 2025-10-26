# Video Generation Module

## Overview

Generates polished AI videos using OpenAI's Sora-2 for MemoryMesh demo scenarios.

## Quick Start

```bash
# Set API key
export OPENAI_API_KEY='your-key-here'

# Generate all videos (4 scenarios × 2 personas = 8 videos)
python generate_persona_videos.py

# Generate specific scenario
python generate_persona_videos.py --scenario meal_confusion

# Generate specific persona
python generate_persona_videos.py --persona grandma

# Force regeneration
python generate_persona_videos.py --force

# List all combinations
python generate_persona_videos.py --list
```

## Output

Videos are saved to `../assets/videos/`:
- `meal_confusion_grandma.mp4`
- `meal_confusion_grandpa.mp4`
- `stove_safety_grandma.mp4`
- `stove_safety_grandpa.mp4`
- `wandering_grandma.mp4`
- `wandering_grandpa.mp4`
- `agitation_grandma.mp4`
- `agitation_grandpa.mp4`

## Features

- **Caching**: Videos generated once, reused forever
- **Fingerprinting**: Regenerates only if prompts change
- **Consistent Style**: All videos use same visual style
- **24 seconds**: Perfect length for demo scenarios
- **1080p**: High-quality output

## Scenarios

1. **Meal Confusion**: Patient checking fridge repeatedly
2. **Stove Safety**: Burner on with no pot (critical)
3. **Wandering**: Patient attempting to leave house
4. **Agitation**: Patient showing signs of distress

## Personas

- **Grandma**: Female, 70-75 years old, warm demeanor
- **Grandpa**: Male, 70-75 years old, kind expression

## Customization

Edit `SCENARIO_PROMPTS` in `generate_persona_videos.py` to:
- Change visual sequences
- Modify persona characteristics
- Adjust environment descriptions
- Update duration or style

## Cost

- ~$5-10 per 24-second video
- 8 videos total: ~$40-80 one-time
- No recurring costs (videos cached)

See `../VIDEO_GENERATION_GUIDE.md` for full documentation.
