@echo off
echo ========================================
echo Server Management Commands
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

:menu
echo.
echo Choose an option:
echo 1. Check all services status
echo 2. View backend logs
echo 3. Restart backend
echo 4. Restart nginx
echo 5. View file structure
echo 6. Connect to server (SSH)
echo 7. Exit
echo.
set /p choice="Enter choice (1-7): "

if "%choice%"=="1" goto status
if "%choice%"=="2" goto logs
if "%choice%"=="3" goto restart_backend
if "%choice%"=="4" goto restart_nginx
if "%choice%"=="5" goto files
if "%choice%"=="6" goto ssh
if "%choice%"=="7" goto exit

:status
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo '=== Service Status ==='
sudo systemctl status mongod --no-pager -l
sudo systemctl status nginx --no-pager -l
pm2 status
"
goto menu

:logs
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "pm2 logs travelai-backend --lines 50"
goto menu

:restart_backend
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "pm2 restart travelai-backend"
echo Backend restarted!
goto menu

:restart_nginx
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "sudo systemctl restart nginx"
echo Nginx restarted!
goto menu

:files
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo '=== Application Files ==='
ls -la /var/www/travelai/
echo ''
echo '=== Frontend Files ==='
ls -la /var/www/travelai/frontend/
echo ''
echo '=== Backend Files ==='
ls -la /var/www/travelai/backend/
"
goto menu

:ssh
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP%
goto menu

:exit
exit