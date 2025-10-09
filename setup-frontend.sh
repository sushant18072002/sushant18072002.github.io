#!/bin/bash

echo "========================================="
echo "Frontend Setup with Nginx"
echo "========================================="

# Install Nginx
sudo apt install -y nginx

# Create frontend directory
sudo mkdir -p /var/www/travelai/frontend
sudo cp -r /tmp/frontend-build/* /var/www/travelai/frontend/
sudo chown -R www-data:www-data /var/www/travelai/frontend

# Configure Nginx
sudo tee /etc/nginx/sites-available/travelai << EOF
server {
    listen 80;
    server_name 34.228.143.158;

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

    # Static uploads
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

# Test and restart Nginx
sudo nginx -t && sudo systemctl restart nginx

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "Frontend setup completed!"
echo "Website: http://34.228.143.158"