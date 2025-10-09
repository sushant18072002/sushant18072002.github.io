@echo off
echo Using WSL for deployment...

wsl cp ssh/turntaptravel.pem /tmp/key.pem
wsl chmod 400 /tmp/key.pem
wsl scp -o StrictHostKeyChecking=no -i /tmp/key.pem -r react-frontend/dist ubuntu@34.228.143.158:/tmp/frontend-build
wsl scp -o StrictHostKeyChecking=no -i /tmp/key.pem -r backend ubuntu@34.228.143.158:/tmp/backend-build  
wsl scp -o StrictHostKeyChecking=no -i /tmp/key.pem deploy-server.sh ubuntu@34.228.143.158:/tmp/
wsl ssh -o StrictHostKeyChecking=no -i /tmp/key.pem ubuntu@34.228.143.158 "chmod +x /tmp/deploy-server.sh && /tmp/deploy-server.sh"

echo Deployment completed!