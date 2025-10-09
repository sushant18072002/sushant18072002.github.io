@echo off
echo ========================================
echo Step 2: Backend Deployment
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo Uploading backend files...
scp -i %PEM_FILE% -r backend %SERVER_USER%@%SERVER_IP%:/tmp/backend-build
scp -i %PEM_FILE% setup-backend.sh %SERVER_USER%@%SERVER_IP%:/tmp/

echo Setting up backend...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "chmod +x /tmp/setup-backend.sh && /tmp/setup-backend.sh"

echo Testing backend API...
timeout 10 curl http://%SERVER_IP%:3000/api/health || echo API not responding yet

echo Backend deployment completed!
pause