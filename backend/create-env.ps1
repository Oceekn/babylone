# Script pour créer le fichier .env

$envContent = @"
# Configuration Développement - BABYLONE Backend
# ⚠️ NE JAMAIS COMMITTER CE FICHIER AVEC DES VRAIES VALEURS EN PRODUCTION

# Environnement
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=babylone_user
DB_PASSWORD=babylone_secure_pass_2024
DB_DATABASE=babylone_prod
DB_SYNCHRONIZE=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=babylone_redis_pass_2024

# JWT (⚠️ Générer de vraies clés en production)
JWT_SECRET=dev_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=dev_refresh_secret_key_change_in_production
JWT_REFRESH_EXPIRES_IN=30d

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=babylone_admin
MINIO_SECRET_KEY=babylone_minio_pass_2024
MINIO_BUCKET_NAME=babylone-media

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Payment Gateway (Sandbox pour développement)
CINETPAY_API_KEY=your_cinetpay_api_key
CINETPAY_SITE_ID=your_site_id
CINETPAY_SECRET_KEY=your_secret_key

# URLs
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Backup (optionnel pour développement)
BACKUP_DIR=./backups
BACKUP_ENCRYPTION_KEY=
BACKUP_REMOTE_STORAGE=
BACKUP_RETENTION_DAYS=7
"@

$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline
Write-Host "Fichier .env créé avec succès !"

