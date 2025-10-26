// Quick test script to verify video tracking setup
require('dotenv').config({ path: require('path').join(__dirname, 'backend/.env') });

console.log('\n🧪 Testing Video Tracking Configuration\n');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set (' + process.env.GEMINI_API_KEY.substring(0, 20) + '...)' : '❌ Not set');
console.log('  FETCHAI_API_KEY:', process.env.FETCHAI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('  ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set');

// Test Gemini API
console.log('\n🔍 Testing Gemini API Connection...');

const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in backend/.env');
  console.log('\n💡 Add it with:');
  console.log('   echo "GEMINI_API_KEY=your_key_here" >> backend/.env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

async function testGemini() {
  try {
    console.log('  Sending test request to Gemini...');
    const result = await model.generateContent('Say "Hello from MemoryMesh!" in JSON format: {"message": "..."}');
    const response = await result.response;
    const text = response.text();
    console.log('  ✅ Gemini API is working!');
    console.log('  Response:', text.substring(0, 100));
    
    console.log('\n✅ All systems ready for video tracking!');
    console.log('\n📝 Next steps:');
    console.log('  1. Restart backend: npm start');
    console.log('  2. Start frontend: cd frontend && npm start');
    console.log('  3. Trigger a demo scenario');
    console.log('  4. Watch for green tracking box on video!');
    
  } catch (error) {
    console.error('  ❌ Gemini API Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  - Check if API key is valid');
    console.log('  - Verify API key has Gemini API enabled');
    console.log('  - Check internet connection');
  }
}

testGemini();
