@echo off
echo ========================================
echo Debug Upload Limits
echo ========================================

echo '=== Current Nginx Config ==='
cat /etc/nginx/sites-available/travelai

echo ''
echo '=== Nginx Test ==='
sudo nginx -t

echo ''
echo '=== Backend Upload Route ==='
grep -A 10 'fileSize:' /var/www/travelai/backend/src/routes/upload.routes.js

echo ''
echo '=== Backend Server Limits ==='
grep 'limit:' /var/www/travelai/backend/server.js

echo ''
echo '=== Nginx Status ==='
sudo systemctl status nginx --no-pager -l

echo ''
echo '=== Backend Status ==='
pm2 status
"

pause