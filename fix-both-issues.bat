@echo off
echo ========================================
echo Fix Port Conflict and Nginx
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Killing all Node processes on port 3000...'
sudo pkill -f 'node.*server.js' || echo 'No processes found'
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || echo 'Port 3000 cleared'

echo 'Stopping PM2 processes...'
pm2 delete all 2>/dev/null || echo 'No PM2 processes'

echo 'Restarting Nginx with new config...'
sudo systemctl restart nginx

echo 'Starting backend fresh...'
cd /var/www/travelai/backend
pm2 start server.js --name 'travelai-backend'

echo 'Waiting for backend to start...'
sleep 5

echo 'Testing services...'
curl -s http://localhost:3000/health && echo 'Backend: OK' || echo 'Backend: FAILED'
curl -s -I http://localhost/ | head -1 && echo 'Frontend: OK' || echo 'Frontend: FAILED'

echo 'Checking Nginx config is active...'
sudo nginx -T 2>/dev/null | grep 'client_max_body_size 50M' && echo 'Upload limit: 50MB' || echo 'Upload limit: NOT SET'
"

pause