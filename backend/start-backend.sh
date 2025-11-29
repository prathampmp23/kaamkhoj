#!/bin/bash
# Start backend server with FFmpeg in PATH

echo "Starting KaamKhoj Backend Server..."
echo "Adding FFmpeg to PATH..."

export PATH="$PATH:/c/Program Files/ffmpeg/bin"

echo ""
echo "Starting nodemon..."
nodemon ./app.js
