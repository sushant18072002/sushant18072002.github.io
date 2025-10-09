#!/bin/bash

echo "========================================="
echo "Travel AI Deployment from GitHub"
echo "========================================="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Git
sudo apt install -y git

# Clone repository
cd /tmp
git clone https://github.com/sushant18072002/sushant18072002.github.io.git travel-app
cd travel-app

echo "Step 1: Setting up MongoDB..."
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database
mongosh --eval "
use travelai;
db.createUser({
  user: 'travelai_user',
  pwd: 'secure_password_123',
  roles: [{ role: 'readWrite', db: 'travelai' }]
});
"

echo "Step 2: Setting up Backend..."
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Setup backend
sudo mkdir -p /var/www/travelai
sudo cp -r backend /var/www/travelai/
sudo chown -R $USER:$USER /var/www/travelai

cd /var/www/travelai/backend
npm install --production

# Create production .env
cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://travelai_user:secure_password_123@localhost:27017/travelai
JWT_SECRET=prod-jwt-secret-$(date +%s)
CORS_ORIGIN=http://34.228.143.158
UPLOAD_PATH=./uploads
EOF

mkdir -p uploads

# Start backend
pm2 start server.js --name "travelai-backend"
pm2 startup
pm2 save

echo "Step 3: Setting up Frontend..."
# Build frontend
cd /tmp/travel-app/react-frontend
npm install
npm run build

# Install Nginx
sudo apt install -y nginx

# Setup frontend
sudo mkdir -p /var/www/travelai/frontend
sudo cp -r dist/* /var/www/travelai/frontend/
sudo chown -R www-data:www-data /var/www/travelai/frontend

# Configure Nginx
sudo tee /etc/nginx/sites-available/travelai << EOF
server {
    listen 80;
    server_name 34.228.143.158;

    location / {
        root /var/www/travelai/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads {
        alias /var/www/travelai/backend/uploads;
        expires 1y;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/travelai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "========================================="
echo "Deployment Completed Successfully!"
echo "========================================="
echo "Website: http://34.228.143.158"
echo "API: http://34.228.143.158/api"
echo "Database: MongoDB running on localhost"
echo "========================================="