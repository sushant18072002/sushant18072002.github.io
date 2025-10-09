@echo off
echo ========================================
echo Travel AI Platform Deployment Script
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
echo 2. Connecting to server and deploying...
scp -i %PEM_FILE% -r react-frontend\dist %SERVER_USER%@%SERVER_IP%:/tmp/frontend-build
scp -i %PEM_FILE% -r backend %SERVER_USER%@%SERVER_IP%:/tmp/backend-build
scp -i %PEM_FILE% deploy-server.sh %SERVER_USER%@%SERVER_IP%:/tmp/

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "chmod +x /tmp/deploy-server.sh && /tmp/deploy-server.sh"

echo.
echo Deployment completed!
pause