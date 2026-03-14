#!/bin/bash
set -e

echo "=== Installing Python dependencies ==="
pip install -r backend/requirements.txt

echo "=== Installing Node dependencies ==="
cd frontend
npm install

echo "=== Building Next.js static export ==="
npm run build

echo "=== Build complete ==="
