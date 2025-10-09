#!/bin/bash

echo "========================================="
echo "SSL Certificate Setup with Let's Encrypt"
echo "========================================="

# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
read -p "Enter your domain name: " DOMAIN
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN

# Setup auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run

echo "SSL certificate installed successfully!"
echo "Your site is now available at https://$DOMAIN"