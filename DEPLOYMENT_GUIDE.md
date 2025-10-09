# Travel AI Platform Deployment Guide

## Prerequisites

1. **Ubuntu Server** (20.04 or later)
2. **Domain name** pointed to your server IP
3. **SSH key pair** (.pem file in `ssh/` folder)

## Quick Setup

### 1. Configure Connection
Edit the following files and replace placeholders:
- `deploy.bat` - Set `SERVER_IP` and `PEM_FILE` path
- `connect.bat` - Set `SERVER_IP` and `PEM_FILE` path
- `update-app.bat` - Set `SERVER_IP` and `PEM_FILE` path

### 2. Initial Deployment
```bash
# Run from Windows
deploy.bat
```

### 3. Connect to Server
```bash
# SSH into server
connect.bat
```

### 4. Setup SSL (on server)
```bash
# Upload and run SSL setup
scp -i ssh/your-key.pem setup-ssl.sh ubuntu@YOUR_SERVER_IP:/tmp/
ssh -i ssh/your-key.pem ubuntu@YOUR_SERVER_IP
chmod +x /tmp/setup-ssl.sh
/tmp/setup-ssl.sh
```

### 5. Update Application
```bash
# For future updates
update-app.bat
```

## Manual Server Setup

If you prefer manual setup:

### 1. Install Dependencies
```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# PM2 & Nginx
sudo npm install -g pm2
sudo apt install -y nginx
```

### 2. Setup Application
```bash
# Create directories
sudo mkdir -p /var/www/travelai/{frontend,backend}

# Copy files (after building frontend)
sudo cp -r frontend-build/* /var/www/travelai/frontend/
sudo cp -r backend/* /var/www/travelai/backend/

# Install backend dependencies
cd /var/www/travelai/backend
npm install --production
```

### 3. Configure Environment
```bash
# Backend .env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/travelai
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://yourdomain.com
```

### 4. Start Services
```bash
# MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Backend with PM2
pm2 start server.js --name "travelai-backend"
pm2 startup
pm2 save
```

### 5. Configure Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        root /var/www/travelai/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /var/www/travelai/backend/uploads;
        expires 1y;
    }
}
```

## Useful Commands

### Server Management
```bash
# Check services
pm2 status
sudo systemctl status mongod
sudo systemctl status nginx

# View logs
pm2 logs travelai-backend
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart travelai-backend
sudo systemctl restart nginx
```

### Database Management
```bash
# Connect to MongoDB
mongosh

# Backup database
mongodump --db travelai --out /backup/

# Restore database
mongorestore --db travelai /backup/travelai/
```

## Security Checklist

- [ ] Firewall configured (ports 22, 80, 443)
- [ ] SSH key authentication only
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Regular backups scheduled

## Troubleshooting

### Frontend not loading
- Check Nginx configuration
- Verify file permissions
- Check browser console for errors

### Backend API errors
- Check PM2 logs: `pm2 logs travelai-backend`
- Verify MongoDB connection
- Check environment variables

### Database connection issues
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in .env
- Verify network access

## Monitoring

### Setup monitoring (optional)
```bash
# Install monitoring tools
sudo npm install -g pm2-logrotate
pm2 install pm2-server-monit
```

### Health checks
- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/api/health`
- Database: `mongosh --eval "db.adminCommand('ping')"`