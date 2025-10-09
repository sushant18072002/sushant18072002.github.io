# Deployment Verification Guide

## Quick Health Check
```bash
check-deployment.bat
```

## Access Your Application

### 🌐 Website (Frontend)
**URL:** http://34.228.143.158
- Should show your Travel AI homepage
- All pages should load properly
- Forms should work

### 🔌 API (Backend)
**Base URL:** http://34.228.143.158/api
- Health check: http://34.228.143.158/api/health
- Should return JSON response

## File Structure on Server

```
/var/www/travelai/
├── frontend/           # Built React app
│   ├── index.html
│   ├── assets/
│   └── ...
├── backend/            # Node.js API
│   ├── server.js
│   ├── src/
│   ├── uploads/        # File uploads
│   ├── .env           # Production config
│   └── node_modules/
```

## Management Commands

### Check Everything
```bash
server-management.bat
```

### Manual SSH Commands
```bash
# Connect to server
ssh -i ssh/turntaptravel.pem ubuntu@34.228.143.158

# Check services
sudo systemctl status mongod
sudo systemctl status nginx
pm2 status

# View logs
pm2 logs travelai-backend
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart travelai-backend
sudo systemctl restart nginx
```

## Testing Checklist

### ✅ Database
- [ ] MongoDB running: `sudo systemctl status mongod`
- [ ] Database accessible: `mongosh --eval "db.adminCommand('ping')"`

### ✅ Backend API
- [ ] PM2 process running: `pm2 status`
- [ ] API responding: `curl http://localhost:3000/api/health`
- [ ] Environment variables set: `cat /var/www/travelai/backend/.env`

### ✅ Frontend
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] Files deployed: `ls /var/www/travelai/frontend/`
- [ ] Website accessible: `curl http://localhost/`

### ✅ External Access
- [ ] Website loads: http://34.228.143.158
- [ ] API responds: http://34.228.143.158/api/health
- [ ] No firewall blocking: ports 80, 443 open

## Common Issues & Fixes

### Website not loading
```bash
# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check files
ls -la /var/www/travelai/frontend/
```

### API not responding
```bash
# Check backend process
pm2 status
pm2 logs travelai-backend

# Check database connection
mongosh --eval "db.adminCommand('ping')"
```

### 502 Bad Gateway
```bash
# Backend is down, restart it
pm2 restart travelai-backend
```

## Update Process

### From GitHub
```bash
update-from-github.bat
```

### Manual Update
1. Push changes to GitHub
2. SSH to server: `ssh -i ssh/turntaptravel.pem ubuntu@34.228.143.158`
3. Update code: `cd /tmp/travel-app && git pull`
4. Copy files: `sudo cp -r backend/* /var/www/travelai/backend/`
5. Restart: `pm2 restart travelai-backend`

## Monitoring

### Real-time Logs
```bash
# Backend logs
pm2 logs travelai-backend --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Performance
```bash
# Server resources
htop
df -h
free -h

# Application metrics
pm2 monit
```