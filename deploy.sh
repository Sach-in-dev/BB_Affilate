#!/bin/bash
set -e

IP="64.227.163.108"
PROJECT_DIR="/opt/bb-affiliate"

echo "Deploying to $IP..."

# Sync files (excluding unnecessary ones)
echo "Syncing files using rsync..."
rsync -avz -e "ssh -o StrictHostKeyChecking=accept-new" --exclude 'node_modules' --exclude '.git' --exclude 'frontend/dist' ./ root@$IP:$PROJECT_DIR/

# Execute remote commands
echo "Executing remote deployment commands..."
ssh -o StrictHostKeyChecking=accept-new root@$IP << 'EOF'
set -e

# Deploy the app
cd /opt/bb-affiliate

echo "Building and starting Docker containers with new changes..."
docker compose -f docker-compose.prod.yml up -d --build
EOF

echo "Deployment completed successfully! The app should be live at https://beta.26ritual.com"
