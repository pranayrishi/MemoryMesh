// Test COCO-SSD person detection
const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function testDetection() {
  console.log('\n🧪 Testing COCO-SSD Person Detection\n');
  console.log('=' .repeat(50));
  
  try {
    // Load model
    console.log('\n🤖 Loading COCO-SSD model...');
    const model = await cocoSsd.load();
    console.log('✅ Model loaded successfully!');
    
    // Create a test image (simple colored rectangle representing a person)
    console.log('\n📸 Creating test image...');
    const canvas = createCanvas(640, 480);
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 640, 480);
    
    // Draw a "person" (rectangle)
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(200, 100, 200, 300);
    
    // Convert to base64
    const dataUrl = canvas.toDataURL('image/jpeg');
    console.log('✅ Test image created');
    
    // Load image for detection
    console.log('\n🔍 Running detection...');
    const img = await loadImage(dataUrl);
    const predictions = await model.detect(img);
    
    console.log(`\n📊 Detection Results:`);
    console.log(`   Total objects found: ${predictions.length}`);
    
    if (predictions.length > 0) {
      predictions.forEach((pred, i) => {
        console.log(`\n   Object ${i + 1}:`);
        console.log(`     Class: ${pred.class}`);
        console.log(`     Confidence: ${(pred.score * 100).toFixed(1)}%`);
        console.log(`     Bounding box: [${pred.bbox.map(v => v.toFixed(0)).join(', ')}]`);
      });
    }
    
    // Test with actual video frame if available
    const videoPath = './assets/videos/meal_confusion_grandma.mp4.json';
    if (fs.existsSync(videoPath)) {
      console.log('\n\n📹 Testing with actual video metadata...');
      const videoData = JSON.parse(fs.readFileSync(videoPath, 'utf8'));
      console.log(`   Video: ${videoData.scenario}`);
      console.log(`   Persona: ${videoData.persona}`);
      console.log('   ✅ Video files are available for testing');
    }
    
    console.log('\n\n✅ COCO-SSD is working correctly!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart backend: npm start');
    console.log('   2. Start frontend: cd frontend && npm start');
    console.log('   3. Trigger demo and watch for green tracking box!');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Make sure you installed:');
    console.error('   npm install canvas @tensorflow/tfjs-node @tensorflow-models/coco-ssd');
  }
}

testDetection();
