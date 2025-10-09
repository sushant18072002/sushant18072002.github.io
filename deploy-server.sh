#!/bin/bash

echo "========================================="
echo "Travel AI Platform Server Setup"
echo "========================================="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Create application directories
sudo mkdir -p /var/www/travelai
sudo mkdir -p /var/www/travelai/frontend
sudo mkdir -p /var/www/travelai/backend

# Copy files
sudo cp -r /tmp/frontend-build/* /var/www/travelai/frontend/
sudo cp -r /tmp/backend-build/* /var/www/travelai/backend/

# Set permissions
sudo chown -R $USER:$USER /var/www/travelai
sudo chmod -R 755 /var/www/travelai

# Install backend dependencies
cd /var/www/travelai/backend
npm install --production

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/travelai
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://your-domain.com
EOF

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Start backend with PM2
pm2 start server.js --name "travelai-backend"
pm2 startup
pm2 save

# Configure Nginx
sudo tee /etc/nginx/sites-available/travelai << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/travelai/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location /uploads {
        alias /var/www/travelai/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
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
echo "Deployment completed successfully!"
echo "========================================="
echo "Frontend: http://your-domain.com"
echo "Backend API: http://your-domain.com/api"
echo "MongoDB: Running on localhost:27017"
echo ""
echo "Next steps:"
echo "1. Update your domain in Nginx config"
echo "2. Setup SSL certificate with Let's Encrypt"
echo "3. Update environment variables"
echo "========================================="