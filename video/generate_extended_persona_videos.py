#!/usr/bin/env python3
"""
Extended Sora-2 Video Generator for MemoryMesh Demo Scenarios
Generates 24-second videos by creating two 12-second segments and merging them.
This allows for more natural pacing and better intervention timing.
"""

import os
import sys
import json
import hashlib
import time
import subprocess
from pathlib import Path
from openai import OpenAI

# Get API key from environment or use provided key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY') or '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'
if not OPENAI_API_KEY:
    print("❌ Error: OPENAI_API_KEY environment variable not set")
    sys.exit(1)

openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Directories
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / 'assets' / 'videos'
TEMP_DIR = SCRIPT_DIR / 'temp_segments'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Consistent style across all videos
CONSISTENT_STYLE = """
CONSISTENT VISUAL STYLE (MUST BE IDENTICAL ACROSS ALL SEGMENTS):
- Realistic home environment with natural lighting
- Consistent elderly character appearance (same clothing, hair, features)
- Smooth, natural movements (no sudden jumps or changes)
- Professional cinematography with steady camera
- Warm, inviting color palette
- Natural aging characteristics visible
- Same time of day (natural daylight through windows)
- Consistent furniture and room layout
"""

# Define scenarios with two segments each (12s + 12s = 24s total)
SCENARIOS = {
    'meal_confusion': {
        'grandma': {
            'segment_1': f"""
{CONSISTENT_STYLE}

SCENARIO: Meal Confusion - Grandma (Part 1 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Elderly grandmother (70s, warm smile, casual home clothing) standing in bright kitchen
3-6s: She walks slowly to refrigerator, opens door
6-9s: Looks inside with slightly confused expression, examining contents
9-12s: Closes refrigerator door gently, touches forehead thoughtfully

PERSONA DETAILS:
- Female, approximately 70-75 years old
- Gray/white hair, neatly styled
- Comfortable home clothing (cardigan over blouse, slacks)
- Warm, gentle facial features
- Natural aging characteristics
- Slow, deliberate movements

BEHAVIOR:
- Mild confusion about recent meal
- Checking refrigerator for clues
- Gentle, non-distressed demeanor
- Natural elderly movements

ENVIRONMENT:
- Bright, clean kitchen
- Modern refrigerator
- Natural daylight from window
- Warm, inviting atmosphere
- Family photos visible on walls
""",
            'segment_2': f"""
{CONSISTENT_STYLE}

SCENARIO: Meal Confusion - Grandma (Part 2 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Grandmother standing by closed refrigerator, looking thoughtful
3-6s: Opens refrigerator door again, peers inside more carefully
6-9s: Closes door, walks slowly toward kitchen table
9-12s: Sits down at table, rests hands on table, looks contemplative

PERSONA DETAILS:
- SAME elderly grandmother from Part 1 (EXACT same appearance)
- SAME clothing, hair, and features
- Consistent gentle demeanor
- Natural continuation of movements

BEHAVIOR:
- Continued mild confusion about meals
- Repetitive checking behavior
- Gentle, non-aggressive actions
- Natural elderly forgetfulness
- Calm, not distressed

ENVIRONMENT:
- SAME kitchen as Part 1
- SAME lighting and time of day
- Kitchen table now visible
- Consistent warm atmosphere
- Seamless continuation of scene
""",
        },
        'grandpa': {
            'segment_1': f"""
{CONSISTENT_STYLE}

SCENARIO: Meal Confusion - Grandpa (Part 1 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Elderly grandfather (70s, kind face, casual home clothing) in kitchen
3-6s: Walks to refrigerator, opens door
6-9s: Looks inside with puzzled expression
9-12s: Closes door, scratches head gently

PERSONA DETAILS:
- Male, approximately 70-75 years old
- Gray/white hair, short cut
- Comfortable home clothing (button-up shirt, slacks)
- Kind, gentle facial features
- Natural aging characteristics

BEHAVIOR:
- Mild confusion about recent meal
- Checking refrigerator
- Gentle, thoughtful demeanor

ENVIRONMENT:
- Bright, clean kitchen
- Modern appliances
- Natural daylight
- Warm atmosphere
""",
            'segment_2': f"""
{CONSISTENT_STYLE}

SCENARIO: Meal Confusion - Grandpa (Part 2 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Grandfather by refrigerator, looking thoughtful
3-6s: Opens refrigerator again, examines contents
6-9s: Closes door, walks to kitchen counter
9-12s: Leans on counter, looks at clock on wall, appears contemplative

PERSONA DETAILS:
- SAME elderly grandfather from Part 1
- SAME clothing and appearance
- Consistent gentle demeanor

BEHAVIOR:
- Continued mild confusion
- Repetitive checking
- Natural forgetfulness
- Calm demeanor

ENVIRONMENT:
- SAME kitchen as Part 1
- Clock now visible on wall
- Consistent lighting
- Seamless continuation
""",
        }
    },
    'stove_safety': {
        'grandma': {
            'segment_1': f"""
{CONSISTENT_STYLE}

SCENARIO: Stove Safety - Grandma (Part 1 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Elderly grandmother in kitchen, approaching stove
3-6s: Reaches toward stove controls, turns knob
6-9s: Burner ignites (visible flame), no pot on burner
9-12s: Steps back slightly, looks at stove with mild confusion

PERSONA DETAILS:
- SAME grandmother from meal_confusion scenario
- SAME clothing and appearance
- Natural aging characteristics

BEHAVIOR:
- Intending to cook but forgetting pot
- Mild confusion about next steps
- No panic or distress
- Natural elderly forgetfulness

ENVIRONMENT:
- SAME kitchen
- Gas stove with visible burner
- Natural lighting
- Safe but concerning situation
""",
            'segment_2': f"""
{CONSISTENT_STYLE}

SCENARIO: Stove Safety - Grandma (Part 2 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Grandmother standing near stove, burner still on (flame visible)
3-6s: Looks around kitchen, seems to be looking for something
6-9s: Walks to cabinet, opens it, looks inside
9-12s: Closes cabinet, turns back toward stove with puzzled expression

PERSONA DETAILS:
- SAME grandmother, EXACT same appearance
- Consistent gentle demeanor
- Natural movements

BEHAVIOR:
- Forgotten why she turned on stove
- Looking for pot or ingredients
- Mild confusion, not distressed
- Burner remains on (safety concern)

ENVIRONMENT:
- SAME kitchen, consistent lighting
- Burner flame still visible
- Cabinet now visible
- Seamless continuation
""",
        },
        'grandpa': {
            'segment_1': f"""
{CONSISTENT_STYLE}

SCENARIO: Stove Safety - Grandpa (Part 1 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Elderly grandfather in kitchen, approaching stove
3-6s: Turns stove knob, burner ignites
6-9s: No pot on burner, flame visible
9-12s: Steps back, looks at stove with puzzled expression

PERSONA DETAILS:
- SAME grandfather from meal_confusion
- SAME appearance and clothing
- Natural aging characteristics

BEHAVIOR:
- Intending to cook, forgot pot
- Mild confusion
- Calm demeanor

ENVIRONMENT:
- SAME kitchen
- Gas stove with burner
- Natural lighting
""",
            'segment_2': f"""
{CONSISTENT_STYLE}

SCENARIO: Stove Safety - Grandpa (Part 2 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Grandfather near stove, burner still on
3-6s: Looks around kitchen, scratches head
6-9s: Walks to counter, looks at items there
9-12s: Turns back toward stove, appears to realize something is wrong

PERSONA DETAILS:
- SAME grandfather, EXACT same appearance
- Consistent demeanor

BEHAVIOR:
- Forgotten purpose
- Looking for cooking items
- Mild realization of issue
- Burner still on

ENVIRONMENT:
- SAME kitchen
- Burner flame visible
- Seamless continuation
""",
        }
    },
    'wandering': {
        'grandma': {
            'segment_1': f"""
{CONSISTENT_STYLE}

SCENARIO: Wandering - Grandma Lost on Main Road (Part 1 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Elderly grandmother standing on busy city sidewalk next to main road, cars passing in background
3-6s: She looks around confused, turning head left and right, clearly disoriented
6-9s: Touches her forehead with worried expression, looking at unfamiliar surroundings
9-12s: Takes hesitant steps forward on sidewalk, appearing lost and uncertain

PERSONA DETAILS:
- SAME grandmother from previous scenarios
- SAME clothing and appearance (cardigan, slacks)
- Visible confusion and distress
- Vulnerable, fragile appearance

BEHAVIOR:
- Clearly lost and disoriented
- Doesn't recognize surroundings
- Visible confusion and worry
- Uncertain where to go
- Vulnerable on busy street

ENVIRONMENT:
- Busy main road with cars passing
- Urban sidewalk setting
- Unfamiliar neighborhood
- Daytime, natural lighting
- Traffic visible in background
- Street signs and buildings
- CRITICAL: Shows danger of being lost near traffic
""",
            'segment_2': f"""
{CONSISTENT_STYLE}

SCENARIO: Wandering - Grandma Lost on Main Road (Part 2 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Grandmother standing on sidewalk, cars passing behind her, looking scared
3-6s: Looks at passing cars with fearful expression, backing away slightly
6-9s: Wrings hands together nervously, clearly distressed and lost
9-12s: Stands alone on sidewalk looking around desperately for help, very vulnerable

PERSONA DETAILS:
- SAME grandmother, EXACT same appearance
- Increased visible distress
- Frightened and confused
- Alone and vulnerable

BEHAVIOR:
- Lost and scared on busy road
- Doesn't know how to get home
- Fearful of traffic
- Looking for help
- Critical safety situation
- Visible anxiety and confusion

ENVIRONMENT:
- SAME busy main road location
- Cars continuing to pass
- Urban setting, unfamiliar to her
- Dangerous proximity to traffic
- No familiar landmarks
- Emphasizes CRITICAL nature of wandering
""",
        },
        'grandpa': {
            'segment_1': f"""
{CONSISTENT_STYLE}

SCENARIO: Wandering - Grandpa Lost on Main Road (Part 1 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Elderly grandfather standing on busy city sidewalk next to main road, cars passing
3-6s: Looks around confused, turning slowly, clearly disoriented
6-9s: Touches his head with worried expression, examining unfamiliar surroundings
9-12s: Takes slow, uncertain steps on sidewalk, appearing lost

PERSONA DETAILS:
- SAME grandfather from previous scenarios
- SAME appearance and clothing (button-up shirt, slacks)
- Visible confusion and concern
- Vulnerable appearance

BEHAVIOR:
- Lost and disoriented on busy street
- Doesn't recognize surroundings
- Visible confusion and worry
- Uncertain where to go
- Vulnerable near traffic

ENVIRONMENT:
- Busy main road with cars passing
- Urban sidewalk setting
- Unfamiliar neighborhood
- Daytime, natural lighting
- Traffic visible in background
- Street signs and buildings
- CRITICAL: Shows danger of being lost near traffic
""",
            'segment_2': f"""
{CONSISTENT_STYLE}

SCENARIO: Wandering - Grandpa Lost on Main Road (Part 2 of 2)

VISUAL SEQUENCE (12 seconds):
0-3s: Grandfather standing on sidewalk, cars passing behind him, looking worried
3-6s: Looks at passing cars with concerned expression, stepping back from curb
6-9s: Puts hands in pockets nervously, clearly distressed and lost
9-12s: Stands alone on sidewalk looking around for help, very vulnerable

PERSONA DETAILS:
- SAME grandfather, EXACT same appearance
- Increased visible distress
- Confused and worried
- Alone and vulnerable

BEHAVIOR:
- Lost and concerned on busy road
- Doesn't know how to get home
- Wary of traffic
- Looking for help
- Critical safety situation
- Visible confusion and anxiety

ENVIRONMENT:
- SAME busy main road location
- Cars continuing to pass
- Urban setting, unfamiliar to him
- Dangerous proximity to traffic
- No familiar landmarks
- Emphasizes CRITICAL nature of wandering
""",
        }
    }
}

def wait_for_video_completion(video_id, max_wait=3600):
    """Wait for a video to complete generation with progress bar."""
    start_time = time.time()
    
    while True:
        if time.time() - start_time > max_wait:
            print("\n⏱️  Max wait time exceeded")
            return None
        
        video = openai_client.videos.retrieve(video_id)
        progress = getattr(video, "progress", 0)
        
        bar_length = 30
        filled = int((progress / 100) * bar_length)
        bar = "=" * filled + "-" * (bar_length - filled)
        
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

def generate_segment(prompt, segment_name):
    """Generate a single 12-second video segment."""
    print(f"\n📹 Generating: {segment_name}")
    
    try:
        video = openai_client.videos.create(
            model="sora-2",
            prompt=prompt,
            seconds='12'
        )
        
        print(f"   Video ID: {video.id}")
        
        # Wait for completion
        completed_video = wait_for_video_completion(video.id)
        
        if not completed_video:
            return None
        
        # Download the video
        filename = TEMP_DIR / f"{segment_name}.mp4"
        print(f"   Downloading...")
        
        content = openai_client.videos.download_content(completed_video.id, variant="video")
        content.write_to_file(str(filename))
        
        print(f"   ✅ Saved: {filename.name}")
        return filename
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None

def merge_segments(segment_files, output_file):
    """Merge two 12-second segments into one 24-second video."""
    print(f"\n🔗 Merging segments into: {output_file.name}")
    
    # Create concat file
    concat_file = TEMP_DIR / 'concat_list.txt'
    with open(concat_file, 'w') as f:
        for seg_file in segment_files:
            f.write(f"file '{seg_file.absolute()}'\n")
    
    try:
        cmd = [
            'ffmpeg',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(concat_file),
            '-c', 'copy',
            '-y',
            str(output_file)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"   ✅ Merged successfully!")
            return True
        else:
            print(f"   ❌ Merge failed: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("\n❌ Error: ffmpeg not found")
        print("   Install with: brew install ffmpeg")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def generate_extended_video(scenario, persona):
    """Generate a 24-second video by creating and merging two 12-second segments."""
    print(f"\n{'='*60}")
    print(f"🎬 GENERATING: {scenario} - {persona}")
    print(f"{'='*60}")
    
    output_file = OUTPUT_DIR / f"{scenario}_{persona}.mp4"
    
    # Check if already exists
    if output_file.exists():
        print(f"⚠️  Video already exists: {output_file.name}")
        user_input = input("   Regenerate? (y/n): ")
        if user_input.lower() != 'y':
            print("   Skipping...")
            return True
    
    # Get prompts
    prompts = SCENARIOS[scenario][persona]
    
    # Generate segment 1
    seg1_file = generate_segment(prompts['segment_1'], f"{scenario}_{persona}_seg1")
    if not seg1_file:
        print(f"❌ Failed to generate segment 1")
        return False
    
    # Small delay between segments
    print("\n⏳ Waiting 5 seconds before next segment...")
    time.sleep(5)
    
    # Generate segment 2
    seg2_file = generate_segment(prompts['segment_2'], f"{scenario}_{persona}_seg2")
    if not seg2_file:
        print(f"❌ Failed to generate segment 2")
        return False
    
    # Merge segments
    success = merge_segments([seg1_file, seg2_file], output_file)
    
    if success:
        # Create metadata
        metadata = {
            'scenario': scenario,
            'persona': persona,
            'duration': '24s',
            'resolution': '1080p',
            'model': 'sora-2',
            'segments': 2,
            'generated_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        meta_file = Path(str(output_file) + '.json')
        with open(meta_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Get file size
        file_size = output_file.stat().st_size / (1024 * 1024)
        print(f"\n✅ COMPLETE: {output_file.name}")
        print(f"   Duration: 24 seconds")
        print(f"   Size: {file_size:.1f} MB")
        
        return True
    
    return False

def main():
    print("\n" + "="*60)
    print("🎬 EXTENDED PERSONA VIDEO GENERATOR")
    print("="*60)
    print("Generating 24-second videos (2 segments × 12s)")
    print(f"Output: {OUTPUT_DIR}")
    print("="*60)
    
    # Check ffmpeg
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("\n❌ Error: ffmpeg not installed")
        print("   Install with: brew install ffmpeg")
        sys.exit(1)
    
    # Generate all videos
    total = len(SCENARIOS) * 2  # grandma and grandpa for each scenario
    completed = 0
    failed = []
    
    for scenario in SCENARIOS:
        for persona in ['grandma', 'grandpa']:
            success = generate_extended_video(scenario, persona)
            if success:
                completed += 1
            else:
                failed.append(f"{scenario}_{persona}")
            
            print(f"\n📊 Progress: {completed}/{total} videos completed")
            
            # Delay between videos
            if completed < total:
                print("\n⏳ Waiting 10 seconds before next video...")
                time.sleep(10)
    
    # Summary
    print("\n" + "="*60)
    print("🎉 GENERATION COMPLETE!")
    print("="*60)
    print(f"✅ Successful: {completed}/{total}")
    if failed:
        print(f"❌ Failed: {len(failed)}")
        for f in failed:
            print(f"   - {f}")
    print("="*60)
    
    # Clean up temp directory
    print("\n🧹 Cleaning up temporary files...")
    for temp_file in TEMP_DIR.glob("*.mp4"):
        temp_file.unlink()
    for temp_file in TEMP_DIR.glob("*.txt"):
        temp_file.unlink()
    print("   ✅ Cleanup complete")

if __name__ == '__main__':
    main()
