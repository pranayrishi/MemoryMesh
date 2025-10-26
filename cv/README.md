# Computer Vision Persona Detection Module

## Overview

Detects whether a person in a video is a grandma or grandpa using OpenCV face detection and feature analysis.

## Quick Start

```bash
# Install dependencies
pip install opencv-python numpy

# Test detector on all videos
python persona_detector.py
```

## Detection Methods

### 1. Filename Parsing (Fast)
- Parses `{scenario}_{persona}.mp4` format
- Instant detection
- 100% accurate for pre-generated videos
- **Default method**

### 2. Computer Vision (Accurate)
- Uses OpenCV Haar Cascades for face detection
- Analyzes hair color, skin texture, face features
- Heuristic age/gender estimation
- Fallback for unknown videos

## Usage

### As Python Module

```python
from persona_detector import PersonaDetector

detector = PersonaDetector()

# Detect from video file
result = detector.detect_persona_from_video('video.mp4')
print(f"Persona: {result['persona']}")
print(f"Confidence: {result['confidence']}")

# Detect from single frame
import cv2
frame = cv2.imread('frame.jpg')
result = detector.detect_persona_from_frame(frame)
```

### From Node.js

The `PersonaDetectionService` in the backend automatically calls this module:

```javascript
const detection = await personaDetectionService.detectPersonaFromVideo(videoPath);
console.log(detection.persona); // 'grandma' or 'grandpa'
```

## Output Format

```json
{
  "persona": "grandma",
  "confidence": 1.0,
  "method": "filename",
  "samples": 10
}
```

- **persona**: `"grandma"`, `"grandpa"`, or `"unknown"`
- **confidence**: 0.0 to 1.0
- **method**: `"filename"` or `"cv"`
- **samples**: Number of frames analyzed (CV method only)

## Upgrading Detection

Current implementation uses heuristics. For production, upgrade to DNN models:

### Option 1: OpenCV DNN Models
```python
# Load pre-trained age/gender models
age_net = cv2.dnn.readNetFromCaffe('age_deploy.prototxt', 'age_net.caffemodel')
gender_net = cv2.dnn.readNetFromCaffe('gender_deploy.prototxt', 'gender_net.caffemodel')
```

### Option 2: Deep Learning Frameworks
- **TensorFlow/Keras**: Age-gender classification models
- **PyTorch**: Face recognition + attribute detection
- **Hugging Face**: Pre-trained vision transformers

### Option 3: Cloud APIs
- **AWS Rekognition**: Face analysis with age/gender
- **Google Cloud Vision**: Face detection + attributes
- **Azure Face API**: Age and gender estimation

## Performance

- **Filename method**: <1ms
- **CV method**: ~100-500ms per video (depends on length)
- **Frame stride**: Sample every 15 frames for speed

## Limitations

Current heuristic approach:
- Not highly accurate for CV method
- Best for controlled demo videos
- Filename parsing is preferred

For production:
- Use proper trained models
- Add face recognition for patient identification
- Implement real-time tracking

## Integration

This module is automatically used by:
1. `PersonaDetectionService.js` (Node.js backend)
2. `VideoPlaybackService.js` (video selection)
3. Intervention decision logic

See `../VIDEO_GENERATION_GUIDE.md` for full system documentation.
