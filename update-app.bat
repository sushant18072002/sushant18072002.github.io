@echo off
echo ========================================
echo Travel AI App Update Script
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo.
echo 1. Building Frontend...
cd react-frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo 2. Uploading files...
scp -i %PEM_FILE% -r react-frontend\dist\* %SERVER_USER%@%SERVER_IP%:/var/www/travelai/frontend/
scp -i %PEM_FILE% -r backend\src %SERVER_USER%@%SERVER_IP%:/var/www/travelai/backend/
scp -i %PEM_FILE% backend\server.js %SERVER_USER%@%SERVER_IP%:/var/www/travelai/backend/
scp -i %PEM_FILE% backend\package.json %SERVER_USER%@%SERVER_IP%:/var/www/travelai/backend/

echo.
echo 3. Restarting services...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "cd /var/www/travelai/backend && npm install --production && pm2 restart travelai-backend"

echo.
echo Update completed!
pause