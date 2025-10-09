@echo off
echo ========================================
echo Update Upload Limits
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo Updating backend and Nginx...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Updating Nginx configuration...'
sudo sed -i '/server_name 34.228.143.158;/a\    client_max_body_size 50M;' /etc/nginx/sites-available/travelai

echo 'Testing Nginx config...'
sudo nginx -t

echo 'Reloading Nginx...'
sudo systemctl reload nginx

echo 'Upload limits updated!'
"

echo Deploying updated backend...
call deploy-from-github-complete.bat

pause