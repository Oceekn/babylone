# Script rapide pour corriger la connexion PostgreSQL
# Executez: .\quick-fix.ps1

Write-Host "=== Correction de la connexion PostgreSQL ===" -ForegroundColor Cyan
Write-Host ""

# Verifier Docker
Write-Host "1. Verification Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERREUR: Docker n'est pas demarre!" -ForegroundColor Red
    Write-Host "   Demarrez Docker Desktop et relancez ce script" -ForegroundColor Yellow
    exit 1
}
Write-Host "   OK Docker est demarre" -ForegroundColor Green

# Aller dans backend
Set-Location $PSScriptRoot

# Verifier .env
Write-Host ""
Write-Host "2. Verification du fichier .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "   Creation du fichier .env..." -ForegroundColor Yellow
    @"
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=babylone_user
DB_PASSWORD=babylone_secure_pass_2024
DB_DATABASE=babylone_prod
DB_SYNCHRONIZE=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=babylone_redis_pass_2024
JWT_SECRET=dev_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=dev_refresh_secret_key_change_in_production
JWT_REFRESH_EXPIRES_IN=30d
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=babylone_admin
MINIO_SECRET_KEY=babylone_minio_pass_2024
MINIO_BUCKET_NAME=babylone-media
THROTTLE_TTL=60
THROTTLE_LIMIT=100
CINETPAY_API_KEY=your_cinetpay_api_key
CINETPAY_SITE_ID=your_site_id
CINETPAY_SECRET_KEY=your_secret_key
FRONTEND_URL=http://localhost:5173
BACKUP_DIR=./backups
BACKUP_ENCRYPTION_KEY=
BACKUP_REMOTE_STORAGE=
BACKUP_RETENTION_DAYS=7
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "   OK Fichier .env cree" -ForegroundColor Green
} else {
    Write-Host "   OK Fichier .env existe" -ForegroundColor Green
}

# Demarrer les conteneurs
Write-Host ""
Write-Host "3. Demarrage des conteneurs Docker..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Conteneurs demarres" -ForegroundColor Green
} else {
    Write-Host "   ERREUR lors du demarrage" -ForegroundColor Red
    exit 1
}

# Attendre PostgreSQL
Write-Host ""
Write-Host "4. Attente du demarrage de PostgreSQL (20 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Verifier le statut
Write-Host ""
Write-Host "5. Statut des conteneurs:" -ForegroundColor Yellow
docker-compose ps

# Verifier les logs
Write-Host ""
Write-Host "6. Logs PostgreSQL (dernieres 10 lignes):" -ForegroundColor Yellow
docker logs babylone_postgres --tail 10 2>&1

Write-Host ""
Write-Host "=== Correction terminee! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant lancer: npm run start:dev" -ForegroundColor Cyan
Write-Host ""

