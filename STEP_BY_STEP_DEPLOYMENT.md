# Step-by-Step Production Deployment

## Proper Deployment Order

### Step 1: Database Setup
```bash
deploy-step1-db.bat
```
**What it does:**
- Installs MongoDB 6.0
- Creates `travelai` database
- Creates database user with credentials
- Tests database connection

### Step 2: Backend Deployment
```bash
deploy-step2-backend.bat
```
**What it does:**
- Installs Node.js 18 and PM2
- Uploads and installs backend code
- Creates production environment variables
- Starts backend API with PM2
- Tests API endpoint

### Step 3: Frontend Deployment
```bash
deploy-step3-frontend.bat
```
**What it does:**
- Builds React frontend for production
- Installs and configures Nginx
- Uploads frontend files
- Configures reverse proxy for API
- Tests complete website

## Verification Steps

### After Step 1 (Database)
```bash
# SSH into server and check
ssh -i ssh/turntaptravel.pem ubuntu@34.228.143.158
sudo systemctl status mongod
mongosh --eval "db.adminCommand('ping')"
```

### After Step 2 (Backend)
```bash
# Check API health
curl http://34.228.143.158:3000/api/health
pm2 status
```

### After Step 3 (Frontend)
```bash
# Check website
curl http://34.228.143.158
sudo systemctl status nginx
```

## Production Configuration

### Database
- **Host:** localhost:27017
- **Database:** travelai
- **User:** travelai_user
- **Password:** secure_password_123

### Backend API
- **URL:** http://34.228.143.158:3000/api
- **Process Manager:** PM2
- **Environment:** Production

### Frontend
- **URL:** http://34.228.143.158
- **Web Server:** Nginx
- **Build:** Optimized production build

## Troubleshooting

### Database Issues
```bash
sudo systemctl restart mongod
sudo systemctl status mongod
```

### Backend Issues
```bash
pm2 restart travelai-backend
pm2 logs travelai-backend
```

### Frontend Issues
```bash
sudo systemctl restart nginx
sudo nginx -t
```

## Next Steps After Deployment

1. **Setup Domain:** Point your domain to 34.228.143.158
2. **SSL Certificate:** Run `setup-ssl.sh` for HTTPS
3. **Environment Variables:** Update production secrets
4. **Database Seeding:** Add initial data if needed
5. **Monitoring:** Setup logs and health checks