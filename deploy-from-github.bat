@echo off
echo ========================================
echo GitHub-based Deployment
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo Uploading deployment scripts...
scp -i %PEM_FILE% setup-from-github.sh %SERVER_USER%@%SERVER_IP%:/tmp/

echo Deploying from GitHub...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "chmod +x /tmp/setup-from-github.sh && /tmp/setup-from-github.sh"

echo Deployment completed!
pause