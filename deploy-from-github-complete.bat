@echo off
echo ========================================
echo Complete GitHub Deployment
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo '1. Pulling latest code from GitHub...'
cd /tmp/travel-app
git pull origin main

echo '2. Stopping backend...'
pm2 stop travelai-backend 2>/dev/null || echo 'Backend not running'

echo '3. Updating backend files...'
cp -r backend/* /var/www/travelai/backend/
cd /var/www/travelai/backend
npm install --production

echo '4. Starting backend...'
pm2 start server.js --name 'travelai-backend' 2>/dev/null || pm2 restart travelai-backend

echo '5. Building frontend...'
cd /tmp/travel-app/react-frontend
npm install
npm run build

echo '6. Deploying frontend...'
cp -r dist/* /var/www/travelai/frontend/

echo '7. Restarting Nginx...'
sudo systemctl reload nginx 2>/dev/null || echo 'Nginx reload skipped'

echo '8. Testing deployment...'
sleep 5
echo 'API Test:'
curl -s http://localhost:3000/api/health || echo 'API not responding'
echo 'Website Test:'
curl -s -I http://localhost/ | head -1 || echo 'Website not responding'

echo ''
echo '========================================='
echo 'Deployment Complete!'
echo 'Website: http://34.228.143.158'
echo 'API: http://34.228.143.158/api'
echo '========================================='
"

pause