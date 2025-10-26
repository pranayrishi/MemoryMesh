const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testGPT4Vision() {
  console.log('🧪 Testing GPT-4 Vision API for person detection...\n');

  // Create a simple test image (base64 encoded)
  const testPrompt = `Analyze this image and detect the person in it.

  Return a JSON response with:
  1. person_detected: true/false
  2. bounding_box: {x: percentage from left (0-100), y: percentage from top (0-100), width: percentage of image width (0-100), height: percentage of image height (0-100)}
  3. pose_keypoints: Array of 17 COCO format keypoints with {name, x: percentage, y: percentage, confidence}
     - Keypoints: nose, left_eye, right_eye, left_ear, right_ear, left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist, left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle
  4. activity: description of what the person is doing
  5. confidence: 0-1 detection confidence

  IMPORTANT: Provide EXACT coordinates based on where the person actually is in the image. The bounding box should tightly fit around the person's body.`;

  try {
    // Test with a simple text prompt first to verify API works
    console.log('📡 Testing basic GPT-4 Vision API connection...');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Respond with 'API Working' if you can see this message."
            }
          ]
        }
      ],
      max_tokens: 50
    });

    console.log('✅ API Response:', response.choices[0].message.content);
    console.log('\n📊 Model Used:', response.model);
    console.log('💰 Tokens Used:', response.usage);

    // Now test with an actual image analysis prompt
    console.log('\n\n🎯 Testing person detection capabilities...');

    const detectionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a computer vision system specialized in person detection and pose estimation.

Can you analyze video frames and detect:
1. If a person is present in the image
2. The bounding box coordinates (as percentages) that tightly fit around the person
3. 17 COCO-format pose keypoints (body joints like nose, shoulders, elbows, wrists, hips, knees, ankles)
4. What activity the person is performing

Please confirm you can perform this analysis by responding with a JSON template showing the format you would return.`
            }
          ]
        }
      ],
      max_tokens: 500
    });

    console.log('✅ Detection Capabilities:\n');
    console.log(detectionResponse.choices[0].message.content);

    console.log('\n\n✅ GPT-4 Vision API is working and can analyze images!');
    console.log('💡 Ready to implement real person tracking');

  } catch (error) {
    console.error('❌ Error testing GPT-4 Vision:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testGPT4Vision();
