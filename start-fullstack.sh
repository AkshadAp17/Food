#!/bin/bash

# Start the Express backend on port 5000
echo "Starting Express backend on port 5000..."
NODE_ENV=development tsx server/index.ts &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Next.js frontend on port 3000
echo "Starting Next.js frontend on port 3000..."
npx next dev --port 3000 &
FRONTEND_PID=$!

# Function to cleanup processes
cleanup() {
    echo "Cleaning up processes..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Trap cleanup function on script exit
trap cleanup SIGINT SIGTERM

echo "FoodieExpress is now running:"
echo "- Backend: http://localhost:5000"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID