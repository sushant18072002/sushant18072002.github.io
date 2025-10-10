@echo off
echo ========================================
echo Rebuild Frontend Completely
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Checking current frontend files...'
ls -la /var/www/travelai/frontend/assets/

echo 'Rebuilding frontend from source...'
cd /tmp/travel-app/react-frontend
rm -rf dist node_modules
npm install
npm run build

echo 'Checking new build...'
ls -la dist/
ls -la dist/assets/

echo 'Deploying new build...'
sudo rm -rf /var/www/travelai/frontend/*
sudo cp -r dist/* /var/www/travelai/frontend/
sudo chown -R www-data:www-data /var/www/travelai/frontend

echo 'Verifying deployment...'
ls -la /var/www/travelai/frontend/
ls -la /var/www/travelai/frontend/assets/

echo 'Testing website...'
curl -s -I http://localhost/assets/index-*.js | head -1 || echo 'JS file not found'
"

pause