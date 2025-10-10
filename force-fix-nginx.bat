@echo off
echo ========================================
echo Force Fix Nginx Upload Limits
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Backing up current config...'
sudo cp /etc/nginx/sites-available/travelai /etc/nginx/sites-available/travelai.backup

echo 'Creating new Nginx config with 50MB limit...'
sudo tee /etc/nginx/sites-available/travelai > /dev/null << 'EOF'
server {
    listen 80;
    server_name 34.228.143.158;
    
    # Set upload limit to 50MB
    client_max_body_size 50M;
    
    location / {
        root /var/www/travelai/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

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
        
        # Set upload limit for API routes
        client_max_body_size 50M;
    }

    location /uploads {
        alias /var/www/travelai/backend/uploads;
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
}
EOF

echo 'Testing new config...'
sudo nginx -t

echo 'Reloading Nginx...'
sudo systemctl reload nginx

echo 'Checking if config is active...'
sudo nginx -T | grep client_max_body_size

echo 'Nginx upload limit fixed to 50MB!'
"

pause