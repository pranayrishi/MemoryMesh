/**
 * Demo Response Service
 * Provides immediate, realistic AI responses for demo scenarios
 * These are examples of what the real AI would generate
 */

class DemoResponseService {
  constructor(patientProfile) {
    this.patientProfile = patientProfile;
  }

  /**
   * Get immediate demo response for a scenario
   * These mirror what Claude AI would generate
   */
  getDemoResponse(scenarioType, context = {}) {
    const responses = {
      MEAL_CONFUSION: this.getMealConfusionResponse(context),
      meal_confusion: this.getMealConfusionResponse(context),

      STOVE_SAFETY: this.getStoveSafetyResponse(context),
      stove_safety: this.getStoveSafetyResponse(context),

      WANDERING: this.getWanderingResponse(context),
      wandering: this.getWanderingResponse(context),

      AGITATION: this.getAgitationResponse(context),
      agitation: this.getAgitationResponse(context)
    };

    return responses[scenarioType] || this.getDefaultResponse();
  }

  getMealConfusionResponse(context) {
    const name = this.patientProfile.preferredName;
    const grandchildren = this.patientProfile.family.grandchildren;
    const activities = this.patientProfile.memories.favoriteActivities;

    const messages = [
      `Hi ${name}, I see you're looking for something to eat. You know what? You just had a delicious ${context.lastMealType || 'chicken soup lunch'} ${context.timeSinceMeal || '30 minutes'} ago. I have the photo right here with the time stamp. How about we look at those beautiful photos of ${grandchildren[0].name}'s soccer game instead? She scored a goal last week!`,

      `${name}, it looks like you're checking the refrigerator. You had a wonderful ${context.lastMealType || 'lunch'} not too long ago - would you like to see the photo I took? And speaking of food, remember that apple pie you used to make? Let me show you some photos from when you won that baking contest. How about we listen to Frank Sinatra while we look at them?`,

      `Hello ${name}, are you feeling hungry? I want to show you something - here's a photo from your lunch just ${context.timeSinceMeal || 'half an hour'} ago. You enjoyed every bite! Now, the birds at the feeder are particularly active today. Would you like to watch them with me? We could put on some of your favorite jazz music too.`
    ];

    return {
      intervention_needed: true,
      intervention_type: 'AI_ONLY',
      urgency_score: 0.4,
      reasoning: `${name} appears confused about recent meals. This is common post-lunch confusion. Using timestamped evidence and gentle redirection to pleasant activities (family photos, bird watching) which have been effective in past interventions. No caregiver alert needed - AI can handle this warmly and effectively.`,
      voice_message: messages[Math.floor(Math.random() * messages.length)],
      actions: [
        'show meal evidence with timestamp',
        `show photos of ${grandchildren[0].name}`,
        'play calming background music',
        'redirect to bird watching'
      ],
      caregiver_notification: {
        needed: false,
        priority: 'low',
        message: `${name} was briefly confused about meals. AI showed meal evidence and successfully redirected to family photos. No action needed.`
      },
      learning_notes: `${name} responds well to visual evidence (timestamped meal photos) combined with redirection to grandchildren photos. Bird watching also effective during afternoon confusion window.`
    };
  }

  getStoveSafetyResponse(context) {
    const name = this.patientProfile.preferredName;
    const music = this.patientProfile.preferences.music.calmingSongs;

    const messages = [
      `Hi ${name}, I see you're at the stove. What would you like to cook today? Actually, you know what? The birds at the feeder are absolutely beautiful right now - cardinals and blue jays. How about we watch them together? I'll put on "${music[0]}" for you. The kitchen can wait.`,

      `${name}, I notice you're by the stove. Before we do any cooking, let me show you something wonderful - there are so many birds outside your window right now. And I thought we could listen to Frank Sinatra together. What do you say? The stove will be here later if you want to cook.`,

      `Hello ${name}! I see you at the stove. You know, it's such a lovely afternoon. How about we sit by the window and watch the garden instead? I'll play your favorite song, "${music[1]}", and we can look at photos of ${this.patientProfile.family.grandchildren[1].name}. Doesn't that sound nice?`
    ];

    return {
      intervention_needed: true,
      intervention_type: 'EMERGENCY',
      urgency_score: 0.92,
      reasoning: `CRITICAL SAFETY ISSUE: ${name} at stove with burner on and no cookware. Immediate intervention required. Using calm, non-alarming engagement to redirect away from danger. Smart home will turn off stove automatically. Caregiver must be notified immediately but AI is engaging patient simultaneously to prevent escalation.`,
      voice_message: messages[Math.floor(Math.random() * messages.length)],
      actions: [
        'IMMEDIATE: turn off stove via smart home',
        'speak calmly to patient (no alarm)',
        'redirect to bird watching',
        `play calming music: ${music[0]}`,
        'show nature/family photos',
        'monitor for compliance'
      ],
      caregiver_notification: {
        needed: true,
        priority: 'critical',
        message: `🚨 URGENT: ${name} activated stove with no cookware present. Stove has been turned off automatically. AI is engaging ${name} with calm redirection. Please check in when possible. No signs of distress - patient responding well to bird watching suggestion.`
      },
      learning_notes: `Critical safety intervention successful. ${name} responded to calm tone and bird watching redirection. Smart home integration prevented potential fire. This type of intervention should continue to use gentle approach rather than alarmist language.`
    };
  }

  getWanderingResponse(context) {
    const name = this.patientProfile.preferredName;
    const spouse = this.patientProfile.family.spouse.name;
    const memories = this.patientProfile.memories.significantEvents;
    const location = this.patientProfile.memories.significantEvents[0].location;

    const messages = [
      `${name}, I can see you're on the main road and you look confused. It's okay, I'm here to help you. This isn't the way home - let me guide you back. Do you remember your beautiful home where ${spouse} is waiting? Let's go back together. I'll show you photos of your home and ${spouse} to help you remember. You're safe with me.`,

      `Hi ${name}, you've wandered quite far from home onto this busy street. I know you're confused right now, but don't worry. Let's get you somewhere safe. Do you remember ${location}? Your home with ${spouse}? I have photos right here that will help you remember. Let's sit down away from the traffic and look at them together. Then we'll get you home safely.`,

      `${name}, I can see you're lost and scared on this main road. It's alright, I'm here now. This is a dangerous place with all these cars. Let's move to safety first. I have your family photos here - look, here's ${spouse} and your grandchildren. They're all waiting for you at home. Let me help you get back to them. You're going to be okay.`
    ];

    return {
      intervention_needed: true,
      intervention_type: 'EMERGENCY',
      urgency_score: 0.95,
      reasoning: `CRITICAL: ${name} has wandered onto a busy main road and is lost. Immediate safety risk from traffic. Using calm, reassuring approach to prevent panic while guiding ${name} to safety. Emergency notification to caregiver required. GPS location being tracked. Using family photos and memories to ground ${name} and facilitate safe return home.`,
      voice_message: messages[Math.floor(Math.random() * messages.length)],
      actions: [
        'immediately alert caregiver with GPS location',
        'contact emergency services if needed',
        'guide patient away from traffic to safe location',
        `show Hawaii trip photos with ${spouse}`,
        'use reminiscence therapy',
        'redirect to indoor comfortable seating',
        'play favorite music',
        'monitor door area'
      ],
      caregiver_notification: {
        needed: true,
        priority: 'critical',
        message: `🚨 EMERGENCY: ${name} has wandered onto a busy main road and is lost. GPS location: [coordinates]. AI is attempting to calm and redirect ${name} using family photos and memories. IMMEDIATE INTERVENTION REQUIRED. Contact emergency services if ${name} cannot be safely retrieved within 5 minutes. Patient appears confused and disoriented.`
      },
      learning_notes: `CRITICAL wandering episode - ${name} left home and became lost on main road. This represents severe safety risk. Recommend: 1) Install door alarms, 2) GPS tracking device, 3) Increased supervision during high-risk times, 4) Review medication for confusion, 5) Consider memory care facility evaluation. ${name} responded to family photos and ${spouse}'s name during retrieval.`
    };
  }

  getAgitationResponse(context) {
    const name = this.patientProfile.preferredName;
    const music = this.patientProfile.preferences.music;
    const grandchildren = this.patientProfile.family.grandchildren;

    const messages = [
      `${name}, come sit with me for a moment. Let's listen to "${music.calmingSongs[0]}" together - I know how much you love this song. And look, I have these beautiful new photos of ${grandchildren[0].name} and ${grandchildren[1].name}. They're growing up so wonderfully. ${grandchildren[0].name} just won her soccer game! Isn't she talented, just like her grandmother?`,

      `Hi ${name}, I can see something's bothering you. How about we take a moment together? I'll put on some Frank Sinatra - your favorite. And I want to show you these lovely photos of your grandchildren. ${grandchildren[1].name} has been doing so well in school. You must be so proud. Let's sit and enjoy the music and photos together.`,

      `${name}, let's make you more comfortable. I'm going to play "${music.calmingSongs[1]}" - doesn't that bring back such wonderful memories? And look at these sweet photos of ${grandchildren[0].name}. She has your smile, doesn't she? Let's relax together and enjoy some quiet time with the music and memories.`
    ];

    return {
      intervention_needed: true,
      intervention_type: 'NOTIFY',
      urgency_score: 0.68,
      reasoning: `${name} showing signs of emotional distress/agitation. Employing multi-sensory calming approach: favorite music (auditory comfort), family photos (visual/emotional connection), and soothing environment. Using validation therapy - not dismissing feelings but creating peaceful space. Caregiver should be aware but AI is actively de-escalating.`,
      voice_message: messages[Math.floor(Math.random() * messages.length)],
      actions: [
        `play calming music: ${music.calmingSongs[0]} by ${music.favoriteArtists[0]}`,
        `show photos of ${grandchildren[0].name} and ${grandchildren[1].name}`,
        'use gentle, soothing tone',
        'create comfortable seating arrangement',
        'dim lights for calming atmosphere',
        'validate emotions without questioning'
      ],
      caregiver_notification: {
        needed: true,
        priority: 'medium',
        message: `${name} experiencing agitation. AI has initiated calming protocol with ${music.favoriteArtists[0]} music and grandchildren photos. ${name}'s emotional state appears to be improving. Monitor for next 20-30 minutes. No immediate intervention required.`
      },
      learning_notes: `Agitation successfully addressed with combination of ${music.favoriteArtists[0]} music and grandchildren photos. ${name} responds particularly well to photos of ${grandchildren[0].name}. This multi-sensory approach should be first-line response for future agitation episodes.`
    };
  }

  getDefaultResponse() {
    const name = this.patientProfile.preferredName;

    return {
      intervention_needed: false,
      intervention_type: 'AI_ONLY',
      urgency_score: 0.1,
      reasoning: `${name} appears calm and content. No intervention needed at this time. Continuing routine monitoring.`,
      voice_message: null,
      actions: [],
      caregiver_notification: {
        needed: false,
        priority: 'low',
        message: 'All is well. Routine monitoring in progress.'
      },
      learning_notes: 'Normal activity observed. No patterns requiring attention.'
    };
  }
}

module.exports = DemoResponseService;
