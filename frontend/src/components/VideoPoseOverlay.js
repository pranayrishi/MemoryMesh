import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

const VideoPoseOverlay = ({ videoUrl, isPlaying }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const animationFrameRef = useRef(null);

  // Initialize pose detector
  useEffect(() => {
    const initDetector = async () => {
      try {
        await tf.ready();
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
        setDetector(detector);
      } catch (error) {
        console.error('Failed to initialize pose detector:', error);
      }
    };

    initDetector();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start pose detection when video plays
  useEffect(() => {
    if (isPlaying && detector && videoRef.current) {
      detectPose();
    } else if (!isPlaying && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isPlaying, detector]);

  // Detect pose in video
  const detectPose = async () => {
    if (!detector || !videoRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    try {
      const poses = await detector.estimatePoses(videoRef.current);
      
      if (poses.length > 0) {
        const pose = poses[0];
        drawPose(pose);
        setPoseData(pose);
      }
    } catch (error) {
      // Video might not be ready yet
    }

    animationFrameRef.current = requestAnimationFrame(detectPose);
  };

  // Draw green outlines on detected pose
  const drawPose = (pose) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw keypoints with green circles
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ff00';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw skeleton with green lines
    const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
      poseDetection.SupportedModels.MoveNet
    );

    adjacentKeyPoints.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];

      if (kp1.score > 0.3 && kp2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    });

    // Draw body outline (optional - creates a more visible silhouette)
    if (pose.keypoints.length > 0) {
      drawBodyOutline(ctx, pose.keypoints);
    }
  };

  // Draw body outline for better visibility
  const drawBodyOutline = (ctx, keypoints) => {
    // Define body outline path
    const outlineIndices = [0, 2, 4, 6, 12, 14, 16, 28, 26, 24, 23, 25, 27, 11, 13, 15, 0];
    
    ctx.beginPath();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    let started = false;
    outlineIndices.forEach((idx) => {
      const kp = keypoints[idx];
      if (kp && kp.score > 0.3) {
        if (!started) {
          ctx.moveTo(kp.x, kp.y);
          started = true;
        } else {
          ctx.lineTo(kp.x, kp.y);
        }
      }
    });

    ctx.stroke();
    ctx.setLineDash([]);
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-contain"
        crossOrigin="anonymous"
        playsInline
        muted
        loop
        autoPlay={isPlaying}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      
      {/* Pose info overlay */}
      {poseData && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Pose Detected</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {poseData.keypoints.filter(kp => kp.score > 0.3).length} keypoints
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPoseOverlay;
