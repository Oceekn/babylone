#!/bin/bash

# Script de déploiement pour BABYLONE Backend
# Usage: ./deploy.sh [environment] [version]
# Exemple: ./deploy.sh production v1.0.0

set -e

ENVIRONMENT="${1:-production}"
VERSION="${2:-latest}"

echo "🚀 Deploying BABYLONE Backend"
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier les prérequis
check_prerequisites() {
  echo "🔍 Checking prerequisites..."
  
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
  fi
  
  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ All prerequisites met${NC}"
}

# Charger les variables d'environnement
load_env() {
  echo "📋 Loading environment variables..."
  
  if [ ! -f ".env.$ENVIRONMENT" ]; then
    echo -e "${YELLOW}⚠️ .env.$ENVIRONMENT not found, using .env${NC}"
    if [ ! -f ".env" ]; then
      echo -e "${RED}❌ .env file not found${NC}"
      exit 1
    fi
  else
    cp ".env.$ENVIRONMENT" ".env"
  fi
  
  source .env
  echo -e "${GREEN}✅ Environment variables loaded${NC}"
}

# Build de l'application
build_app() {
  echo "🔨 Building application..."
  
  npm install
  npm run build
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ Build successful${NC}"
}

# Exécuter les migrations
run_migrations() {
  echo "🗄️ Running database migrations..."
  
  npm run migration:run
  
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️ Migration failed, but continuing...${NC}"
  else
    echo -e "${GREEN}✅ Migrations completed${NC}"
  fi
}

# Démarrer les services Docker
start_services() {
  echo "🐳 Starting Docker services..."
  
  docker-compose up -d postgres redis minio
  
  # Attendre que les services soient prêts
  echo "⏳ Waiting for services to be ready..."
  sleep 10
  
  # Vérifier la santé des services
  check_services_health
  
  echo -e "${GREEN}✅ Services started${NC}"
}

# Vérifier la santé des services
check_services_health() {
  echo "🏥 Checking services health..."
  
  # PostgreSQL
  if docker-compose exec -T postgres pg_isready -U babylone_user &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
  else
    echo -e "${RED}❌ PostgreSQL is not ready${NC}"
    exit 1
  fi
  
  # Redis
  if docker-compose exec -T redis redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
  else
    echo -e "${RED}❌ Redis is not ready${NC}"
    exit 1
  fi
  
  # MinIO
  if curl -f http://localhost:9000/minio/health/live &> /dev/null; then
    echo -e "${GREEN}✅ MinIO is ready${NC}"
  else
    echo -e "${YELLOW}⚠️ MinIO health check failed (may still be starting)${NC}"
  fi
}

# Démarrer l'application
start_app() {
  echo "🚀 Starting application..."
  
  if [ "$ENVIRONMENT" = "production" ]; then
    # Production: utiliser PM2 ou systemd
    if command -v pm2 &> /dev/null; then
      pm2 restart babylone-backend || pm2 start dist/main.js --name babylone-backend
      echo -e "${GREEN}✅ Application started with PM2${NC}"
    else
      # Fallback: démarrer directement
      NODE_ENV=production node dist/main.js &
      echo $! > .pid
      echo -e "${GREEN}✅ Application started (PID: $(cat .pid))${NC}"
    fi
  else
    # Développement/Staging: utiliser npm
    npm run start:prod &
    echo $! > .pid
    echo -e "${GREEN}✅ Application started (PID: $(cat .pid))${NC}"
  fi
}

# Vérifier que l'application répond
check_app_health() {
  echo "🏥 Checking application health..."
  
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:${PORT:-3000}/api/v1/health &> /dev/null; then
      echo -e "${GREEN}✅ Application is healthy${NC}"
      return 0
    fi
    
    attempt=$((attempt + 1))
    echo "⏳ Waiting for application... ($attempt/$max_attempts)"
    sleep 2
  done
  
  echo -e "${RED}❌ Application health check failed${NC}"
  exit 1
}

# Rollback en cas d'erreur
rollback() {
  echo -e "${YELLOW}⚠️ Rolling back...${NC}"
  
  if [ -f ".pid" ]; then
    kill $(cat .pid) 2>/dev/null || true
    rm .pid
  fi
  
  if command -v pm2 &> /dev/null; then
    pm2 stop babylone-backend 2>/dev/null || true
  fi
  
  echo -e "${YELLOW}⚠️ Rollback completed${NC}"
}

# Main deployment flow
main() {
  trap rollback ERR
  
  check_prerequisites
  load_env
  start_services
  build_app
  run_migrations
  start_app
  check_app_health
  
  echo ""
  echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
  echo "Application is running on http://localhost:${PORT:-3000}"
}

main

