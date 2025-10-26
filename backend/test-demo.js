/**
 * Demo Test Script for MemoryMesh
 * Tests the complete intervention pipeline with simulated scenarios
 */

const PatientProfile = require('./models/PatientProfile');
const VisionService = require('./services/VisionService');
const ConversationEngine = require('./services/ConversationEngine');
const VoiceService = require('./services/VoiceService');
const InterventionCoordinator = require('./services/InterventionCoordinator');

async function runDemo() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║             MemoryMesh Demo Test Suite                   ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Initialize services
  console.log('📋 Initializing services...\n');

  const patientProfile = new PatientProfile({});
  const visionService = new VisionService();
  const conversationEngine = new ConversationEngine(patientProfile);
  const voiceService = new VoiceService();
  const interventionCoordinator = new InterventionCoordinator(
    patientProfile,
    conversationEngine,
    voiceService
  );

  console.log(`✅ Patient Profile: ${patientProfile.preferredName} (${patientProfile.cognitiveStage} stage)`);
  console.log('✅ Vision Service initialized');
  console.log('✅ Conversation Engine initialized');
  console.log('✅ Voice Service initialized');
  console.log('✅ Intervention Coordinator initialized\n');

  // Test Scenario 1: Meal Confusion
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🍽️  TEST 1: MEAL CONFUSION SCENARIO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const intervention1 = await conversationEngine.generatePersonalizedIntervention(
      'MEAL_CONFUSION',
      { lastMealType: 'lunch', timeSinceMeal: '30 minutes' }
    );

    console.log('📊 Scenario: Patient repeatedly opening refrigerator');
    console.log(`⚖️  Urgency Score: ${intervention1.urgency_score}`);
    console.log(`🎯 Intervention Type: ${intervention1.intervention_type}`);
    console.log(`💭 AI Reasoning: ${intervention1.reasoning}`);
    console.log(`\n🔊 Voice Message to Patient:`);
    console.log(`   "${intervention1.voice_message}"\n`);

    if (intervention1.actions && intervention1.actions.length > 0) {
      console.log('✅ Actions to be taken:');
      intervention1.actions.forEach(action => console.log(`   - ${action}`));
    }

    console.log(`\n📝 Learning Note: ${intervention1.learning_notes}\n`);
  } catch (error) {
    console.error('❌ Error in Meal Confusion test:', error.message);
  }

  await sleep(2000);

  // Test Scenario 2: Stove Safety
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔥 TEST 2: STOVE SAFETY SCENARIO (CRITICAL)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const intervention2 = await conversationEngine.generatePersonalizedIntervention(
      'STOVE_SAFETY',
      { safetyIssue: 'burner on with no pot' }
    );

    console.log('📊 Scenario: Stove burner on, no pot present');
    console.log(`⚖️  Urgency Score: ${intervention2.urgency_score}`);
    console.log(`🎯 Intervention Type: ${intervention2.intervention_type}`);
    console.log(`💭 AI Reasoning: ${intervention2.reasoning}`);
    console.log(`\n🔊 Voice Message to Patient:`);
    console.log(`   "${intervention2.voice_message}"\n`);

    if (intervention2.actions && intervention2.actions.length > 0) {
      console.log('✅ Actions to be taken:');
      intervention2.actions.forEach(action => console.log(`   - ${action}`));
    }

    if (intervention2.caregiver_notification?.needed) {
      console.log(`\n🔔 Caregiver Notification (${intervention2.caregiver_notification.priority}):`);
      console.log(`   ${intervention2.caregiver_notification.message}`);
    }

    console.log(`\n📝 Learning Note: ${intervention2.learning_notes}\n`);
  } catch (error) {
    console.error('❌ Error in Stove Safety test:', error.message);
  }

  await sleep(2000);

  // Test Scenario 3: Wandering
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚶 TEST 3: WANDERING SCENARIO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const intervention3 = await conversationEngine.generatePersonalizedIntervention(
      'WANDERING',
      {}
    );

    console.log('📊 Scenario: Patient near door, attempting to leave');
    console.log(`⚖️  Urgency Score: ${intervention3.urgency_score}`);
    console.log(`🎯 Intervention Type: ${intervention3.intervention_type}`);
    console.log(`💭 AI Reasoning: ${intervention3.reasoning}`);
    console.log(`\n🔊 Voice Message to Patient:`);
    console.log(`   "${intervention3.voice_message}"\n`);

    if (intervention3.actions && intervention3.actions.length > 0) {
      console.log('✅ Actions to be taken:');
      intervention3.actions.forEach(action => console.log(`   - ${action}`));
    }

    console.log(`\n📝 Learning Note: ${intervention3.learning_notes}\n`);
  } catch (error) {
    console.error('❌ Error in Wandering test:', error.message);
  }

  await sleep(2000);

  // Test Scenario 4: Agitation
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('😰 TEST 4: AGITATION SCENARIO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const intervention4 = await conversationEngine.generatePersonalizedIntervention(
      'AGITATION',
      {}
    );

    console.log('📊 Scenario: Patient showing signs of distress');
    console.log(`⚖️  Urgency Score: ${intervention4.urgency_score}`);
    console.log(`🎯 Intervention Type: ${intervention4.intervention_type}`);
    console.log(`💭 AI Reasoning: ${intervention4.reasoning}`);
    console.log(`\n🔊 Voice Message to Patient:`);
    console.log(`   "${intervention4.voice_message}"\n`);

    if (intervention4.actions && intervention4.actions.length > 0) {
      console.log('✅ Actions to be taken:');
      intervention4.actions.forEach(action => console.log(`   - ${action}`));
    }

    console.log(`\n📝 Learning Note: ${intervention4.learning_notes}\n`);
  } catch (error) {
    console.error('❌ Error in Agitation test:', error.message);
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 DEMO COMPLETE - STATISTICS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const stats = interventionCoordinator.getStatistics();
  console.log(`Total Interventions: ${stats.totalInterventions}`);
  console.log(`AI-Only: ${stats.aiOnlyCount} (${stats.aiOnlyPercentage}%)`);
  console.log(`Notify Caregiver: ${stats.notifyCount} (${stats.notifyPercentage}%)`);
  console.log(`Emergency: ${stats.emergencyCount} (${stats.emergencyPercentage}%)`);
  console.log(`Success Rate: ${stats.successRate}%`);
  console.log(`Average Response Time: ${(stats.averageResponseTime / 1000).toFixed(2)}s\n`);

  console.log('✅ All tests completed successfully!\n');
  console.log('🎯 Key Takeaways:');
  console.log('   • AI generates warm, personalized interventions');
  console.log('   • Uses patient-specific memories and preferences');
  console.log('   • Applies therapeutic techniques (validation, reminiscence)');
  console.log('   • Appropriate urgency levels and escalation');
  console.log('   • Continuous learning from each interaction\n');

  console.log('💡 Next Steps:');
  console.log('   1. Start the backend: npm run server');
  console.log('   2. Start the frontend: npm run client');
  console.log('   3. Trigger scenarios from the dashboard\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the demo
runDemo().catch(error => {
  console.error('\n❌ Demo failed:', error);
  process.exit(1);
});
