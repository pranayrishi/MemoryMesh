import React, { useEffect, useState, useRef } from 'react';
import { Video, Film, Eye, Play, Pause, UtensilsCrossed, Flame, Navigation, AlertTriangle } from 'lucide-react';
import websocket from '../services/websocket';

function VideoMonitor() {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [detectedPersona, setDetectedPersona] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [isContinuousDemo, setIsContinuousDemo] = useState(false);
  const videoRef = useRef(null);

  // Listen for video selection and demo interventions from backend
  useEffect(() => {
    const handleVideoSelected = (data) => {
      if (data.type === 'video_selected') {
        console.log('Video selected:', data);
        // Convert relative URL to absolute URL pointing to backend
        const videoUrl = data.videoUrl.startsWith('http') 
          ? data.videoUrl 
          : `http://localhost:5000${data.videoUrl}`;
        console.log('Video URL:', videoUrl);
        setCurrentVideo(videoUrl);
        setDetectedPersona(data.detection);
        setScenario(data.scenario);
        setActiveScenario(data.scenario);
        setIsPlaying(true);
        
        // Auto-play video if available
        if (videoRef.current && videoUrl) {
          videoRef.current.load();
          videoRef.current.play().catch(err => {
            console.log('Auto-play prevented:', err);
          });
        }
      }
    };

    const handleDemoIntervention = (data) => {
      if (data.type === 'demo_intervention') {
        console.log('Demo intervention:', data);
        // Set active scenario even if no video
        setActiveScenario(data.scenario);
        setScenario(data.scenario);
        // Set persona if detected
        if (data.intervention?.visionAnalysis?.persona) {
          setDetectedPersona({
            persona: data.intervention.visionAnalysis.persona,
            confidence: 1.0,
            method: 'demo'
          });
        }
      }
    };

    const handleContinuousDemoStarted = (data) => {
      if (data.type === 'continuous_demo_started') {
        console.log('Continuous demo started:', data);
        const videoUrl = `http://localhost:5000${data.videoUrl}`;
        setCurrentVideo(videoUrl);
        setIsContinuousDemo(true);
        setDetectedPersona({ persona: 'grandma', confidence: 1.0, method: 'continuous' });
        setScenario('continuous_demo');
        setActiveScenario('continuous_demo');
        setIsPlaying(true);
        
        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.play().catch(err => console.log('Auto-play prevented:', err));
        }
      }
    };

    const handleContinuousDemoStopped = (data) => {
      if (data.type === 'continuous_demo_stopped') {
        setIsContinuousDemo(false);
      }
    };

    websocket.on('video_selected', handleVideoSelected);
    websocket.on('demo_intervention', handleDemoIntervention);
    websocket.on('continuous_demo_started', handleContinuousDemoStarted);
    websocket.on('continuous_demo_stopped', handleContinuousDemoStopped);
    
    return () => {
      websocket.off('video_selected', handleVideoSelected);
      websocket.off('demo_intervention', handleDemoIntervention);
      websocket.off('continuous_demo_started', handleContinuousDemoStarted);
      websocket.off('continuous_demo_stopped', handleContinuousDemoStopped);
    };
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Video className="w-5 h-5 mr-2 text-primary-600" />
          AI Video Analysis
        </h2>
        <div className="flex items-center space-x-2">
          {currentVideo && (
            <span className="badge badge-success">
              <Film className="w-3 h-3 mr-1 inline" />
              Active
            </span>
          )}
          {!currentVideo && (
            <span className="badge badge-info">
              Waiting for scenario
            </span>
          )}
        </div>
      </div>

      {/* Video Display */}
      <div className="bg-gray-900 rounded-lg aspect-video relative overflow-hidden mb-4">
        {currentVideo ? (
          /* Real video when available */
          <>
            <video
              ref={videoRef}
              src={currentVideo}
              loop={!isContinuousDemo}
              playsInline
              className="w-full h-full object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                if (isContinuousDemo) {
                  console.log('Continuous demo video ended');
                  setIsPlaying(false);
                }
              }}
            />

            {/* Demo Video Indicator */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-1 rounded-full shadow-lg">
                <Film className="w-4 h-4" />
                <span className="text-sm font-medium">AI VIDEO</span>
              </div>
            </div>

            {/* Persona Detection Overlay */}
            {detectedPersona && (
              <div className="absolute top-16 right-4">
                <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                  <Eye className="w-4 h-4 inline mr-2" />
                  <span className="capitalize font-medium">{detectedPersona.persona}</span>
                  <span className="text-xs ml-2 opacity-75">
                    ({Math.round(detectedPersona.confidence * 100)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Scenario Label */}
            {scenario && (
              <div className="absolute bottom-4 right-4">
                <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                  <span className="capitalize font-medium">{scenario.replace('_', ' ')}</span>
                </div>
              </div>
            )}

            {/* Play/Pause Control */}
            <button
              onClick={togglePlayPause}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center transition-all opacity-0 hover:opacity-100"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>
          </>
        ) : activeScenario ? (
          /* Scenario visualization when no video available */
          <ScenarioVisualization scenario={activeScenario} persona={detectedPersona} />
        ) : (
          /* Placeholder when no scenario active */
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Film className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No Active Scenario</p>
            <p className="text-sm mt-2">Click ⚡ to trigger a demo scenario</p>
            <p className="text-xs mt-4 text-gray-500">AI will analyze and generate interventions</p>
          </div>
        )}
      </div>

      {/* Analysis Info */}
      {(currentVideo || activeScenario) && (
        <div className="space-y-3">
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <h3 className="text-sm font-medium text-primary-900 mb-2">AI Analysis Active</h3>
            <div className="space-y-2 text-sm text-primary-800">
              <div className="flex items-center justify-between">
                <span>Scenario:</span>
                <span className="font-medium capitalize">{scenario?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Detected Persona:</span>
                <span className="font-medium capitalize">{detectedPersona?.persona || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confidence:</span>
                <span className="font-medium">{Math.round((detectedPersona?.confidence || 0) * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Detection Method:</span>
                <span className="font-medium capitalize">{detectedPersona?.method || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Note:</strong> {currentVideo ? 
              'The AI is analyzing this pre-generated video to demonstrate intervention capabilities.' :
              'Video not generated yet. The AI is still analyzing the scenario and generating interventions. Generate videos with: python video/generate_persona_videos.py'
            }
          </div>
        </div>
      )}
    </div>
  );
}

// Scenario Visualization Component (when video not available)
function ScenarioVisualization({ scenario, persona }) {
  const getScenarioInfo = (scenarioType) => {
    const scenarios = {
      meal_confusion: {
        icon: UtensilsCrossed,
        color: 'from-yellow-500 to-orange-500',
        title: 'Meal Confusion',
        description: 'Patient checking refrigerator repeatedly',
        emoji: '🍽️'
      },
      stove_safety: {
        icon: Flame,
        color: 'from-red-500 to-orange-600',
        title: 'Stove Safety',
        description: 'Burner on with no pot - Critical safety issue',
        emoji: '🔥'
      },
      wandering: {
        icon: Navigation,
        color: 'from-blue-500 to-purple-500',
        title: 'Wandering',
        description: 'Patient attempting to leave the house',
        emoji: '🚪'
      },
      agitation: {
        icon: AlertTriangle,
        color: 'from-orange-500 to-red-500',
        title: 'Agitation',
        description: 'Patient showing signs of distress',
        emoji: '😰'
      }
    };
    return scenarios[scenarioType] || scenarios.meal_confusion;
  };

  const info = getScenarioInfo(scenario);
  const Icon = info.icon;

  return (
    <div className="w-full h-full relative">
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-20 animate-pulse`}></div>
      
      {/* Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center text-white p-8">
        {/* Large emoji/icon */}
        <div className="text-8xl mb-6 animate-bounce">
          {info.emoji}
        </div>
        
        {/* Scenario title */}
        <h2 className="text-3xl font-bold mb-3 text-center text-white drop-shadow-lg">
          {info.title}
        </h2>
        
        {/* Description */}
        <p className="text-lg text-center text-gray-200 mb-6 max-w-md">
          {info.description}
        </p>

        {/* AI Analysis indicator */}
        <div className="flex items-center space-x-2 bg-black bg-opacity-50 px-4 py-2 rounded-full backdrop-blur-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">AI Analyzing...</span>
        </div>

        {/* Persona badge if detected */}
        {persona && (
          <div className="mt-4 bg-black bg-opacity-50 px-4 py-2 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm capitalize font-medium">{persona.persona}</span>
              <span className="text-xs opacity-75">({Math.round(persona.confidence * 100)}%)</span>
            </div>
          </div>
        )}

        {/* Video generation hint */}
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 p-3 rounded-lg backdrop-blur-sm text-xs text-center">
          <p className="text-gray-300">
            <strong className="text-white">No video available</strong> - Showing scenario visualization
          </p>
          <p className="text-gray-400 mt-1">
            Generate videos: <code className="text-purple-300">python video/generate_persona_videos.py</code>
          </p>
        </div>

        {/* DEMO indicator */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-1 rounded-full shadow-lg">
            <Film className="w-4 h-4" />
            <span className="text-sm font-medium">DEMO MODE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoMonitor;
