#!/bin/bash

# MemoryMesh Video Setup Script
# Generates AI videos for demo scenarios using Sora-2

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        MemoryMesh Video Generation Setup                 ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "   Please install Python 3.8 or higher"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed"
    echo "   Please install pip3"
    exit 1
fi

echo "✅ pip3 found"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
echo ""
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed"
echo ""

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY environment variable not set"
    echo ""
    echo "Please set your OpenAI API key:"
    echo "  export OPENAI_API_KEY='your-api-key-here'"
    echo ""
    echo "Or add it to your .env file"
    echo ""
    exit 1
fi

echo "✅ OpenAI API key found"
echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p assets/videos
mkdir -p video/prompts
mkdir -p cv/models
echo "✅ Directories created"
echo ""

# Generate videos
echo "🎬 Starting video generation..."
echo ""
echo "This will generate 8 videos (4 scenarios × 2 personas)"
echo "Each video is 24 seconds at 1080p"
echo "Estimated time: 30-60 minutes"
echo "Estimated cost: $40-80 (one-time)"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled"
    exit 0
fi

echo ""
python3 video/generate_persona_videos.py

if [ $? -eq 0 ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              ✅ Video Generation Complete!                ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "Videos saved to: assets/videos/"
    echo ""
    echo "Next steps:"
    echo "  1. Start the backend: npm run server"
    echo "  2. Start the frontend: npm run client"
    echo "  3. Trigger demo scenarios from the dashboard"
    echo ""
else
    echo ""
    echo "❌ Video generation failed"
    echo "   Check the error messages above"
    echo ""
    exit 1
fi
