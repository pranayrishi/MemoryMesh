const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const config = require('./config/config');

// Services
const PatientProfile = require('./models/PatientProfile');
const VisionService = require('./services/VisionService');
const ConversationEngine = require('./services/ConversationEngine');
const VoiceService = require('./services/VoiceService');
const InterventionCoordinator = require('./services/InterventionCoordinator');
const DemoResponseService = require('./services/DemoResponseService');
const GoogleHomeService = require('./services/GoogleHomeService');
const ElevenLabsService = require('./services/ElevenLabsService');
const OMIService = require('./services/OMIService');
const VideoPlaybackService = require('./services/VideoPlaybackService');
const PersonaDetectionService = require('./services/PersonaDetectionService');
const ContinuousDemoService = require('./services/ContinuousDemoService');
const EmailNotificationService = require('./services/EmailNotificationService');
const PoseAnalysisService = require('./services/PoseAnalysisService');
const FetchAIService = require('./services/FetchAIService');
const VideoTrackingService = require('./services/VideoTrackingService');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve audio files from cache
app.use('/audio', express.static(require('path').join(__dirname, '../audio-cache')));

// Serve video files from assets with CORS headers
app.use('/videos', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(require('path').join(__dirname, '../assets/videos')));

// Broadcast function (defined later, but referenced here)
let broadcast;

// Initialize services
let patientProfile = new PatientProfile({});
let visionService = new VisionService();
let conversationEngine = new ConversationEngine(patientProfile);
let voiceService = new VoiceService();
let googleHomeService; // Will be initialized after broadcast function is defined
let elevenLabsService = new ElevenLabsService();
let omiService = new OMIService();
let demoResponseService = new DemoResponseService(patientProfile);
let videoPlaybackService = new VideoPlaybackService();
let personaDetectionService = new PersonaDetectionService();
let continuousDemoService = new ContinuousDemoService();
let emailNotificationService = new EmailNotificationService();
let poseAnalysisService = new PoseAnalysisService();
let fetchAIService = config.fetchaiApiKey ? new FetchAIService(config.fetchaiApiKey) : null;
let videoTrackingService = new VideoTrackingService();
let interventionCoordinator; // Will be initialized after googleHomeService

// Note: GoogleHomeService and InterventionCoordinator will be initialized after broadcast function is defined

// Initialize OMI Service
omiService.startListening().then(result => {
  if (result.success) {
    console.log('✅ OMI Dev Kit 2 listening started');
  } else {
    console.log('ℹ️  OMI Dev Kit 2: ' + result.reason);
  }
});

// OMI event listeners
omiService.on('transcript', (data) => {
  console.log('📝 OMI Transcript:', data.entry.text);

  // Broadcast transcript to all clients
  broadcast({
    type: 'omi_transcript',
    transcript: data.entry,
    analysis: data.analysis
  });

  // If high concern level, trigger analysis
  if (data.analysis.concernLevel > 0.6) {
    console.log('⚠️  High concern level detected from OMI transcript');
    // Could trigger proactive intervention here
  }
});

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      await handleWebSocketMessage(data, ws);
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  // Send initial state
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    patient: {
      name: patientProfile.preferredName,
      id: patientProfile.id
    }
  }));
});

// Handle WebSocket messages
async function handleWebSocketMessage(data, ws) {
  switch (data.type) {
    case 'video_frame':
      await processVideoFrame(data.imageUrl, ws);
      break;

    case 'trigger_scenario':
      await triggerDemoScenario(data.scenario, ws);
      break;

    case 'get_status':
      sendStatus(ws);
      break;

    case 'get_history':
      sendHistory(ws);
      break;

    default:
      console.log('Unknown message type:', data.type);
  }
}

// Process video frame
async function processVideoFrame(imageUrl, ws) {
  try {
    // NOTE: Creao API calls are temporarily disabled due to 401 authentication errors
    // The webcam feed is still displayed for visual monitoring
    // To re-enable automatic vision analysis, uncomment the code below and ensure Creao API credentials are valid

    /*
    // Analyze frame
    const analysis = await visionService.analyzeFrame(imageUrl);
    const scenarios = visionService.detectScenario(analysis);

    // Broadcast analysis to all clients
    broadcast({
      type: 'vision_analysis',
      analysis: analysis,
      scenarios: scenarios
    });

    // Process intervention if scenarios detected
    if (scenarios.length > 0 || analysis.urgency_level > 0.3) {
      const intervention = await interventionCoordinator.processAnalysis(analysis, scenarios);

      // Broadcast intervention
      broadcast({
        type: 'intervention',
        intervention: intervention
      });
    }
    */

    // For now, webcam is display-only
    // Use demo scenarios (⚡ button) to trigger interventions
    // Demo scenarios work perfectly with DemoResponseService + ElevenLabs

  } catch (error) {
    console.error('Error processing frame:', error);
  }
}

// Trigger demo scenario
async function triggerDemoScenario(scenario, ws) {
  console.log('🎬 Triggering demo scenario:', scenario);

  try {
    // Select video for this scenario
    const videoSelection = videoPlaybackService.selectVideoForScenario(scenario);
    
    if (!videoSelection.success) {
      console.log('⚠️  No video available for scenario:', scenario);
      console.log('   Run: python video/generate_persona_videos.py');
    } else {
      console.log(`📹 Using video: ${videoSelection.persona} for ${scenario}`);
      videoPlaybackService.setCurrentVideo(scenario, videoSelection.persona);
      
      // Detect persona from video (for CV integration)
      const videoPath = require('path').join(__dirname, '../assets/videos', `${scenario}_${videoSelection.persona}.mp4`);
      const personaDetection = await personaDetectionService.detectPersonaFromVideo(videoPath);
      console.log(`🔍 Detected persona: ${personaDetection.persona} (confidence: ${personaDetection.confidence})`);
      
      // Update last detection for intervention logic
      personaDetectionService.updateLastDetection(
        personaDetection.persona,
        personaDetection.confidence,
        { scenario, videoUrl: videoSelection.videoUrl }
      );
      
      // Broadcast video info to frontend
      broadcast({
        type: 'video_selected',
        scenario: scenario,
        persona: videoSelection.persona,
        videoUrl: videoSelection.videoUrl,
        detection: personaDetection
      });
    }

    // Get immediate demo response for rich, personalized intervention
    const demoDecision = demoResponseService.getDemoResponse(scenario, {
      lastMealType: 'chicken soup lunch',
      timeSinceMeal: '30 minutes',
      safetyIssue: 'burner on with no pot'
    });

    // Speak the voice message through ElevenLabs (natural voice) or Google Home fallback
    if (demoDecision.voice_message) {
      console.log('🎙️  Voice message to speak:', demoDecision.voice_message.substring(0, 50) + '...');
      try {
        // Try ElevenLabs first for most natural voice
        const audioResult = await elevenLabsService.speak(demoDecision.voice_message, {
          stability: 0.6, // Slightly more expressive for empathy
          similarity_boost: 0.8
        });
        console.log('✅ Voice synthesized with ElevenLabs');

        // Broadcast audio URL to clients so they can play it
        broadcast({
          type: 'audio_ready',
          audioUrl: audioResult.audioUrl,
          message: demoDecision.voice_message
        });
      } catch (elevenError) {
        console.log('⚠️  ElevenLabs error, falling back to Google Home:', elevenError.message);
        // Fallback to Google Home (which will use browser TTS if no device)
        console.log('🔊 Calling googleHomeService.speak()...');
        await googleHomeService.speak(demoDecision.voice_message);
        console.log('✅ Google Home speak completed');
      }
    }

    // Execute intervention through coordinator
    const level = interventionCoordinator.determineInterventionLevel(
      demoDecision,
      { urgency_level: demoDecision.urgency_score }
    );

    const startTime = Date.now();
    const fullIntervention = await interventionCoordinator.executeIntervention(
      demoDecision,
      level,
      { scenario: scenario },
      [{ type: scenario.toUpperCase(), confidence: 1.0, description: `Demo ${scenario} scenario` }]
    );

    // Update statistics and log the intervention
    const responseTime = Date.now() - startTime;
    interventionCoordinator.updateStatistics(fullIntervention, responseTime);
    interventionCoordinator.logIntervention(fullIntervention);

    // Broadcast to all clients
    broadcast({
      type: 'demo_intervention',
      scenario: scenario,
      intervention: fullIntervention
    });

    // Send success response (only if WebSocket connection)
    if (ws) {
      ws.send(JSON.stringify({
        type: 'scenario_triggered',
        scenario: scenario,
        success: true
      }));
    }

    // Optionally try to get AI response in background for comparison
    try {
      const aiIntervention = await conversationEngine.generatePersonalizedIntervention(
        scenario.toUpperCase(),
        { lastMealType: 'lunch', timeSinceMeal: '30 minutes', safetyIssue: 'burner on with no pot' }
      );
      // Log AI response for comparison
      console.log('📝 Background AI also generated:', aiIntervention?.reasoning?.substring(0, 100));
    } catch (aiError) {
      // AI call is optional, don't fail the demo if it errors
      console.log('⚠️  Background AI call skipped:', aiError.message);
    }
  } catch (error) {
    console.error('Error triggering scenario:', error);
    if (ws) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  }
}

// Send current status
function sendStatus(ws) {
  ws.send(JSON.stringify({
    type: 'status',
    data: {
      patient: patientProfile.currentState,
      statistics: interventionCoordinator.getStatistics(),
      voice: voiceService.getStatus()
    }
  }));
}

// Send history
function sendHistory(ws) {
  ws.send(JSON.stringify({
    type: 'history',
    data: {
      interventions: interventionCoordinator.getHistory(20),
      activities: patientProfile.currentState.todaysActivities,
      voice: voiceService.getHistory(20)
    }
  }));
}

// Broadcast to all clients
broadcast = function(data) {
  const message = JSON.stringify(data);
  let sentCount = 0;
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sentCount++;
    }
  });
  console.log(`📡 Broadcast ${data.type} to ${sentCount} client(s)`);
};

// Initialize GoogleHomeService with broadcast function
googleHomeService = new GoogleHomeService(broadcast);

// Initialize InterventionCoordinator
interventionCoordinator = new InterventionCoordinator(
  patientProfile,
  conversationEngine,
  googleHomeService,
  emailNotificationService
);

// Initialize Google Home discovery
googleHomeService.discoverDevices().then(devices => {
  if (devices.length > 0) {
    console.log(`✅ Found ${devices.length} Google Home device(s)`);
  } else {
    console.log('⚠️  No Google Home devices found - using browser TTS fallback mode');
  }
});

// REST API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      vision: 'operational',
      conversation: 'operational',
      voice: 'operational',
      intervention: 'operational'
    }
  });
});

// Get patient profile
app.get('/api/patient', (req, res) => {
  res.json({
    ...patientProfile,
    context: patientProfile.getContextForAI()
  });
});

// Update patient profile
app.post('/api/patient/update', (req, res) => {
  try {
    patientProfile = new PatientProfile(req.body);
    conversationEngine = new ConversationEngine(patientProfile);
    interventionCoordinator = new InterventionCoordinator(
      patientProfile,
      conversationEngine,
      voiceService
    );

    res.json({
      success: true,
      patient: patientProfile.preferredName
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Analyze image (REST endpoint)
app.post('/api/analyze', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const analysis = await visionService.analyzeFrame(imageUrl);
    const scenarios = visionService.detectScenario(analysis);

    res.json({
      analysis,
      scenarios
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger intervention
app.post('/api/intervene', async (req, res) => {
  try {
    const { scenario, context } = req.body;

    const intervention = await conversationEngine.generatePersonalizedIntervention(
      scenario,
      context || {}
    );

    res.json({
      success: true,
      intervention
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/statistics', (req, res) => {
  res.json(interventionCoordinator.getStatistics());
});

// Get daily summary
app.get('/api/summary/daily', (req, res) => {
  res.json(interventionCoordinator.getDailySummary());
});

// Get intervention history
app.get('/api/history/interventions', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json(interventionCoordinator.getHistory(limit));
});

// Get activity timeline
app.get('/api/timeline', (req, res) => {
  res.json({
    activities: patientProfile.currentState.todaysActivities,
    interventions: interventionCoordinator.getHistory()
  });
});

// Voice service endpoints
app.post('/api/voice/speak', async (req, res) => {
  try {
    const { message, options } = req.body;
    const result = await voiceService.speak(message, options);

    broadcast({
      type: 'voice_message',
      message: message
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OMI webhook endpoint for receiving transcripts
app.post('/api/omi/transcript', async (req, res) => {
  try {
    const { text, speaker, timestamp, confidence } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    // Process transcript through OMI service
    const result = await omiService.processTranscript({
      text,
      speaker: speaker || 'patient',
      timestamp: timestamp || new Date().toISOString(),
      confidence: confidence || 1.0
    });

    res.json({
      success: true,
      analysis: result.analysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate OMI transcript (for testing without real device)
app.post('/api/omi/simulate', async (req, res) => {
  try {
    const { text, speaker } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const result = await omiService.simulateTranscript(text, speaker);

    res.json({
      success: true,
      analysis: result.analysis,
      entry: result.entry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get OMI status
app.get('/api/omi/status', (req, res) => {
  res.json(omiService.getStatus());
});

// Get OMI conversation history
app.get('/api/omi/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json(omiService.getHistory(limit));
});

// Get OMI enriched context
app.get('/api/omi/context', (req, res) => {
  res.json(omiService.getEnrichedContext());
});

// Video playback endpoints
app.get('/api/videos/available', (req, res) => {
  res.json(videoPlaybackService.getAllVideosInfo());
});

app.get('/api/videos/status', (req, res) => {
  res.json(videoPlaybackService.getStatus());
});

app.get('/api/videos/scenario/:scenario', (req, res) => {
  const { scenario } = req.params;
  const { persona } = req.query;
  
  const selection = videoPlaybackService.selectVideoForScenario(scenario, persona);
  res.json(selection);
});

app.get('/api/videos/current', (req, res) => {
  const current = videoPlaybackService.getCurrentVideo();
  res.json(current || { message: 'No video currently playing' });
});

// Persona detection endpoints
app.get('/api/persona/status', (req, res) => {
  res.json(personaDetectionService.getStatus());
});

app.get('/api/persona/latest', (req, res) => {
  const detection = personaDetectionService.getLastDetection();
  res.json(detection || { message: 'No persona detected yet' });
});

app.post('/api/persona/detect', async (req, res) => {
  try {
    const { videoPath, scenario } = req.body;
    
    if (!videoPath) {
      return res.status(400).json({ error: 'videoPath is required' });
    }
    
    const detection = await personaDetectionService.detectPersonaForScenario(
      scenario || 'unknown',
      videoPath
    );
    
    res.json(detection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Demo scenario triggers
app.post('/api/demo/scenario/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    // Call the same function that WebSocket uses - this includes video selection!
    await triggerDemoScenario(type, null);
    
    res.json({
      success: true,
      message: `Scenario ${type} triggered successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Continuous demo mode endpoints
app.post('/api/demo/continuous/start', async (req, res) => {
  try {
    const started = await continuousDemoService.startContinuousDemo(async (scenario, index) => {
      // Trigger each scenario automatically
      await triggerDemoScenario(scenario, null);
      
      // Broadcast progress update
      broadcast({
        type: 'continuous_demo_progress',
        scenario: scenario,
        index: index,
        total: 3
      });
    });
    
    if (started) {
      // Broadcast continuous demo start
      broadcast({
        type: 'continuous_demo_started',
        videoUrl: '/videos/continuous_demo_grandma.mp4',
        duration: 72,
        scenarios: continuousDemoService.scenarioTimeline
      });
      
      res.json({
        success: true,
        message: 'Continuous demo started',
        status: continuousDemoService.getStatus()
      });
    } else {
      res.json({
        success: false,
        message: 'Continuous demo already running'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/demo/continuous/stop', (req, res) => {
  try {
    const stopped = continuousDemoService.stopContinuousDemo();
    
    if (stopped) {
      broadcast({
        type: 'continuous_demo_stopped'
      });
    }
    
    res.json({
      success: stopped,
      message: stopped ? 'Continuous demo stopped' : 'No continuous demo running'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/demo/continuous/status', (req, res) => {
  res.json(continuousDemoService.getStatus());
});

// Email notification endpoints
app.get('/api/email/status', (req, res) => {
  res.json(emailNotificationService.getStatus());
});

app.get('/api/email/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json(emailNotificationService.getHistory(limit));
});

app.post('/api/email/test', async (req, res) => {
  try {
    const result = await emailNotificationService.sendTestEmail();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pose analysis endpoints
app.post('/api/pose/analyze', async (req, res) => {
  try {
    const { keypoints, features } = req.body;
    const analysis = await poseAnalysisService.analyzePoseKeypoints(keypoints);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pose/status', (req, res) => {
  res.json(poseAnalysisService.getStatus());
});

// Fetch.ai agent endpoints
app.get('/api/fetchai/status', (req, res) => {
  if (!fetchAIService) {
    return res.json({ 
      enabled: false, 
      message: 'Fetch.ai not configured' 
    });
  }
  res.json({
    enabled: true,
    stats: fetchAIService.getAgentStats()
  });
});

// Video tracking endpoints
app.post('/api/tracking/detect-frame', async (req, res) => {
  try {
    const { frameData, videoId, frameNumber } = req.body;
    const detection = await videoTrackingService.detectPersonInFrame(frameData, videoId, frameNumber);
    res.json(detection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tracking/stats', (req, res) => {
  res.json(videoTrackingService.getCacheStats());
});

// Initialize Fetch.ai agent
if (fetchAIService) {
  fetchAIService.initialize().then(success => {
    if (success) {
      console.log('🤖 Fetch.ai Care Coordinator Agent: Active');
    } else {
      console.log('⚠️  Fetch.ai Care Coordinator Agent: Failed to initialize (continuing without)');
    }
  });
}

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║                🧠  MemoryMesh  🧠                         ║');
  console.log('║         AI-Powered Cognitive Co-Pilot                     ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
  console.log('');
  console.log('📊 Services Status:');
  console.log('   ✅ Vision Service (Creao API)');
  console.log('   ✅ Conversation Engine (Claude AI)');
  console.log('   ✅ Voice Service (Google Home)');
  console.log('   ✅ Intervention Coordinator');
  console.log(`   ${fetchAIService ? '🤖' : '⚪'} Fetch.ai Agent Coordination`);
  console.log('');
  console.log(`👤 Patient: ${patientProfile.preferredName} (${patientProfile.cognitiveStage} stage)`);
  console.log('');
  console.log('Ready to provide compassionate, proactive care! 💙');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  visionService.stopContinuousMonitoring();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
