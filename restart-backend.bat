@echo off
echo ========================================
echo Restart Backend Only
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
cd /var/www/travelai/backend
echo 'Current .env:'
cat .env
echo ''
echo 'Restarting backend...'
pm2 restart travelai-backend || pm2 start server.js --name 'travelai-backend'
sleep 3
echo 'Testing API...'
curl http://localhost:3000/api/health
"

pause