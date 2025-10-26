import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StatisticsPage from './pages/StatisticsPage';
import LiveCameraFeed from './components/LiveCameraFeed';
import DemoController from './components/DemoController';
import SimpleTTS from './components/SimpleTTS';
import websocket from './services/websocket';
import api from './services/api';
import { LayoutDashboard, BarChart3, Video } from 'lucide-react';
import './index.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [patient, setPatient] = useState(null);
  const [latestIntervention, setLatestIntervention] = useState(null);
  const [visionAnalysis, setVisionAnalysis] = useState(null);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    websocket.connect();

    // WebSocket event listeners
    websocket.on('connected', () => {
      console.log('Dashboard connected to MemoryMesh');
      setConnected(true);
      loadInitialData();
    });

    websocket.on('disconnected', () => {
      setConnected(false);
    });

    websocket.on('vision_analysis', (data) => {
      setVisionAnalysis(data);
    });

    websocket.on('intervention', (data) => {
      console.log('Intervention received:', data);
      setLatestIntervention(data.intervention);
      // Reload statistics immediately
      setTimeout(() => {
        loadStatistics();
      }, 500);
    });

    websocket.on('demo_intervention', (data) => {
      console.log('Demo intervention received:', data);
      setLatestIntervention(data.intervention);
      // Reload statistics immediately
      setTimeout(() => {
        loadStatistics();
      }, 500);
    });

    // Audio playback listeners
    websocket.on('audio_ready', (data) => {
      console.log('🎉 ELEVENLABS AUDIO READY!', data);
      console.log('   Audio URL:', data.audioUrl);
      console.log('   Will play in 24 seconds...');
      
      // Play ElevenLabs audio with 24 second delay
      setTimeout(() => {
        console.log('🎙️  PLAYING ELEVENLABS AUDIO NOW!');
        const audio = new Audio(`http://localhost:5000${data.audioUrl}`);
        audio.volume = 1.0;
        
        audio.onloadeddata = () => {
          console.log('✅ ElevenLabs audio loaded successfully');
        };
        
        audio.onplay = () => {
          console.log('▶️  ElevenLabs audio playing!');
        };
        
        audio.onerror = (err) => {
          console.error('❌ Failed to play ElevenLabs audio:', err);
          // Fallback to TTS
          if (window.simpleTTSSpeak) {
            console.log('⚠️  Falling back to browser TTS');
            window.simpleTTSSpeak(data.message, 0);
          }
        };
        
        audio.play().catch(err => {
          console.error('❌ Play promise rejected:', err);
          if (window.simpleTTSSpeak) {
            console.log('⚠️  Falling back to browser TTS');
            window.simpleTTSSpeak(data.message, 0);
          }
        });
      }, 24000); // 24 seconds
    });

    websocket.on('tts_fallback', (data) => {
      console.log('🗣️  TTS fallback event received:', data);
      // DISABLED - Only use ElevenLabs, no browser TTS fallback
      console.log('⏭️  Skipping browser TTS - ElevenLabs only');
    });

    return () => {
      websocket.disconnect();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [patientData, stats] = await Promise.all([
        api.getPatient(),
        api.getStatistics()
      ]);

      setPatient(patientData);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await api.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  return (
    <Router>
      <AppContent
        connected={connected}
        patient={patient}
        latestIntervention={latestIntervention}
        visionAnalysis={visionAnalysis}
        statistics={statistics}
      />
    </Router>
  );
}

function AppContent({ connected, patient, latestIntervention, visionAnalysis, statistics }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/statistics', label: 'Statistics', icon: BarChart3 },
    { path: '/live-camera', label: 'Live Camera', icon: Video },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🧠</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MemoryMesh</h1>
                <p className="text-sm text-gray-500">AI-Powered Cognitive Co-Pilot</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {patient && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{patient.preferredName}</p>
                  <p className="text-xs text-gray-500 capitalize">{patient.cognitiveStage} stage</p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="mt-4 flex space-x-1 border-b border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Dashboard
                  patient={patient}
                  latestIntervention={latestIntervention}
                  visionAnalysis={visionAnalysis}
                  statistics={statistics}
                />
              </div>
            }
          />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/live-camera" element={<LiveCameraFeed />} />
        </Routes>
      </main>

      {/* Demo Controller - Fixed at bottom */}
      <DemoController />

      {/* SimpleTTS - Bulletproof audio */}
      <SimpleTTS />
    </div>
  );
}

export default App;
