#!/bin/bash

echo "========================================="
echo "MongoDB Setup for Production"
echo "========================================="

# Update system
sudo apt update

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongosh --eval "
use travelai;
db.createUser({
  user: 'travelai_user',
  pwd: 'db_password@123',
  roles: [{ role: 'readWrite', db: 'travelai' }]
});
"

# Test connection
mongosh --eval "db.adminCommand('ping')"

echo "MongoDB setup completed!"
echo "Database: travelai"
echo "User: travelai_user"
echo "Status: $(sudo systemctl is-active mongod)"