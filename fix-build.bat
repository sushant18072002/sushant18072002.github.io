@echo off
echo ========================================
echo Fix Frontend Build Issue
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Fixing PostCSS config...'
cd /tmp/travel-app/react-frontend

cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo 'Building frontend...'
npm run build

echo 'Copying to production...'
cp -r dist/* /var/www/travelai/frontend/

echo 'Frontend rebuild completed!'
"

pause