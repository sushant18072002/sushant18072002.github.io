@echo off
echo ========================================
echo Connect and Setup Backend
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo Uploading setup script...
scp -i %PEM_FILE% setup-env.sh %SERVER_USER%@%SERVER_IP%:/tmp/

echo Connecting to server...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "chmod +x /tmp/setup-env.sh && /tmp/setup-env.sh"

pause