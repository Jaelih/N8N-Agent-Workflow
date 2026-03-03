#!/bin/bash

echo "🧹 Stopping and cleaning PLDT Voice AI services..."
echo ""

# Stop all services
docker compose down

# Remove volumes (optional - will delete data)
read -p "Do you want to remove all data volumes? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose down -v
    echo "✅ Volumes removed"
fi

# Clean up generated audio files
if [ -d "backend" ]; then
    rm -f backend/response_*.mp3
    rm -f backend/temp_*.wav
    rm -f backend/*.db
    echo "✅ Cleaned up temporary files"
fi

echo ""
echo "🎉 Cleanup complete!"
echo ""
echo "To start again: ./start.sh"
