#!/bin/bash

echo "========================================="
echo "Backend Setup for Production"
echo "========================================="

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create backend directory
sudo mkdir -p /var/www/travelai/backend
sudo cp -r /tmp/backend-build/* /var/www/travelai/backend/
sudo chown -R $USER:$USER /var/www/travelai

# Install dependencies
cd /var/www/travelai/backend
npm install --production

# Create production environment
cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://travelai_user:secure_password_123@localhost:27017/travelai
JWT_SECRET=prod-jwt-secret-change-this-$(date +%s)
CORS_ORIGIN=http://34.228.143.158
UPLOAD_PATH=./uploads
EOF

# Create uploads directory
mkdir -p uploads

# Start backend with PM2
pm2 start server.js --name "travelai-backend"
pm2 startup
pm2 save

# Test API
sleep 5
curl -f http://localhost:3000/api/health && echo "✅ Backend API is running" || echo "❌ Backend API failed"

echo "Backend setup completed!"
echo "API URL: http://34.228.143.158:3000/api"