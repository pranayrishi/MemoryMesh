import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Camera, AlertTriangle, Activity, User, Zap } from 'lucide-react';

const LiveCameraFeed = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [fps, setFps] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(Date.now());
  const lastScenarioRef = useRef('normal');
  const [, forceUpdate] = useState({});

  // Initialize pose detector on mount
  useEffect(() => {
    let mounted = true;
    
    const initDetector = async () => {
      try {
        console.log('🔄 Initializing TensorFlow.js...');
        await tf.ready();
        console.log('✅ TensorFlow.js ready');
        
        console.log('🔄 Loading MoveNet model...');
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING, // Faster model
        };
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
        
        if (mounted) {
          setDetector(detector);
          console.log('✅ Pose detector initialized and ready!');
        }
      } catch (error) {
        console.error('❌ Failed to initialize pose detector:', error);
      }
    };

    initDetector();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Force timeline re-render while camera is running
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      forceUpdate({});
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [isRunning]);

  // Start camera
  const startCamera = async () => {
    // Check if detector is ready
    if (!detector) {
      alert('⏳ Pose detector is still loading... Please wait a moment and try again.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Clear timeline and start new session
        const startTime = Date.now();
        setSessionStartTime(startTime);
        setTimeline([{
          timestamp: 0,
          scenario: 'normal',
          confidence: 1.0,
          time: new Date().toLocaleTimeString()
        }]);
        lastScenarioRef.current = 'normal';
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsRunning(true);
          console.log('✅ Camera started, beginning pose detection...');
          // Start pose detection after video is ready
          setTimeout(() => detectPose(), 100);
        };
      }
    } catch (error) {
      console.error('❌ Camera access denied:', error);
      alert('Please allow camera access to use this feature');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRunning(false);
    setCurrentScenario(null);
    setPoseData(null);
  };

  // Detect pose and analyze
  const detectPose = async () => {
    if (!detector) {
      // Detector not ready, stop trying
      return;
    }
    
    if (!videoRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    // Check if video is ready
    if (videoRef.current.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    try {
      // Detect poses
      const poses = await detector.estimatePoses(videoRef.current);
      
      if (poses.length > 0) {
        const pose = poses[0];
        
        // Draw pose on canvas
        drawPose(pose);
        
        // Analyze pose for scenarios
        const analysis = await analyzePoseForScenario(pose);
        setCurrentScenario(analysis);
        setPoseData(pose);
        
        // Update timeline if scenario changed
        if (analysis && sessionStartTime) {
          console.log(`📊 Current scenario: ${analysis.scenario}, Last: ${lastScenarioRef.current}`);
          
          if (analysis.scenario !== lastScenarioRef.current) {
            const timeElapsed = Date.now() - sessionStartTime;
            console.log(`🔄 Scenario changed: ${lastScenarioRef.current} → ${analysis.scenario} at ${timeElapsed}ms`);
            setTimeline(prev => {
              const newTimeline = [...prev, {
                timestamp: timeElapsed,
                scenario: analysis.scenario,
                confidence: analysis.confidence,
                time: new Date().toLocaleTimeString()
              }];
              console.log(`📈 Timeline updated, now has ${newTimeline.length} events`);
              return newTimeline;
            });
            lastScenarioRef.current = analysis.scenario;
          }
        }
        
        // Calculate FPS
        const now = Date.now();
        const delta = now - lastFrameTimeRef.current;
        setFps(Math.round(1000 / delta));
        lastFrameTimeRef.current = now;
      }
    } catch (error) {
      console.error('Pose detection error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(detectPose);
  };

  // Draw pose keypoints and skeleton
  const drawPose = (pose) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ff00';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw skeleton
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
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
  };

  // Analyze pose for scenario detection
  const analyzePoseForScenario = async (pose) => {
    const keypoints = pose.keypoints;
    
    // Extract key body parts
    const nose = keypoints[0];
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftElbow = keypoints[7];
    const rightElbow = keypoints[8];
    const leftWrist = keypoints[9];
    const rightWrist = keypoints[10];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    // Calculate features
    const features = {
      // Head tilt
      headTilt: calculateAngle(
        { x: leftShoulder.x, y: leftShoulder.y },
        { x: rightShoulder.x, y: rightShoulder.y }
      ),
      
      // Body tilt
      bodyTilt: calculateBodyTilt(
        { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
        { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
      ),
      
      // Hand positions
      leftHandHeight: leftWrist.y - leftShoulder.y,
      rightHandHeight: rightWrist.y - rightShoulder.y,
      
      // Eye closure (using nose position as proxy)
      eyesClosed: nose.score < 0.3,
    };

    // Detect scenarios
    let scenario = 'normal';
    let confidence = 0;
    let indicators = [];

    // Fall risk detection
    if (Math.abs(features.bodyTilt) > 20) {
      scenario = 'fall_risk';
      confidence = 0.85;
      indicators.push('Body tilting significantly');
    }

    // Confusion detection (hands near head)
    else if (features.leftHandHeight < -50 || features.rightHandHeight < -50) {
      scenario = 'confusion';
      confidence = 0.75;
      indicators.push('Hands near head');
    }

    // Agitation detection (unusual arm positions)
    else if (Math.abs(features.leftHandHeight) > 100 && Math.abs(features.rightHandHeight) > 100) {
      scenario = 'agitation';
      confidence = 0.70;
      indicators.push('Unusual arm movements');
    }

    // Wandering detection (forward lean)
    else if (features.bodyTilt > 10 && features.bodyTilt < 20) {
      scenario = 'wandering';
      confidence = 0.65;
      indicators.push('Forward leaning posture');
    }

    // Send to backend for advanced analysis
    try {
      const response = await fetch('http://localhost:5000/api/pose/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keypoints, features }),
      });
      
      if (response.ok) {
        const backendAnalysis = await response.json();
        if (backendAnalysis.confidence > confidence) {
          return backendAnalysis;
        }
      }
    } catch (error) {
      // Backend analysis failed, use local analysis
    }

    return {
      scenario,
      confidence,
      indicators,
      features,
      timestamp: new Date().toISOString(),
    };
  };

  // Helper: Calculate angle
  const calculateAngle = (p1, p2) => {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    return angle;
  };

  // Helper: Calculate body tilt
  const calculateBodyTilt = (shoulder, hip) => {
    const angle = Math.atan2(hip.y - shoulder.y, hip.x - shoulder.x) * 180 / Math.PI;
    return angle - 90; // 0 = upright
  };

  // Get scenario color
  const getScenarioColor = (scenario) => {
    const colors = {
      fall_risk: 'bg-red-500',
      confusion: 'bg-yellow-500',
      agitation: 'bg-orange-500',
      wandering: 'bg-blue-500',
      normal: 'bg-green-500',
    };
    return colors[scenario] || 'bg-gray-500';
  };

  // Get scenario icon
  const getScenarioIcon = (scenario) => {
    const icons = {
      fall_risk: AlertTriangle,
      confusion: Activity,
      agitation: Zap,
      wandering: User,
      normal: Activity,
    };
    const Icon = icons[scenario] || Activity;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Camera className="w-8 h-8 text-blue-600" />
            Live Camera Feed
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time pose detection and scenario analysis using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="text-white font-medium">
                    {isRunning ? 'Live' : 'Offline'}
                  </span>
                  {isRunning && (
                    <span className="text-gray-400 text-sm ml-2">{fps} FPS</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!isRunning ? (
                    <button
                      onClick={startCamera}
                      disabled={!detector}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        detector
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      {detector ? 'Start Camera' : 'Loading Model...'}
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Stop Camera
                    </button>
                  )}
                </div>
              </div>

              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-contain"
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-contain"
                />
                
                {!isRunning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      {detector ? (
                        <p>Click "Start Camera" to begin</p>
                      ) : (
                        <div>
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                          <p>Loading pose detection model...</p>
                          <p className="text-sm mt-2">This may take a few seconds</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            {/* Current Scenario */}
            {currentScenario && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Current Analysis</h3>
                
                <div className={`${getScenarioColor(currentScenario.scenario)} text-white rounded-lg p-4 mb-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getScenarioIcon(currentScenario.scenario)}
                    <span className="font-bold text-lg capitalize">
                      {currentScenario.scenario.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm opacity-90">
                    Confidence: {(currentScenario.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                {currentScenario.indicators && currentScenario.indicators.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Indicators:</h4>
                    <ul className="space-y-1">
                      {currentScenario.indicators.map((indicator, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Pose Features */}
            {currentScenario?.features && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Pose Metrics</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Body Tilt</span>
                    <span className="font-mono font-semibold">
                      {currentScenario.features.bodyTilt?.toFixed(1)}°
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Head Tilt</span>
                    <span className="font-mono font-semibold">
                      {currentScenario.features.headTilt?.toFixed(1)}°
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Left Hand</span>
                    <span className="font-mono font-semibold">
                      {currentScenario.features.leftHandHeight?.toFixed(0)}px
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Right Hand</span>
                    <span className="font-mono font-semibold">
                      {currentScenario.features.rightHandHeight?.toFixed(0)}px
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Green outlines show detected pose</li>
                <li>• AI analyzes body posture in real-time</li>
                <li>• Detects confusion, agitation, wandering</li>
                <li>• Identifies fall risk from body tilt</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Moments Timeline - Show while running and after stopped */}
        {timeline.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Key Moments Timeline
              </h3>
              {isRunning && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Current: <span className="font-semibold capitalize">{currentScenario?.scenario || 'detecting...'}</span>
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-red-600 font-medium">LIVE</span>
                  </span>
                </div>
              )}
            </div>
            
            {/* Horizontal Scrollable Timeline - YouTube Style */}
            <div className="relative">
              <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
                <div className="relative" style={{ minWidth: '2000px', height: '80px' }}>
                  {/* Base timeline bar (green background) */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-green-500 rounded-full"></div>
                  
                  {/* Colored segments for events */}
                  {timeline.map((event, idx) => {
                    const currentTime = Date.now();
                    const totalDuration = currentTime - sessionStartTime;
                    const startPercent = (event.timestamp / totalDuration) * 100;
                    const endPercent = idx < timeline.length - 1 
                      ? (timeline[idx + 1].timestamp / totalDuration) * 100
                      : 100;
                    const widthPercent = endPercent - startPercent;
                    
                    const getColor = (scenario) => {
                      if (scenario === 'fall_risk') return 'bg-red-500';
                      if (scenario === 'confusion') return 'bg-yellow-500';
                      if (scenario === 'agitation') return 'bg-orange-500';
                      if (scenario === 'wandering') return 'bg-blue-500';
                      return 'bg-green-500';
                    };
                    
                    return (
                      <div
                        key={idx}
                        className={`absolute top-0 h-3 ${getColor(event.scenario)} transition-all`}
                        style={{
                          left: `${startPercent}%`,
                          width: `${widthPercent}%`,
                          borderRadius: idx === 0 ? '9999px 0 0 9999px' : 
                                       idx === timeline.length - 1 ? '0 9999px 9999px 0' : '0'
                        }}
                      />
                    );
                  })}
                  
                  {/* Event markers with labels */}
                  {timeline.map((event, idx) => {
                    const totalDuration = Date.now() - sessionStartTime;
                    const position = (event.timestamp / totalDuration) * 100;
                    
                    const getIcon = (scenario) => {
                      if (scenario === 'fall_risk') return '🚨';
                      if (scenario === 'confusion') return '❓';
                      if (scenario === 'agitation') return '⚡';
                      if (scenario === 'wandering') return '🚶';
                      return '✅';
                    };
                    
                    const getBgColor = (scenario) => {
                      if (scenario === 'fall_risk') return 'bg-red-500';
                      if (scenario === 'confusion') return 'bg-yellow-500';
                      if (scenario === 'agitation') return 'bg-orange-500';
                      if (scenario === 'wandering') return 'bg-blue-500';
                      return 'bg-green-500';
                    };
                    
                    return (
                      <div
                        key={idx}
                        className="absolute"
                        style={{ 
                          left: `${position}%`,
                          top: '20px',
                          transform: 'translateX(-50%)'
                        }}
                      >
                        {/* Vertical line */}
                        <div className="w-0.5 h-6 bg-gray-400 mx-auto"></div>
                        
                        {/* Event badge */}
                        <div className={`${getBgColor(event.scenario)} text-white px-3 py-2 rounded-lg shadow-lg mt-2 whitespace-nowrap text-sm font-medium`}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getIcon(event.scenario)}</span>
                            <div>
                              <div className="capitalize">{event.scenario.replace('_', ' ')}</div>
                              <div className="text-xs opacity-90">{event.time}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Time markers at bottom */}
              <div className="relative mt-16" style={{ minWidth: '2000px' }}>
                {(() => {
                  const currentTime = Date.now();
                  const totalDuration = currentTime - sessionStartTime;
                  const totalSeconds = Math.floor(totalDuration / 1000);
                  const markers = [];
                  
                  // Create a marker every 5 seconds
                  for (let i = 0; i <= totalSeconds; i += 5) {
                    const position = (i * 1000 / totalDuration) * 100;
                    markers.push(
                      <div
                        key={i}
                        className="absolute"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="text-xs text-gray-600 font-mono">{i}s</div>
                      </div>
                    );
                  }
                  
                  return markers;
                })()}
              </div>
              
              {/* Scroll hint */}
              <div className="text-center text-sm text-gray-500 mt-2">
                ← Scroll horizontally to view full timeline →
              </div>
            </div>
            
            {/* Session Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{timeline.length}</div>
                  <div className="text-sm text-gray-600">Events Detected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor((Date.now() - sessionStartTime) / 1000)}s
                  </div>
                  <div className="text-sm text-gray-600">Session Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {timeline.filter(e => e.scenario === 'normal').length}
                  </div>
                  <div className="text-sm text-gray-600">Normal Periods</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {timeline.filter(e => e.scenario !== 'normal').length}
                  </div>
                  <div className="text-sm text-gray-600">Concerns Detected</div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Timeline Legend:</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Confusion</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Agitation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Wandering</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Fall Risk</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCameraFeed;
