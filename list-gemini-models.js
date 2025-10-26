// List available Gemini models
require('dotenv').config({ path: require('path').join(__dirname, 'backend/.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log('📋 Fetching available Gemini models...\n');
    
    // Try different model names
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro-vision'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Test');
        console.log(`✅ ${modelName} - WORKS!`);
      } catch (error) {
        console.log(`❌ ${modelName} - ${error.message.split('\n')[0]}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
