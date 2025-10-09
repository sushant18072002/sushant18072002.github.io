@echo off
echo ========================================
echo Fix Upload Size Limits
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Updating backend upload limits...'
cd /var/www/travelai/backend

# Update server.js to increase limits
sed -i 's/app.use(express.json());/app.use(express.json({ limit: \"50mb\" }));/' server.js
sed -i 's/app.use(express.urlencoded({ extended: true }));/app.use(express.urlencoded({ extended: true, limit: \"50mb\" }));/' server.js

echo 'Updating Nginx upload limits...'
sudo tee -a /etc/nginx/sites-available/travelai << 'EOF'

# Add to server block
client_max_body_size 50M;
EOF

echo 'Restarting services...'
pm2 restart travelai-backend
sudo systemctl reload nginx

echo 'Upload limits increased to 50MB'
"

pause