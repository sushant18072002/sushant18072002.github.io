@echo off
echo ========================================
echo Manual Setup (No Sudo Required)
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Creating directories...'
mkdir -p ~/travelai/backend
mkdir -p ~/travelai/frontend

echo 'Cloning repository...'
cd ~
git clone https://github.com/sushant18072002/sushant18072002.github.io.git travel-repo || echo 'Repo already exists'
cd travel-repo
git pull origin main

echo 'Copying backend files...'
cp -r backend/* ~/travelai/backend/

echo 'Creating .env file...'
cat > ~/travelai/backend/.env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/travelai
JWT_SECRET=prod-jwt-secret-12345
CORS_ORIGIN=http://34.228.143.158
UPLOAD_PATH=./uploads
EOF

echo 'Installing Node.js (user space)...'
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR=\"\$HOME/.nvm\"
[ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"
nvm install 18
nvm use 18

echo 'Installing backend dependencies...'
cd ~/travelai/backend
npm install

echo 'Starting backend...'
nohup node server.js > backend.log 2>&1 &

echo 'Building frontend...'
cd ~/travel-repo/react-frontend
npm install
npm run build
cp -r dist/* ~/travelai/frontend/

echo 'Setup completed!'
echo 'Backend log: ~/travelai/backend/backend.log'
echo 'Check if running: ps aux | grep node'
"

pause