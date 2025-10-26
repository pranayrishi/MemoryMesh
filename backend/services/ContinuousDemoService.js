/**
 * ContinuousDemoService
 * Manages continuous demo mode where scenarios play sequentially
 * Triggers interventions automatically at specific timestamps
 */

class ContinuousDemoService {
  constructor() {
    // Scenario timeline for continuous demo (based on video timestamps)
    // Updated for 24-second videos (2 segments × 12s each)
    this.scenarioTimeline = [
      { scenario: 'meal_confusion', startTime: 0, endTime: 24, duration: 24 },
      { scenario: 'stove_safety', startTime: 24, endTime: 48, duration: 24 },
      { scenario: 'wandering', startTime: 48, endTime: 72, duration: 24 }
    ];
    
    this.isRunning = false;
    this.currentScenarioIndex = 0;
    this.startTime = null;
    this.timers = [];
  }

  /**
   * Start continuous demo mode
   * Triggers scenarios automatically based on video timeline
   */
  async startContinuousDemo(triggerCallback) {
    if (this.isRunning) {
      console.log('⚠️  Continuous demo already running');
      return false;
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎬 STARTING CONTINUOUS DEMO MODE');
    console.log('='.repeat(60));
    console.log('Duration: ~72 seconds (24s per scenario)');
    console.log('Scenarios: 3 (automatic transitions)');
    console.log('='.repeat(60) + '\n');

    this.isRunning = true;
    this.currentScenarioIndex = 0;
    this.startTime = Date.now();
    this.clearTimers();

    // Schedule each scenario trigger
    for (let i = 0; i < this.scenarioTimeline.length; i++) {
      const scenario = this.scenarioTimeline[i];
      
      // Trigger 3 seconds into each scenario for better timing
      // This allows behavior to unfold before intervention appears
      const triggerDelay = 3000; // 3 seconds into scenario
      const delay = scenario.startTime * 1000 + triggerDelay;
      
      const timer = setTimeout(async () => {
        this.currentScenarioIndex = i;
        const triggerTime = scenario.startTime + 3;
        console.log(`\n[${triggerTime}s] 🎬 Triggering: ${scenario.scenario}`);
        console.log(`   Timeline: ${scenario.startTime}-${scenario.endTime}s`);
        
        try {
          await triggerCallback(scenario.scenario, i);
        } catch (error) {
          console.error(`Error triggering ${scenario.scenario}:`, error.message);
        }
      }, delay);
      
      this.timers.push(timer);
    }

    // Auto-stop after all scenarios complete
    const totalDuration = this.scenarioTimeline[this.scenarioTimeline.length - 1].endTime;
    const stopTimer = setTimeout(() => {
      this.stopContinuousDemo();
    }, totalDuration * 1000 + 2000); // +2s buffer
    
    this.timers.push(stopTimer);

    return true;
  }

  /**
   * Stop continuous demo mode
   */
  stopContinuousDemo() {
    if (!this.isRunning) {
      return false;
    }

    console.log('\n' + '='.repeat(60));
    console.log('🛑 STOPPING CONTINUOUS DEMO MODE');
    console.log('='.repeat(60));
    
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`Total runtime: ${elapsed}s`);
    console.log(`Scenarios triggered: ${this.currentScenarioIndex + 1}/${this.scenarioTimeline.length}`);
    console.log('='.repeat(60) + '\n');

    this.clearTimers();
    this.isRunning = false;
    this.currentScenarioIndex = 0;
    this.startTime = null;

    return true;
  }

  /**
   * Clear all scheduled timers
   */
  clearTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  /**
   * Get current scenario info
   */
  getCurrentScenario() {
    if (!this.isRunning || this.currentScenarioIndex >= this.scenarioTimeline.length) {
      return null;
    }
    return this.scenarioTimeline[this.currentScenarioIndex];
  }

  /**
   * Get demo status
   */
  getStatus() {
    if (!this.isRunning) {
      return {
        running: false,
        message: 'Continuous demo not active'
      };
    }

    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const currentScenario = this.getCurrentScenario();
    const totalDuration = this.scenarioTimeline[this.scenarioTimeline.length - 1].endTime;

    return {
      running: true,
      elapsed: parseFloat(elapsed),
      totalDuration: totalDuration,
      currentScenario: currentScenario?.scenario,
      scenarioIndex: this.currentScenarioIndex,
      totalScenarios: this.scenarioTimeline.length,
      timeline: this.scenarioTimeline
    };
  }

  /**
   * Get scenario at specific timestamp
   */
  getScenarioAtTime(seconds) {
    return this.scenarioTimeline.find(s => 
      seconds >= s.startTime && seconds < s.endTime
    );
  }
}

module.exports = ContinuousDemoService;
