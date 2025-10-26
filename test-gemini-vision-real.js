const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testVisionAnalysis() {
  console.log('🧪 Testing Gemini 2.0 Flash Exp with image analysis...\n');

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Test 1: Can it describe what vision capabilities it has?
    console.log('📋 Test 1: Checking vision capabilities...\n');

    const capabilitiesPrompt = `You are a computer vision AI. Can you:
1. Analyze images that I send you?
2. Detect people in images?
3. Identify body parts and pose (head, arms, legs positions)?
4. Provide bounding box coordinates for detected people?

Please answer YES or NO for each capability and explain what you can do.`;

    const result1 = await model.generateContent([capabilitiesPrompt]);
    const response1 = await result1.response;
    console.log('Response:\n', response1.text());

    // Test 2: Ask it to provide a sample detection response format
    console.log('\n\n📋 Test 2: Getting expected JSON format...\n');

    const formatPrompt = `When I send you a video frame image, I need you to analyze it and return a JSON response with:

{
  "person_detected": true/false,
  "bounding_box": {
    "x": percentage from left (0-100),
    "y": percentage from top (0-100),
    "width": percentage of image width (0-100),
    "height": percentage of image height (0-100)
  },
  "pose_keypoints": [
    {name: "nose", x: percentage, y: percentage, confidence: 0-1},
    {name: "left_shoulder", x: percentage, y: percentage, confidence: 0-1},
    ... (17 total COCO keypoints)
  ],
  "activity": "description of what person is doing",
  "confidence": 0-1
}

Can you confirm you understand this format and will be able to analyze images I send? Respond with the JSON template showing all 17 COCO keypoints.`;

    const result2 = await model.generateContent([formatPrompt]);
    const response2 = await result2.response;
    console.log('Response:\n', response2.text());

    console.log('\n\n✅ Gemini 2.0 Flash Exp is ready for image analysis!');
    console.log('📸 Next step: Test with actual video frame images');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

testVisionAnalysis();
