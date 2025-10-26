import React, { useEffect, useState, useRef } from 'react';
import { Video, Eye, MapPin, Activity, Camera, AlertCircle, Film } from 'lucide-react';
import { useWebcam } from '../hooks/useWebcam';
import websocket from '../services/websocket';

function LiveMonitor({ visionAnalysis, patient }) {
  const { videoRef, stream, error, isLoading, hasPermission, captureFrame } = useWebcam();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoVideo, setDemoVideo] = useState(null);
  const [detectedPersona, setDetectedPersona] = useState(null);
  const demoVideoRef = useRef(null);

  // Listen for demo video selection from backend
  useEffect(() => {
    const handleVideoSelected = (data) => {
      if (data.type === 'video_selected') {
        console.log('Demo video selected:', data);
        setDemoVideo({
          url: data.videoUrl,
          scenario: data.scenario,
          persona: data.persona
        });
        setDetectedPersona(data.detection);
        
        // Auto-play demo video
        if (demoVideoRef.current) {
          demoVideoRef.current.load();
          demoVideoRef.current.play().catch(err => {
            console.log('Auto-play prevented:', err);
          });
        }
      }
    };

    websocket.on('video_selected', handleVideoSelected);
    
    return () => {
      websocket.off('video_selected', handleVideoSelected);
    };
  }, []);

  // Send frames for analysis every 3 seconds when webcam is active
  useEffect(() => {
    if (!stream || !hasPermission || demoVideo) return; // Skip if demo video is playing

    const interval = setInterval(() => {
      const frameData = captureFrame();
      if (frameData) {
        setIsAnalyzing(true);
        websocket.send('video_frame', { imageUrl: frameData });
        setTimeout(() => setIsAnalyzing(false), 2000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [stream, hasPermission, captureFrame, demoVideo]);

  // Handle camera errors
  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Video className="w-5 h-5 mr-2 text-primary-600" />
            Live Monitor
          </h2>
          <span className="badge badge-danger">Camera Error</span>
        </div>

        <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center text-gray-300 px-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-danger-400" />
            <p className="text-white font-medium mb-2">Camera Access Required</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary text-sm"
            >
              Retry Camera Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Camera loading state
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Video className="w-5 h-5 mr-2 text-primary-600" />
            Live Monitor
          </h2>
          <span className="badge badge-info">Initializing...</span>
        </div>

        <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Camera className="w-16 h-16 mx-auto mb-2 opacity-50 animate-pulse" />
            <p>Requesting camera access...</p>
            <p className="text-sm mt-2">Please allow camera permission in your browser</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract analysis data if available
  const analysis = visionAnalysis?.analysis;
  const scenarios = visionAnalysis?.scenarios || [];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Video className="w-5 h-5 mr-2 text-primary-600" />
          Live Monitor
        </h2>
        <div className="flex items-center space-x-2">
          {isAnalyzing && (
            <span className="badge badge-info text-xs">
              <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse mr-1.5 inline-block"></div>
              Analyzing...
            </span>
          )}
          {analysis && (
            <span className={`badge ${getUrgencyBadge(analysis.urgency_level)}`}>
              {getUrgencyLabel(analysis.urgency_level)}
            </span>
          )}
        </div>
      </div>

      {/* Video Feed - Demo or Live */}
      <div className="bg-gray-900 rounded-lg aspect-video relative overflow-hidden mb-4">
        {/* Demo Video (when scenario is triggered) */}
        {demoVideo ? (
          <video
            ref={demoVideoRef}
            src={demoVideo.url}
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          /* Live Webcam Feed */
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* AI Annotations Overlay */}
        {analysis && (
          <div className="absolute top-4 left-4 space-y-2">
            <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
              <MapPin className="w-4 h-4 inline mr-2" />
              <span className="capitalize">{analysis.location || 'unknown'}</span>
            </div>
            <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
              <Activity className="w-4 h-4 inline mr-2" />
              <span className="capitalize">{(analysis.activity || 'monitoring').replace('_', ' ')}</span>
            </div>
          </div>
        )}

        {/* Demo Video Indicator */}
        {demoVideo && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-1 rounded-full shadow-lg">
              <Film className="w-4 h-4" />
              <span className="text-sm font-medium">DEMO</span>
            </div>
          </div>
        )}

        {/* Live indicator (when using webcam) */}
        {!demoVideo && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2 bg-danger-600 text-white px-3 py-1 rounded-full shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>
          </div>
        )}

        {/* Persona Detection Overlay */}
        {detectedPersona && (
          <div className="absolute top-16 right-4">
            <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
              <Eye className="w-4 h-4 inline mr-2" />
              <span className="capitalize">{detectedPersona.persona}</span>
              <span className="text-xs ml-2 opacity-75">
                ({Math.round(detectedPersona.confidence * 100)}%)
              </span>
            </div>
          </div>
        )}

        {/* Patient name overlay */}
        {patient && (
          <div className="absolute bottom-4 left-4">
            <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
              <Eye className="w-4 h-4 inline mr-2" />
              <span>Monitoring: {patient.preferredName || 'Patient'}</span>
            </div>
          </div>
        )}

        {/* Demo Scenario Label */}
        {demoVideo && (
          <div className="absolute bottom-4 right-4">
            <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
              <span className="capitalize">{demoVideo.scenario.replace('_', ' ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Details */}
      {analysis && (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">AI Analysis</h3>
            <p className="text-sm text-gray-600">{analysis.context_notes || 'Analyzing environment...'}</p>
          </div>

          {analysis.patient_visible && (
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-success-600" />
              <span className="text-sm text-gray-700">
                Patient in view: <span className="font-medium">{analysis.patient_position}</span>
              </span>
            </div>
          )}

          {analysis.emotional_indicators && (
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-primary-600" />
              <span className="text-sm text-gray-700">
                Emotional state: <span className="font-medium capitalize">{analysis.emotional_indicators}</span>
              </span>
            </div>
          )}

          {analysis.safety_concerns && analysis.safety_concerns.length > 0 && (
            <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <h4 className="text-sm font-medium text-warning-800 mb-1">Safety Concerns</h4>
              <ul className="text-sm text-warning-700 space-y-1">
                {analysis.safety_concerns.map((concern, idx) => (
                  <li key={idx}>• {concern}</li>
                ))}
              </ul>
            </div>
          )}

          {scenarios.length > 0 && (
            <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <h4 className="text-sm font-medium text-primary-800 mb-2">Detected Scenarios</h4>
              <div className="space-y-2">
                {scenarios.map((scenario, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-primary-700 capitalize">{scenario.type.replace('_', ' ')}</span>
                    <span className="text-xs text-primary-600">{(scenario.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No analysis yet */}
      {!analysis && hasPermission && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">AI is analyzing the video feed...</p>
          <p className="text-xs mt-1">Analysis updates every 3 seconds</p>
        </div>
      )}
    </div>
  );
}

function getUrgencyBadge(level) {
  if (!level || level < 0.3) return 'badge-success';
  if (level < 0.7) return 'badge-warning';
  return 'badge-danger';
}

function getUrgencyLabel(level) {
  if (!level || level < 0.3) return 'Normal';
  if (level < 0.7) return 'Attention';
  return 'Urgent';
}

export default LiveMonitor;
