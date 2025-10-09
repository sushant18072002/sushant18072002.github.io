@echo off
echo ========================================
echo Backend Debug Information
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo '=== MongoDB Status ==='
sudo systemctl status mongod --no-pager
mongosh --eval 'db.adminCommand(\"ping\")' 2>/dev/null || echo 'MongoDB connection failed'

echo ''
echo '=== Backend Environment ==='
cd /var/www/travelai/backend
cat .env

echo ''
echo '=== PM2 Status ==='
pm2 status
pm2 logs travelai-backend --lines 20

echo ''
echo '=== Network Test ==='
netstat -tlnp | grep :3000
curl -s http://localhost:3000/api/health || echo 'Backend API not responding'

echo ''
echo '=== File Permissions ==='
ls -la /var/www/travelai/backend/
"

pause