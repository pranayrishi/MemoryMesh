const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGeminiModels() {
  console.log('🧪 Testing Gemini models with updated SDK...\n');

  // Models to test - focusing on vision-capable models
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro-vision',
    'gemini-2.0-flash-exp'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`📡 Testing model: ${modelName}...`);

      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        'Respond with "OK" if you can see this message.'
      ]);

      const response = await result.response;
      const text = response.text();

      console.log(`✅ ${modelName}: WORKS`);
      console.log(`   Response: ${text}\n`);

    } catch (error) {
      console.log(`❌ ${modelName}: FAILED`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  console.log('\n🎯 Now testing vision capabilities...\n');

  // Test vision with a working model
  const visionModels = ['gemini-1.5-flash', 'gemini-1.5-pro'];

  for (const modelName of visionModels) {
    try {
      console.log(`🖼️  Testing vision with ${modelName}...`);

      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are a computer vision system. Can you analyze images to detect:
1. People in the image
2. Bounding box coordinates (as percentages 0-100)
3. Body pose keypoints (17 COCO format joints)

Please confirm by responding with YES or NO and explain briefly what you can detect.`;

      const result = await model.generateContent([prompt]);
      const response = await result.response;
      const text = response.text();

      console.log(`✅ Vision Response:\n${text}\n`);

    } catch (error) {
      console.log(`❌ Vision test failed: ${error.message}\n`);
    }
  }
}

testGeminiModels();
