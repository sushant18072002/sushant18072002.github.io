@echo off
echo ========================================
echo Update from GitHub (Fixed)
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Pulling latest code from GitHub...'
cd /tmp/travel-app
git pull origin main

echo 'Updating backend...'
cp -r backend/* /var/www/travelai/backend/
cd /var/www/travelai/backend
npm install
pm2 restart travelai-backend

echo 'Building and updating frontend...'
cd /tmp/travel-app/react-frontend
npm install
npm run build
cp -r dist/* /var/www/travelai/frontend/

echo 'Testing...'
sleep 3
curl http://localhost:3000/api/health

echo 'Update completed!'
"

pause