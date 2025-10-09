@echo off
echo ========================================
echo Travel AI Server Connection
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo Connecting to %SERVER_USER%@%SERVER_IP%...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP%