@echo off
echo ========================================
echo Step 3: Frontend Deployment
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo Building frontend for production...
cd react-frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)
cd ..

echo Uploading frontend files...
scp -i %PEM_FILE% -r react-frontend\dist %SERVER_USER%@%SERVER_IP%:/tmp/frontend-build
scp -i %PEM_FILE% setup-frontend.sh %SERVER_USER%@%SERVER_IP%:/tmp/

echo Setting up frontend and Nginx...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "chmod +x /tmp/setup-frontend.sh && /tmp/setup-frontend.sh"

echo Testing website...
timeout 10 curl http://%SERVER_IP% || echo Website not responding yet

echo Frontend deployment completed!
echo Website: http://%SERVER_IP%
pause