@echo off
echo ========================================
echo Check Server Files
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo '=== Check if files exist ==='
ls -la /var/www/ 2>/dev/null || echo '/var/www/ does not exist'
ls -la /var/www/travelai/ 2>/dev/null || echo '/var/www/travelai/ does not exist'
ls -la /var/www/travelai/backend/ 2>/dev/null || echo 'Backend folder does not exist'

echo ''
echo '=== Check .env file ==='
cat /var/www/travelai/backend/.env 2>/dev/null || echo '.env file does not exist'

echo ''
echo '=== Check if MongoDB installed ==='
which mongod 2>/dev/null || echo 'MongoDB not installed'
which node 2>/dev/null || echo 'Node.js not installed'
which pm2 2>/dev/null || echo 'PM2 not installed'

echo ''
echo '=== Check processes ==='
ps aux | grep mongod | grep -v grep || echo 'MongoDB not running'
ps aux | grep node | grep -v grep || echo 'Node.js not running'
"

pause