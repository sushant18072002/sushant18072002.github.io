@echo off
echo ========================================
echo MongoDB Connection Fix
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

echo Fixing MongoDB connection...
ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Checking MongoDB status...'
sudo systemctl status mongod

echo 'Restarting MongoDB...'
sudo systemctl restart mongod
sleep 5

echo 'Testing MongoDB connection...'
mongosh --eval 'db.adminCommand(\"ping\")'

echo 'Updating backend .env file...'
cd /var/www/travelai/backend
cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/travelai
JWT_SECRET=prod-jwt-secret-$(date +%s)
CORS_ORIGIN=http://34.228.143.158
UPLOAD_PATH=./uploads
EOF

echo 'Restarting backend...'
pm2 restart travelai-backend
sleep 3

echo 'Testing API...'
curl -s http://localhost:3000/api/health
"

echo MongoDB fix completed!
pause