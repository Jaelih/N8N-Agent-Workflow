#!/bin/bash

echo "🚀 Starting PLDT Voice AI Chatbot System..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your API keys before continuing."
    echo ""
    read -p "Press Enter after you've configured .env to continue..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "🐳 Starting Docker services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "✅ All services started!"
echo ""
echo "🌐 Access points:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - N8N: http://localhost:6789"
echo ""
echo "📝 Next steps:"
echo "   1. Configure N8N workflows at http://localhost:6789"
echo "   2. Import 'My workflow.json' in N8N"
echo "   3. Update webhook URLs in .env"
echo "   4. Restart backend: docker compose restart backend"
echo ""
echo "🎤 Try the chatbot at http://localhost:3000"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
