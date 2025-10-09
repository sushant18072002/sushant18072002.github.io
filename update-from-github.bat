@echo off
echo ========================================
echo Update from GitHub
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo Updating application from GitHub...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
cd /tmp/travel-app && git pull origin main
sudo cp -r backend/* /var/www/travelai/backend/
cd /var/www/travelai/backend && npm install --production
pm2 restart travelai-backend

cd /tmp/travel-app/react-frontend && npm run build
sudo cp -r dist/* /var/www/travelai/frontend/
sudo systemctl reload nginx
"

echo Update completed!
pause