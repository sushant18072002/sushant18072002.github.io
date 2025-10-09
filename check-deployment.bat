@echo off
echo ========================================
echo Deployment Health Check
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo 1. Checking Website...
curl -s -o nul -w "Website Status: %%{http_code}\n" http://%SERVER_IP%

echo.
echo 2. Checking API...
curl -s -o nul -w "API Status: %%{http_code}\n" http://%SERVER_IP%/api/health

echo.
echo 3. Server Status Check...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo '=== Services Status ==='
echo 'MongoDB:' $(sudo systemctl is-active mongod)
echo 'Nginx:' $(sudo systemctl is-active nginx)
echo 'Backend PM2:' $(pm2 list | grep travelai-backend | awk '{print $10}')

echo ''
echo '=== File Locations ==='
echo 'Frontend: /var/www/travelai/frontend'
echo 'Backend: /var/www/travelai/backend'
echo 'Uploads: /var/www/travelai/backend/uploads'

echo ''
echo '=== Quick Tests ==='
curl -s http://localhost:3000/api/health && echo ' - Backend API: OK' || echo ' - Backend API: FAILED'
curl -s http://localhost/ | head -1 | grep -q 'html' && echo ' - Frontend: OK' || echo ' - Frontend: FAILED'
"

echo.
echo Access your application:
echo Website: http://%SERVER_IP%
echo API: http://%SERVER_IP%/api
pause