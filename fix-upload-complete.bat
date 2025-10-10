@echo off
echo ========================================
echo Complete Upload Fix
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo Pushing code changes...
git add .
git commit -m "Fix upload limits: increase to 50MB for multer and frontend"
git push origin main

echo Updating server configuration...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Pulling latest code...'
cd /tmp/travel-app
git pull origin main

echo 'Updating backend...'
cp -r backend/* /var/www/travelai/backend/
cd /var/www/travelai/backend
npm install --production

echo 'Updating Nginx configuration...'
sudo cp /etc/nginx/sites-available/travelai /etc/nginx/sites-available/travelai.backup
sudo tee /etc/nginx/sites-available/travelai << 'EOF'
server {
    listen 80;
    server_name 34.228.143.158;
    client_max_body_size 50M;

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
        client_max_body_size 50M;
    }

    location /uploads {
        alias /var/www/travelai/backend/uploads;
        expires 1y;
    }
}
EOF

echo 'Testing Nginx config...'
sudo nginx -t

echo 'Restarting services...'
pm2 restart travelai-backend
sudo systemctl reload nginx

echo 'Building and deploying frontend...'
cd /tmp/travel-app/react-frontend
npm run build
cp -r dist/* /var/www/travelai/frontend/

echo 'Upload fix completed!'
echo 'Backend: 50MB limit'
echo 'Nginx: 50MB limit'  
echo 'Multer: 50MB limit'
"

pause