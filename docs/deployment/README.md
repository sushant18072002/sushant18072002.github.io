# Deployment & DevOps Guide

## 🏗️ Infrastructure Overview

### Cloud Provider: AWS
- **Compute**: ECS Fargate for containerized services
- **Database**: MongoDB Atlas + Amazon ElastiCache (Redis)
- **Storage**: Amazon S3 for static assets and file uploads
- **CDN**: CloudFront for global content delivery
- **Load Balancer**: Application Load Balancer (ALB)
- **DNS**: Route 53 for domain management
- **Monitoring**: CloudWatch + DataDog
- **Security**: AWS WAF + Shield for DDoS protection

### Environment Structure
```
Production (prod)
├── Frontend: CloudFront + S3
├── API Gateway: ALB + ECS Fargate
├── Microservices: ECS Fargate Cluster
├── Database: MongoDB Atlas (Multi-region)
├── Cache: ElastiCache Redis Cluster
└── Storage: S3 Multi-region buckets

Staging (staging)
├── Frontend: S3 Static Hosting
├── API: Single ECS Service
├── Database: MongoDB Atlas (Single region)
├── Cache: Single Redis Instance
└── Storage: S3 Single bucket

Development (dev)
├── Frontend: Local development server
├── API: Docker Compose
├── Database: Local MongoDB
├── Cache: Local Redis
└── Storage: Local file system
```

## 🐳 Containerization

### Docker Configuration

#### Frontend Dockerfile
```dockerfile
# Multi-stage build for React app
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]
```

#### AI Services Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose (Development)
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:4000/api/v1

  api-gateway:
    build:
      context: ./backend/api-gateway
    ports:
      - "4000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/travelai
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret-key
    depends_on:
      - mongodb
      - redis

  user-service:
    build:
      context: ./backend/user-service
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/travelai
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis

  booking-service:
    build:
      context: ./backend/booking-service
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/travelai
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis

  ai-service:
    build:
      context: ./ai-services
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

## ☸️ Kubernetes Deployment

### ECS Task Definitions

#### API Gateway Task Definition
```json
{
  "family": "travelai-api-gateway",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "api-gateway",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/travelai-api-gateway:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:travelai/mongodb-uri"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:travelai/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/travelai-api-gateway",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### ECS Service Configuration
```json
{
  "serviceName": "travelai-api-gateway",
  "cluster": "travelai-cluster",
  "taskDefinition": "travelai-api-gateway:1",
  "desiredCount": 3,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": [
        "subnet-12345678",
        "subnet-87654321"
      ],
      "securityGroups": [
        "sg-api-gateway"
      ],
      "assignPublicIp": "DISABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:REGION:ACCOUNT:targetgroup/travelai-api/1234567890123456",
      "containerName": "api-gateway",
      "containerPort": 3000
    }
  ],
  "serviceRegistries": [
    {
      "registryArn": "arn:aws:servicediscovery:REGION:ACCOUNT:service/srv-api-gateway"
    }
  ],
  "deploymentConfiguration": {
    "maximumPercent": 200,
    "minimumHealthyPercent": 50,
    "deploymentCircuitBreaker": {
      "enable": true,
      "rollback": true
    }
  }
}
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy TravelAI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: travelai

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/staging'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          # Build and push API Gateway
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY-api-gateway:$IMAGE_TAG ./backend/api-gateway
          docker push $ECR_REGISTRY/$ECR_REPOSITORY-api-gateway:$IMAGE_TAG
          
          # Build and push User Service
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY-user-service:$IMAGE_TAG ./backend/user-service
          docker push $ECR_REGISTRY/$ECR_REPOSITORY-user-service:$IMAGE_TAG
          
          # Build and push AI Service
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY-ai-service:$IMAGE_TAG ./ai-services
          docker push $ECR_REGISTRY/$ECR_REPOSITORY-ai-service:$IMAGE_TAG
      
      - name: Deploy to ECS
        env:
          IMAGE_TAG: ${{ github.sha }}
        run: |
          # Update task definitions with new image tags
          aws ecs update-service --cluster travelai-cluster --service travelai-api-gateway --force-new-deployment
          aws ecs update-service --cluster travelai-cluster --service travelai-user-service --force-new-deployment
          aws ecs update-service --cluster travelai-cluster --service travelai-ai-service --force-new-deployment
      
      - name: Deploy Frontend to S3
        run: |
          npm run build
          aws s3 sync ./dist s3://travelai-frontend-prod --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## 🔧 Infrastructure as Code

### Terraform Configuration
```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "travelai-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "travelai-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = var.environment
    Project     = "TravelAI"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "travelai-cluster"
  
  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      
      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs.name
      }
    }
  }
  
  tags = {
    Environment = var.environment
    Project     = "TravelAI"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "travelai-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = module.vpc.public_subnets
  
  enable_deletion_protection = var.environment == "production"
  
  tags = {
    Environment = var.environment
    Project     = "TravelAI"
  }
}

# S3 Bucket for Frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "travelai-frontend-${var.environment}"
  
  tags = {
    Environment = var.environment
    Project     = "TravelAI"
  }
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  
  index_document {
    suffix = "index.html"
  }
  
  error_document {
    key = "error.html"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  tags = {
    Environment = var.environment
    Project     = "TravelAI"
  }
}
```

## 📊 Monitoring & Logging

### CloudWatch Configuration
```yaml
# cloudwatch-config.yml
version: 1
logs:
  logs_collected:
    files:
      collect_list:
        - file_path: /var/log/app/*.log
          log_group_name: /aws/ecs/travelai
          log_stream_name: '{instance_id}'
          timezone: UTC
          
metrics:
  namespace: TravelAI
  metrics_collected:
    cpu:
      measurement:
        - cpu_usage_idle
        - cpu_usage_iowait
        - cpu_usage_user
        - cpu_usage_system
      metrics_collection_interval: 60
    disk:
      measurement:
        - used_percent
      metrics_collection_interval: 60
      resources:
        - "*"
    mem:
      measurement:
        - mem_used_percent
      metrics_collection_interval: 60
```

### DataDog Integration
```javascript
// datadog-config.js
const tracer = require('dd-trace').init({
  service: 'travelai-api',
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION,
  logInjection: true,
  runtimeMetrics: true,
  profiling: true,
});

// Custom metrics
const StatsD = require('node-statsd');
const client = new StatsD({
  host: process.env.DATADOG_AGENT_HOST,
  port: 8125,
  prefix: 'travelai.',
});

module.exports = {
  tracer,
  metrics: client,
};
```

## 🔐 Security Configuration

### AWS Security Groups
```hcl
# Security Group for ALB
resource "aws_security_group" "alb" {
  name_prefix = "travelai-alb-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "travelai-alb-sg"
  }
}

# Security Group for ECS Services
resource "aws_security_group" "ecs_service" {
  name_prefix = "travelai-ecs-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "travelai-ecs-sg"
  }
}
```

### Secrets Management
```hcl
# Secrets Manager
resource "aws_secretsmanager_secret" "database_url" {
  name = "travelai/database-url"
  
  tags = {
    Environment = var.environment
    Project     = "TravelAI"
  }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = var.database_url
}

# IAM Role for ECS Tasks
resource "aws_iam_role" "ecs_task_role" {
  name = "travelai-ecs-task-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "ecs_task_policy" {
  name = "travelai-ecs-task-policy"
  role = aws_iam_role.ecs_task_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.database_url.arn,
          "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:travelai/*"
        ]
      }
    ]
  })
}
```

## 🔄 Backup & Disaster Recovery

### Database Backup Strategy
```javascript
// backup-script.js
const { MongoClient } = require('mongodb');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const BACKUP_BUCKET = 'travelai-backups';

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `mongodb-backup-${timestamp}`;
  
  try {
    // Create MongoDB dump
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec(`mongodump --uri="${process.env.MONGODB_URI}" --out=/tmp/${backupName}`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    
    // Compress backup
    await new Promise((resolve, reject) => {
      exec(`tar -czf /tmp/${backupName}.tar.gz -C /tmp ${backupName}`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    
    // Upload to S3
    const fileStream = require('fs').createReadStream(`/tmp/${backupName}.tar.gz`);
    await s3.upload({
      Bucket: BACKUP_BUCKET,
      Key: `mongodb/${backupName}.tar.gz`,
      Body: fileStream,
      StorageClass: 'STANDARD_IA',
    }).promise();
    
    console.log(`Backup completed: ${backupName}`);
    
    // Cleanup local files
    exec(`rm -rf /tmp/${backupName}*`);
    
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

// Schedule backups
const cron = require('node-cron');
cron.schedule('0 2 * * *', createBackup); // Daily at 2 AM
```

This comprehensive deployment guide covers all aspects of deploying and managing the TravelAI platform in production, from containerization to monitoring and disaster recovery.