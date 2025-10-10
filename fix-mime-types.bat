@echo off
echo ========================================
echo Fix MIME Types for JS Modules
echo ========================================

set SERVER_IP=34.228.143.158
set SERVER_USER=ubuntu
set PEM_FILE=ssh\turntaptravel.pem

ssh -i %PEM_FILE% %SERVER_USER%@%SERVER_IP% "
echo 'Adding MIME types to Nginx config...'
sudo tee /etc/nginx/sites-available/travelai > /dev/null << 'EOF'
server {
    listen 80;
    server_name 34.228.143.158;
    client_max_body_size 50M;

    location / {
        root /var/www/travelai/frontend;
        index index.html;
        try_files \$uri \$uri/ @fallback;
        
        # Fix MIME types for JS modules
        location ~* \.js$ {
            add_header Content-Type application/javascript;
        }
        
        location ~* \.mjs$ {
            add_header Content-Type application/javascript;
        }
    }

    location @fallback {
        root /var/www/travelai/frontend;
        try_files /index.html =404;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 50M;
    }

    location /uploads {
        alias /var/www/travelai/backend/uploads;
        expires 1y;
    }
}
EOF

echo 'Testing and reloading Nginx...'
sudo nginx -t && sudo systemctl reload nginx

echo 'Testing website...'
curl -s http://localhost/ | head -5
"

pause