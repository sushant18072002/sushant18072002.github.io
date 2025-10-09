#!/bin/bash

echo "=== Creating .env file ==="
cd /var/www/travelai/backend

cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/travelai
JWT_SECRET=prod-jwt-secret-12345
CORS_ORIGIN=http://34.228.143.158
UPLOAD_PATH=./uploads
EOF

echo ".env file created!"
cat .env

echo ""
echo "=== Installing Node.js ==="
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ""
echo "=== Installing dependencies ==="
npm install

echo ""
echo "=== Installing PM2 ==="
sudo npm install -g pm2

echo ""
echo "=== Starting backend ==="
pm2 start server.js --name "travelai-backend"

echo ""
echo "=== Testing API ==="
sleep 3
curl http://localhost:3000/api/health