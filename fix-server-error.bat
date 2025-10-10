@echo off
echo ========================================
echo Fix Server 500 Error
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Checking backend logs...'
pm2 logs travelai-backend --lines 20

echo ''
echo 'Checking Nginx error logs...'
sudo tail -20 /var/log/nginx/error.log

echo ''
echo 'Testing backend directly...'
curl -s http://localhost:3000/health || echo 'Backend not responding'

echo ''
echo 'Checking if frontend files exist...'
ls -la /var/www/travelai/frontend/

echo ''
echo 'Restarting backend...'
pm2 restart travelai-backend

echo ''
echo 'Testing again...'
sleep 3
curl -s http://localhost:3000/health && echo 'Backend OK' || echo 'Backend still down'
"

pause