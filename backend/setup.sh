#!/bin/bash

echo "🚀 Starting Dream WeChat Backend Setup..."

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
else
    echo "✅ .env file already exists"
fi

echo "📦 Installing dependencies..."
npm install

echo "🐳 Building Docker containers..."
docker compose build

echo "🎯 All services ready to start!"
echo ""
echo "To start the application:"
echo "  docker compose up -d"
echo ""
echo "To run database seeds:"
echo "  npm run seed"
echo ""
echo "API Documentation will be available at:"
echo "  http://localhost:3000/api/docs"
