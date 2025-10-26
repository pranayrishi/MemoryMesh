#!/usr/bin/env python3
"""
Sora-2 Video Generator for MemoryMesh Demo Scenarios
Generates one polished 12-second video per scenario+persona combination.
Uses caching and fingerprinting to ensure videos are generated only once.
"""

import os
import sys
import json
import hashlib
import time
from pathlib import Path
from openai import OpenAI

# Get API key from environment or use provided key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY') or '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'
if not OPENAI_API_KEY:
    print("❌ Error: OPENAI_API_KEY environment variable not set")
    print("Please set it with: export OPENAI_API_KEY='your-key-here'")
    sys.exit(1)

openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Directories
SCRIPT_DIR = Path(__file__).parent
ASSETS_DIR = SCRIPT_DIR.parent / 'assets' / 'videos'
PROMPTS_DIR = SCRIPT_DIR / 'prompts'

# Ensure directories exist
ASSETS_DIR.mkdir(parents=True, exist_ok=True)
PROMPTS_DIR.mkdir(parents=True, exist_ok=True)

# Consistent visual style for all videos
CONSISTENT_STYLE = """
CONSISTENT VISUAL STYLE (MUST BE IDENTICAL ACROSS ALL VIDEOS):
- Warm, comfortable home interior (living room or kitchen)
- Natural daylight from windows, soft indoor lighting
- Elderly person (grandma or grandpa) clearly visible and centered
- Calm, peaceful atmosphere
- No sudden movements or jarring transitions
- Smooth, steady camera work (slight pans/zooms only)
- Realistic, natural behavior and expressions
- Clean, uncluttered background
- Professional cinematography quality
- Color grading: Warm, inviting tones

AUDIO/VOICE:
- No voiceover in the video itself (AI will speak separately via Google Home)
- Ambient home sounds only (subtle background)
- Natural environmental audio
- Calming, peaceful soundscape

DURATION: Exactly 12 seconds
RESOLUTION: 1080p (1920x1080)
"""

# Scenario prompts for each persona
SCENARIO_PROMPTS = {
    'meal_confusion': {
        'grandma': f"""
{CONSISTENT_STYLE}

SCENARIO: Meal Confusion - Grandma

VISUAL SEQUENCE (12 seconds):
0-4s: Elderly grandmother (70s, warm smile, casual home clothing) standing in bright kitchen
4-8s: She opens refrigerator door, looks inside with slightly confused expression
8-12s: Closes fridge, opens it again, peers inside with gentle confusion on face

PERSONA DETAILS:
- Female, approximately 70-75 years old
- Gray/white hair, neatly styled
- Comfortable home clothing (cardigan, slacks)
- Warm, kind facial features
- Natural aging characteristics
- Gentle, slow movements

BEHAVIOR:
- Repetitive checking of refrigerator
- Mild confusion but not distressed
- Natural, realistic elderly behavior
- No exaggerated movements
- Calm demeanor throughout

ENVIRONMENT:
- Clean, well-lit kitchen
- Modern appliances
- Family photos visible on fridge
- Warm, inviting atmosphere
- Natural daylight from window
""",
        'grandpa': f"""
{CONSISTENT_STYLE}

SCENARIO: Meal Confusion - Grandpa

VISUAL SEQUENCE (12 seconds):
0-4s: Elderly grandfather (70s, gentle expression, casual home clothing) standing in bright kitchen
4-8s: He opens refrigerator door, looks inside with slightly puzzled expression
8-12s: Closes fridge, scratches head, opens it again with mild confusion

PERSONA DETAILS:
- Male, approximately 70-75 years old
- Gray/white hair or balding
- Comfortable home clothing (polo shirt, slacks)
- Kind, weathered facial features
- Natural aging characteristics
- Steady, deliberate movements

BEHAVIOR:
- Repetitive checking of refrigerator
- Mild confusion but not agitated
- Natural, realistic elderly behavior
- No exaggerated movements
- Calm demeanor throughout

ENVIRONMENT:
- Clean, well-lit kitchen
- Modern appliances
- Family photos visible on fridge
- Warm, inviting atmosphere
- Natural daylight from window
"""
    },
    'stove_safety': {
        'grandma': f"""
{CONSISTENT_STYLE}

SCENARIO: Stove Safety - Grandma

VISUAL SEQUENCE (12 seconds):
0-4s: Elderly grandmother in kitchen, approaching stove area
4-8s: She turns on stove burner (visible flame/glow), no pot present
8-12s: Steps back, looks at stove confused, hand near face in thought, burner still on

PERSONA DETAILS:
- Female, approximately 70-75 years old
- Gray/white hair, neatly styled
- Comfortable home clothing (blouse, slacks)
- Warm, kind facial features
- Natural aging characteristics
- Gentle movements

BEHAVIOR:
- Turns on stove but forgets purpose
- Mild confusion about task
- No panic or distress
- Natural elderly forgetfulness
- Safety concern visible but not alarming

ENVIRONMENT:
- Kitchen with gas or electric stove
- Clean countertops
- Good lighting
- Warm, safe-looking home
- No immediate danger visible (just burner on)

SAFETY NOTE: This is a critical safety scenario
""",
        'grandpa': f"""
{CONSISTENT_STYLE}

SCENARIO: Stove Safety - Grandpa

VISUAL SEQUENCE (12 seconds):
0-4s: Elderly grandfather in kitchen, approaching stove area
4-8s: He turns on stove burner (visible flame/glow), no pot present
8-12s: Steps back, looks at stove puzzled, hand on hip, burner still on

PERSONA DETAILS:
- Male, approximately 70-75 years old
- Gray/white hair or balding
- Comfortable home clothing (button-up shirt, slacks)
- Kind, weathered facial features
- Natural aging characteristics
- Steady movements

BEHAVIOR:
- Turns on stove but forgets purpose
- Mild confusion about task
- No panic or distress
- Natural elderly forgetfulness
- Safety concern visible but not alarming

ENVIRONMENT:
- Kitchen with gas or electric stove
- Clean countertops
- Good lighting
- Warm, safe-looking home
- No immediate danger visible (just burner on)

SAFETY NOTE: This is a critical safety scenario
"""
    },
    'wandering': {
        'grandma': f"""
{CONSISTENT_STYLE}

SCENARIO: Wandering - Grandma

VISUAL SEQUENCE (12 seconds):
0-4s: Elderly grandmother in living room, looking toward front door
4-8s: She walks slowly toward the door, hand reaching for doorknob
8-12s: Pauses at door, hand on knob, tries handle gently with uncertain expression

PERSONA DETAILS:
- Female, approximately 70-75 years old
- Gray/white hair, neatly styled
- Comfortable home clothing (cardigan, comfortable pants)
- Warm, kind facial features
- Natural aging characteristics
- Slow, careful movements

BEHAVIOR:
- Drawn toward door with unclear purpose
- Mild confusion about destination
- No urgency or panic
- Natural elderly wandering behavior
- Gentle, non-aggressive movements

ENVIRONMENT:
- Living room with visible front door
- Comfortable furniture
- Family photos on walls
- Warm, inviting home interior
- Natural lighting
""",
        'grandpa': f"""
{CONSISTENT_STYLE}

SCENARIO: Wandering - Grandpa

VISUAL SEQUENCE (12 seconds):
0-4s: Elderly grandfather in living room, looking toward front door
4-8s: He walks slowly toward the door, hand reaching for doorknob
8-12s: Pauses at door, hand on knob, tries handle gently with uncertain expression

PERSONA DETAILS:
- Male, approximately 70-75 years old
- Gray/white hair or balding
- Comfortable home clothing (sweater, slacks)
- Kind, weathered facial features
- Natural aging characteristics
- Slow, deliberate movements

BEHAVIOR:
- Drawn toward door with unclear purpose
- Mild confusion about destination
- No urgency or panic
- Natural elderly wandering behavior
- Gentle, non-aggressive movements

ENVIRONMENT:
- Living room with visible front door
- Comfortable furniture
- Family photos on walls
- Warm, inviting home interior
- Natural lighting
"""
    },
    'agitation': {
        'grandma': f"""
{CONSISTENT_STYLE}

SCENARIO: Agitation - Grandma

VISUAL SEQUENCE (12 seconds):
0-4s: Elderly grandmother sitting in living room chair, fidgeting with hands
4-8s: She stands up, paces slowly, wringing hands gently
8-12s: Walks to window, looks out with worried, restless expression

PERSONA DETAILS:
- Female, approximately 70-75 years old
- Gray/white hair, neatly styled
- Comfortable home clothing (cardigan, dress)
- Warm but currently worried facial features
- Natural aging characteristics
- Restless but gentle movements

BEHAVIOR:
- Mild agitation and restlessness
- Fidgeting, pacing, hand-wringing
- Worried or concerned expression
- No aggressive or violent behavior
- Natural elderly distress signals

ENVIRONMENT:
- Comfortable living room
- Soft furniture, good lighting
- Window with view outside
- Warm, safe home environment
- Calming decor
""",
        'grandpa': f"""
{CONSISTENT_STYLE}

SCENARIO: Agitation - Grandpa

VISUAL SEQUENCE (12 seconds):
0-4s: Elderly grandfather sitting in living room chair, tapping fingers restlessly
4-8s: He stands up, paces slowly, rubbing hands together
8-12s: Walks to window, looks out with worried, concerned expression

PERSONA DETAILS:
- Male, approximately 70-75 years old
- Gray/white hair or balding
- Comfortable home clothing (cardigan, slacks)
- Kind but currently worried facial features
- Natural aging characteristics
- Restless but controlled movements

BEHAVIOR:
- Mild agitation and restlessness
- Fidgeting, pacing, hand movements
- Worried or concerned expression
- No aggressive or violent behavior
- Natural elderly distress signals

ENVIRONMENT:
- Comfortable living room
- Soft furniture, good lighting
- Window with view outside
- Warm, safe home environment
- Calming decor
"""
    }
}


def compute_fingerprint(scenario, persona):
    """Compute SHA256 fingerprint of prompt + settings for cache validation."""
    prompt = SCENARIO_PROMPTS[scenario][persona]
    data = {
        'prompt': prompt,
        'model': 'sora-2',
        'duration': '12',
        'resolution': '1080p'
    }
    content = json.dumps(data, sort_keys=True)
    return hashlib.sha256(content.encode()).hexdigest()


def load_fingerprint(video_path):
    """Load fingerprint from metadata file."""
    meta_path = Path(str(video_path) + '.json')
    if not meta_path.exists():
        return None
    try:
        with open(meta_path, 'r') as f:
            meta = json.load(f)
            return meta.get('fingerprint')
    except:
        return None


def save_fingerprint(video_path, fingerprint, scenario, persona):
    """Save fingerprint to metadata file."""
    meta_path = Path(str(video_path) + '.json')
    meta = {
        'fingerprint': fingerprint,
        'scenario': scenario,
        'persona': persona,
        'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        'model': 'sora-2',
        'duration': '12s',
        'resolution': '1080p'
    }
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)


def wait_for_video_completion(video_id, max_wait=3600):
    """Wait for video generation to complete with progress updates."""
    start_time = time.time()
    
    while True:
        if time.time() - start_time > max_wait:
            print("\n❌ Max wait time exceeded")
            return None
        
        video = openai_client.videos.retrieve(video_id)
        progress = getattr(video, "progress", 0)
        
        # Progress bar
        bar_length = 30
        filled = int((progress / 100) * bar_length)
        bar = "█" * filled + "░" * (bar_length - filled)
        
        status = "Queued" if video.status == "queued" else "Processing"
        sys.stdout.write(f"\r{status}: [{bar}] {progress:.1f}%")
        sys.stdout.flush()
        
        if video.status == "completed":
            sys.stdout.write("\n")
            return video
        elif video.status == "failed":
            sys.stdout.write("\n")
            error_msg = getattr(getattr(video, "error", None), "message", "Unknown error")
            print(f"❌ Video generation failed: {error_msg}")
            return None
        
        time.sleep(3)


def generate_video(scenario, persona, force=False):
    """Generate a single video for scenario+persona combination."""
    video_filename = f"{scenario}_{persona}.mp4"
    video_path = ASSETS_DIR / video_filename
    
    # Check if video exists and fingerprint matches
    current_fingerprint = compute_fingerprint(scenario, persona)
    
    if video_path.exists() and not force:
        existing_fingerprint = load_fingerprint(video_path)
        if existing_fingerprint == current_fingerprint:
            print(f"✅ Video already exists and is up-to-date: {video_filename}")
            return str(video_path)
        else:
            print(f"⚠️  Video exists but prompt changed, regenerating: {video_filename}")
    
    print(f"\n{'='*60}")
    print(f"🎬 Generating: {scenario} - {persona}")
    print(f"{'='*60}")
    
    prompt = SCENARIO_PROMPTS[scenario][persona]
    
    try:
        # Create video with Sora-2
        print("📤 Sending request to Sora-2...")
        video = openai_client.videos.create(
            model="sora-2",
            prompt=prompt,
            seconds='12'
        )
        
        print(f"✓ Video creation started. ID: {video.id}")
        
        # Wait for completion
        completed_video = wait_for_video_completion(video.id)
        
        if not completed_video:
            print(f"❌ Failed to generate {video_filename}")
            return None
        
        # Download video
        print(f"📥 Downloading {video_filename}...")
        content = openai_client.videos.download_content(completed_video.id, variant="video")
        content.write_to_file(str(video_path))
        
        # Save fingerprint
        save_fingerprint(video_path, current_fingerprint, scenario, persona)
        
        print(f"✅ Successfully saved {video_filename}")
        return str(video_path)
        
    except Exception as e:
        print(f"❌ Error generating {video_filename}: {e}")
        return None


def generate_all_videos(force=False):
    """Generate all scenario+persona combinations."""
    scenarios = ['meal_confusion', 'stove_safety', 'wandering', 'agitation']
    personas = ['grandma', 'grandpa']
    
    total = len(scenarios) * len(personas)
    generated = []
    failed = []
    
    print("\n" + "="*60)
    print("🎬 MEMORYMESH PERSONA VIDEO GENERATOR")
    print("="*60)
    print(f"Scenarios: {len(scenarios)}")
    print(f"Personas: {len(personas)}")
    print(f"Total videos: {total}")
    print(f"Duration: 12 seconds each")
    print(f"Resolution: 1080p")
    print(f"Output: {ASSETS_DIR}")
    print("="*60 + "\n")
    
    for i, scenario in enumerate(scenarios, 1):
        for persona in personas:
            print(f"\n[{len(generated) + len(failed) + 1}/{total}]")
            result = generate_video(scenario, persona, force=force)
            
            if result:
                generated.append(result)
            else:
                failed.append(f"{scenario}_{persona}")
            
            # Small delay between requests to avoid rate limiting
            if len(generated) + len(failed) < total:
                print("\n⏳ Waiting 5 seconds before next video...")
                time.sleep(5)
    
    # Summary
    print("\n" + "="*60)
    print("📊 GENERATION SUMMARY")
    print("="*60)
    print(f"✅ Successfully generated: {len(generated)}/{total}")
    print(f"❌ Failed: {len(failed)}/{total}")
    
    if generated:
        print("\n✅ Generated videos:")
        for path in generated:
            print(f"   - {Path(path).name}")
    
    if failed:
        print("\n❌ Failed videos:")
        for name in failed:
            print(f"   - {name}.mp4")
    
    print("\n" + "="*60)
    print(f"📁 Videos saved to: {ASSETS_DIR}")
    print("="*60 + "\n")
    
    return len(generated) == total


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate persona videos for MemoryMesh scenarios')
    parser.add_argument('--scenario', choices=['meal_confusion', 'stove_safety', 'wandering', 'agitation'],
                       help='Generate specific scenario only')
    parser.add_argument('--persona', choices=['grandma', 'grandpa'],
                       help='Generate specific persona only')
    parser.add_argument('--force', action='store_true',
                       help='Force regeneration even if video exists')
    parser.add_argument('--list', action='store_true',
                       help='List all scenario+persona combinations')
    
    args = parser.parse_args()
    
    if args.list:
        print("\nAvailable scenario+persona combinations:")
        for scenario in SCENARIO_PROMPTS.keys():
            for persona in SCENARIO_PROMPTS[scenario].keys():
                print(f"  - {scenario} + {persona}")
        return
    
    if args.scenario and args.persona:
        # Generate single video
        generate_video(args.scenario, args.persona, force=args.force)
    elif args.scenario:
        # Generate both personas for scenario
        for persona in ['grandma', 'grandpa']:
            generate_video(args.scenario, persona, force=args.force)
    elif args.persona:
        # Generate all scenarios for persona
        for scenario in SCENARIO_PROMPTS.keys():
            generate_video(scenario, args.persona, force=args.force)
    else:
        # Generate all videos
        success = generate_all_videos(force=args.force)
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
