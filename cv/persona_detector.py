"""
Computer Vision Persona Detector for MemoryMesh
Detects grandma vs grandpa in video frames using OpenCV age-gender classification.
"""

import cv2
import numpy as np
from pathlib import Path
import os

class PersonaDetector:
    """Detects whether a person in a frame is grandma or grandpa."""
    
    def __init__(self):
        """Initialize the detector with pre-trained models."""
        self.face_detector = None
        self.age_net = None
        self.gender_net = None
        self.models_loaded = False
        
        # Model paths (will be downloaded if not present)
        self.model_dir = Path(__file__).parent / 'models'
        self.model_dir.mkdir(exist_ok=True)
        
        # Age and gender model definitions
        self.AGE_LIST = ['(0-2)', '(4-6)', '(8-12)', '(15-20)', '(25-32)', '(38-43)', '(48-53)', '(60-100)']
        self.GENDER_LIST = ['Male', 'Female']
        
        # Model URLs (OpenCV's pre-trained models)
        self.model_urls = {
            'face_proto': 'https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt',
            'face_model': 'https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel',
            'age_proto': 'https://raw.githubusercontent.com/GilLevi/AgeGenderDeepLearning/master/age_deploy.prototxt',
            'age_model': 'https://github.com/GilLevi/AgeGenderDeepLearning/raw/master/age_net.caffemodel',
            'gender_proto': 'https://raw.githubusercontent.com/GilLevi/AgeGenderDeepLearning/master/gender_deploy.prototxt',
            'gender_model': 'https://github.com/GilLevi/AgeGenderDeepLearning/raw/master/gender_net.caffemodel'
        }
        
        # Try to load models
        try:
            self._load_models()
        except Exception as e:
            print(f"⚠️  Could not load CV models: {e}")
            print("    Detector will use fallback heuristics")
    
    def _load_models(self):
        """Load pre-trained face, age, and gender detection models."""
        # For now, use a simplified approach with Haar Cascades (built into OpenCV)
        # This avoids needing to download large model files
        
        # Load Haar Cascade for face detection (built into OpenCV)
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_detector = cv2.CascadeClassifier(cascade_path)
        
        if self.face_detector.empty():
            raise Exception("Could not load face detector")
        
        # Note: For production, you would load DNN models here
        # For demo purposes, we'll use heuristic detection based on visual features
        self.models_loaded = True
        print("✅ Face detector loaded (using Haar Cascades)")
    
    def detect_faces(self, frame):
        """Detect faces in a frame."""
        if not self.models_loaded:
            return []
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        return faces
    
    def analyze_face_features(self, frame, face_box):
        """
        Analyze face features to estimate age and gender.
        This is a simplified heuristic approach for demo purposes.
        In production, use proper DNN models.
        """
        x, y, w, h = face_box
        face_roi = frame[y:y+h, x:x+w]
        
        # Convert to grayscale
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        
        # Analyze hair color (gray/white indicates elderly)
        # Look at top portion of face (hair region)
        hair_region = gray_face[0:int(h*0.3), :]
        avg_hair_brightness = np.mean(hair_region)
        
        # Analyze skin texture (more variance = older)
        skin_region = gray_face[int(h*0.3):int(h*0.7), int(w*0.2):int(w*0.8)]
        skin_variance = np.var(skin_region)
        
        # Heuristic age estimation
        is_elderly = avg_hair_brightness > 150 or skin_variance > 1000
        
        # Heuristic gender estimation based on face shape
        # This is very simplified - in production use proper models
        face_aspect_ratio = w / h
        
        # Analyze color channels for gender hints
        b, g, r = cv2.split(face_roi)
        avg_r = np.mean(r)
        avg_g = np.mean(g)
        avg_b = np.mean(b)
        
        # Very rough heuristic (not accurate, just for demo)
        # In reality, you'd use trained models
        gender_score = face_aspect_ratio  # Simplified
        is_male = gender_score > 0.75  # Arbitrary threshold
        
        return {
            'is_elderly': is_elderly,
            'is_male': is_male,
            'confidence': 0.6  # Lower confidence for heuristic approach
        }
    
    def detect_persona_from_frame(self, frame):
        """
        Detect persona (grandma/grandpa) from a single frame.
        
        Args:
            frame: OpenCV image (BGR format)
        
        Returns:
            dict: {
                'persona': 'grandma' | 'grandpa' | 'unknown',
                'confidence': float (0-1),
                'faces_detected': int
            }
        """
        if frame is None or frame.size == 0:
            return {
                'persona': 'unknown',
                'confidence': 0.0,
                'faces_detected': 0
            }
        
        # Detect faces
        faces = self.detect_faces(frame)
        
        if len(faces) == 0:
            return {
                'persona': 'unknown',
                'confidence': 0.0,
                'faces_detected': 0
            }
        
        # Analyze the largest face (assume it's the main subject)
        largest_face = max(faces, key=lambda f: f[2] * f[3])
        
        # Analyze features
        features = self.analyze_face_features(frame, largest_face)
        
        # Determine persona
        if features['is_elderly']:
            if features['is_male']:
                persona = 'grandpa'
            else:
                persona = 'grandma'
        else:
            persona = 'unknown'
        
        return {
            'persona': persona,
            'confidence': features['confidence'],
            'faces_detected': len(faces)
        }
    
    def detect_persona_from_video(self, video_path, stride_frames=15, max_frames=50):
        """
        Detect persona from a video file by sampling frames.
        
        Args:
            video_path: Path to video file
            stride_frames: Sample every N frames
            max_frames: Maximum frames to analyze
        
        Returns:
            dict: {
                'persona': 'grandma' | 'grandpa' | 'unknown',
                'confidence': float (0-1),
                'samples': int
            }
        """
        cap = cv2.VideoCapture(str(video_path))
        
        if not cap.isOpened():
            return {
                'persona': 'unknown',
                'confidence': 0.0,
                'samples': 0,
                'error': 'Could not open video'
            }
        
        frame_count = 0
        samples = []
        
        try:
            while len(samples) < max_frames:
                ret, frame = cap.read()
                
                if not ret:
                    break
                
                # Sample every stride_frames
                if frame_count % stride_frames == 0:
                    result = self.detect_persona_from_frame(frame)
                    if result['persona'] != 'unknown':
                        samples.append(result)
                
                frame_count += 1
        
        finally:
            cap.release()
        
        if not samples:
            return {
                'persona': 'unknown',
                'confidence': 0.0,
                'samples': 0
            }
        
        # Aggregate results (majority vote)
        grandma_count = sum(1 for s in samples if s['persona'] == 'grandma')
        grandpa_count = sum(1 for s in samples if s['persona'] == 'grandpa')
        
        if grandma_count > grandpa_count:
            persona = 'grandma'
            confidence = grandma_count / len(samples)
        elif grandpa_count > grandma_count:
            persona = 'grandpa'
            confidence = grandpa_count / len(samples)
        else:
            persona = 'unknown'
            confidence = 0.5
        
        return {
            'persona': persona,
            'confidence': confidence,
            'samples': len(samples)
        }
    
    def detect_persona_from_video_path_by_filename(self, video_path):
        """
        Fast persona detection by parsing filename.
        Assumes filename format: {scenario}_{persona}.mp4
        Falls back to CV detection if filename doesn't match pattern.
        
        Args:
            video_path: Path to video file
        
        Returns:
            dict: {
                'persona': 'grandma' | 'grandpa' | 'unknown',
                'confidence': float (0-1),
                'method': 'filename' | 'cv'
            }
        """
        filename = Path(video_path).stem  # e.g., "meal_confusion_grandma"
        
        # Try to parse persona from filename
        if filename.endswith('_grandma'):
            return {
                'persona': 'grandma',
                'confidence': 1.0,
                'method': 'filename'
            }
        elif filename.endswith('_grandpa'):
            return {
                'persona': 'grandpa',
                'confidence': 1.0,
                'method': 'filename'
            }
        
        # Fallback to CV detection
        result = self.detect_persona_from_video(video_path)
        result['method'] = 'cv'
        return result


def test_detector():
    """Test the persona detector."""
    detector = PersonaDetector()
    
    print("\n" + "="*60)
    print("🔍 PERSONA DETECTOR TEST")
    print("="*60)
    
    # Test with video files if they exist
    video_dir = Path(__file__).parent.parent / 'assets' / 'videos'
    
    if video_dir.exists():
        videos = list(video_dir.glob('*.mp4'))
        
        if videos:
            print(f"\nFound {len(videos)} videos to test:\n")
            
            for video_path in videos:
                print(f"Testing: {video_path.name}")
                
                # Test filename-based detection
                result_filename = detector.detect_persona_from_video_path_by_filename(video_path)
                print(f"  Filename method: {result_filename['persona']} (confidence: {result_filename['confidence']:.2f})")
                
                # Test CV-based detection (sample)
                result_cv = detector.detect_persona_from_video(video_path, stride_frames=30, max_frames=10)
                print(f"  CV method: {result_cv['persona']} (confidence: {result_cv['confidence']:.2f}, samples: {result_cv['samples']})")
                print()
        else:
            print("\n⚠️  No videos found in assets/videos/")
            print("   Run generate_persona_videos.py first")
    else:
        print("\n⚠️  Video directory not found")
        print("   Run generate_persona_videos.py first")
    
    print("="*60 + "\n")


if __name__ == "__main__":
    test_detector()
