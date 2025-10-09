@echo off
echo ========================================
echo Step 1: Database Setup
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo Uploading database setup script...
scp -i %PEM_FILE% setup-mongodb.sh %SERVER_USER%@%SERVER_IP%:/tmp/

echo Setting up MongoDB...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "chmod +x /tmp/setup-mongodb.sh && /tmp/setup-mongodb.sh"

echo Database setup completed!
pause