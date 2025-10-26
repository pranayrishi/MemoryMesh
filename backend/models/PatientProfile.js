class PatientProfile {
  constructor(data) {
    this.id = data.id || 'patient-001';
    this.preferredName = data.preferredName || 'Margaret';
    this.fullName = data.fullName || 'Margaret Johnson';
    this.age = data.age || 78;
    this.cognitiveStage = data.cognitiveStage || 'moderate';

    // Family and relationships
    this.family = data.family || {
      spouse: { name: 'Robert', status: 'deceased', relationship: 'husband' },
      children: [
        { name: 'Sarah', relationship: 'daughter', phone: '555-0123' },
        { name: 'Michael', relationship: 'son', phone: '555-0124' }
      ],
      grandchildren: [
        { name: 'Emma', age: 12, interests: ['soccer', 'art'] },
        { name: 'Lucas', age: 9, interests: ['soccer', 'video games'] }
      ]
    };

    // Important memories and life history
    this.memories = data.memories || {
      career: 'Elementary school teacher for 35 years',
      significantEvents: [
        { event: 'Hawaii anniversary trip with Robert', year: 1995, photos: ['hawaii-1.jpg', 'hawaii-2.jpg'] },
        { event: 'Teaching award ceremony', year: 1998, photos: ['teaching-award.jpg'] },
        { event: 'Emma\'s birth', year: 2013, photos: ['emma-baby.jpg'] }
      ],
      favoriteActivities: ['bird watching', 'gardening', 'reading', 'looking at family photos']
    };

    // Preferences and triggers
    this.preferences = data.preferences || {
      music: {
        favoriteArtists: ['Frank Sinatra', 'Ella Fitzgerald', 'Nat King Cole'],
        favoriteGenre: 'Jazz and Big Band',
        calmingSongs: ['Fly Me to the Moon', 'The Way You Look Tonight']
      },
      foods: {
        favorites: ['chicken soup', 'apple pie', 'tea with honey'],
        dislikes: ['spicy food', 'mushrooms'],
        allergies: []
      },
      activities: {
        morning: 'coffee and bird watching',
        afternoon: 'light gardening or photo albums',
        evening: 'music and reminiscing'
      },
      communication: {
        responseStyle: 'warm and gentle',
        effectiveTechniques: ['reminiscence therapy', 'validation', 'distraction with photos'],
        triggersToAvoid: ['mentioning deceased loved ones directly', 'correcting factual errors']
      }
    };

    // Daily routine
    this.routine = data.routine || {
      wakeTime: '7:00 AM',
      breakfast: '7:30 AM',
      morningActivity: '9:00 AM',
      lunch: '12:00 PM',
      afternoonRest: '2:00 PM',
      afternoonActivity: '3:30 PM',
      dinner: '6:00 PM',
      eveningActivity: '7:00 PM',
      bedtime: '9:00 PM'
    };

    // Medical information
    this.medical = data.medical || {
      medications: [
        { name: 'Donepezil', dosage: '10mg', schedule: ['8:00 AM'] },
        { name: 'Memantine', dosage: '10mg', schedule: ['8:00 AM', '8:00 PM'] }
      ],
      conditions: ['Alzheimer\'s Disease (moderate stage)', 'Hypertension'],
      emergencyContacts: [
        { name: 'Sarah Johnson', relationship: 'daughter', phone: '555-0123', priority: 1 },
        { name: 'Michael Johnson', relationship: 'son', phone: '555-0124', priority: 2 },
        { name: 'Dr. Smith', relationship: 'primary care', phone: '555-0199', priority: 3 }
      ]
    };

    // Behavioral patterns (learned over time)
    this.patterns = data.patterns || {
      confusionWindows: [
        { timeRange: '2:00 PM - 3:30 PM', trigger: 'post-lunch confusion about meals', frequency: 'daily' }
      ],
      successfulInterventions: [],
      triggerEvents: []
    };

    // Current state
    this.currentState = {
      lastMealTime: null,
      lastMealType: null,
      lastMedicationTime: null,
      currentActivity: null,
      emotionalState: 'calm',
      lastInterventionTime: null,
      todaysActivities: []
    };
  }

  // Update current state
  updateState(updates) {
    this.currentState = { ...this.currentState, ...updates };
  }

  // Add activity to today's log
  logActivity(activity) {
    this.currentState.todaysActivities.push({
      timestamp: new Date().toISOString(),
      ...activity
    });
  }

  // Record successful intervention
  recordSuccessfulIntervention(intervention) {
    this.patterns.successfulInterventions.push({
      timestamp: new Date().toISOString(),
      situation: intervention.situation,
      technique: intervention.technique,
      effectiveness: intervention.effectiveness
    });
  }

  // Get context for AI
  getContextForAI() {
    return {
      preferredName: this.preferredName,
      family: this.family,
      memories: this.memories,
      preferences: this.preferences,
      routine: this.routine,
      currentState: this.currentState,
      recentActivities: this.currentState.todaysActivities.slice(-10)
    };
  }

  // Get emergency information
  getEmergencyInfo() {
    return {
      fullName: this.fullName,
      age: this.age,
      medications: this.medical.medications,
      conditions: this.medical.conditions,
      emergencyContacts: this.medical.emergencyContacts
    };
  }
}

module.exports = PatientProfile;
