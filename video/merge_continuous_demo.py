#!/usr/bin/env python3
"""
Merge Grandma Scenario Videos into Continuous Demo
Creates a seamless ~48-second video showing grandma experiencing multiple scenarios
"""

import subprocess
import os
from pathlib import Path

# Directories
SCRIPT_DIR = Path(__file__).parent
ASSETS_DIR = SCRIPT_DIR.parent / 'assets' / 'videos'
OUTPUT_FILE = ASSETS_DIR / 'continuous_demo_grandma.mp4'

# Scenario order for natural flow through the home
SCENARIO_ORDER = [
    'meal_confusion',      # Kitchen - 12s
    'stove_safety',        # Kitchen - 12s  
    'wandering',           # Living room to door - 12s
    # 'agitation'          # Living room - 12s (not yet generated)
]

def check_ffmpeg():
    """Check if ffmpeg is installed."""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def merge_videos():
    """Merge all grandma scenario videos into one continuous video."""
    
    print("\n" + "="*60)
    print("🎬 CONTINUOUS DEMO VIDEO GENERATOR")
    print("="*60)
    print("Creating seamless grandma scenario walkthrough...")
    print()
    
    # Check ffmpeg
    if not check_ffmpeg():
        print("❌ Error: ffmpeg not installed")
        print("   Install with: brew install ffmpeg")
        return False
    
    # Check all videos exist
    video_files = []
    missing = []
    
    for scenario in SCENARIO_ORDER:
        video_file = ASSETS_DIR / f"{scenario}_grandma.mp4"
        if video_file.exists():
            video_files.append(video_file)
            print(f"✅ Found: {scenario}_grandma.mp4")
        else:
            missing.append(scenario)
            print(f"⚠️  Missing: {scenario}_grandma.mp4")
    
    if missing:
        print(f"\n❌ Cannot create continuous demo - missing {len(missing)} video(s)")
        print("   Generate missing videos with: python video/generate_persona_videos.py")
        return False
    
    print(f"\n📹 Merging {len(video_files)} videos...")
    
    # Create concat file for ffmpeg
    concat_file = ASSETS_DIR / 'concat_list.txt'
    with open(concat_file, 'w') as f:
        for video_file in video_files:
            f.write(f"file '{video_file.name}'\n")
    
    # Merge videos using ffmpeg
    try:
        cmd = [
            'ffmpeg',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(concat_file),
            '-c', 'copy',
            '-y',  # Overwrite output file
            str(OUTPUT_FILE)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            # Get video duration
            duration_cmd = [
                'ffprobe',
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                str(OUTPUT_FILE)
            ]
            duration_result = subprocess.run(duration_cmd, capture_output=True, text=True)
            duration = float(duration_result.stdout.strip())
            
            file_size = OUTPUT_FILE.stat().st_size / (1024 * 1024)  # MB
            
            print(f"\n✅ Successfully created continuous demo video!")
            print(f"   File: {OUTPUT_FILE.name}")
            print(f"   Duration: {duration:.1f} seconds")
            print(f"   Size: {file_size:.1f} MB")
            print(f"   Scenarios: {len(video_files)}")
            
            # Create metadata
            create_metadata(duration, video_files)
            
            # Clean up concat file
            concat_file.unlink()
            
            return True
        else:
            print(f"\n❌ Error merging videos:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

def create_metadata(duration, video_files):
    """Create metadata file for continuous demo."""
    import json
    import time
    
    metadata = {
        'type': 'continuous_demo',
        'persona': 'grandma',
        'total_duration': f'{duration:.1f}s',
        'scenario_count': len(video_files),
        'scenarios': [],
        'generated_at': time.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Calculate timing for each scenario (24s each for extended videos)
    current_time = 0
    scenario_duration = 24  # Updated to 24 seconds
    for i, scenario in enumerate(SCENARIO_ORDER):
        metadata['scenarios'].append({
            'name': scenario,
            'start_time': current_time,
            'end_time': current_time + scenario_duration,
            'duration': scenario_duration,
            'order': i + 1
        })
        current_time += scenario_duration
    
    meta_file = Path(str(OUTPUT_FILE) + '.json')
    with open(meta_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"   Metadata: {meta_file.name}")

if __name__ == '__main__':
    success = merge_videos()
    
    if success:
        print("\n" + "="*60)
        print("🎉 Continuous demo video ready!")
        print("="*60)
        print("\nScenario Timeline (24s each):")
        print("  0-24s:  Meal Confusion (Kitchen)")
        print(" 24-48s:  Stove Safety (Kitchen)")
        print(" 48-72s:  Wandering (Living Room → Door)")
        print("\nNatural pacing allows AI to intervene during scenarios!")
        print("="*60)
    else:
        print("\n❌ Failed to create continuous demo video")
        exit(1)
