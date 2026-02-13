# Script PowerShell pour demarrer les services BABYLONE
# Executez ce script avec : .\start-services.ps1

Write-Host "=== Demarrage des services BABYLONE ===" -ForegroundColor Cyan
Write-Host ""

# Verifier Docker
Write-Host "1. Verification de Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "   OK Docker installe: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR Docker n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "   Veuillez installer Docker Desktop depuis https://www.docker.com/" -ForegroundColor Yellow
    exit 1
}

# Verifier Docker Compose
Write-Host ""
Write-Host "2. Verification de Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version 2>&1
    Write-Host "   OK Docker Compose installe: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR Docker Compose n'est pas installe" -ForegroundColor Red
    exit 1
}

# Verifier le fichier .env
Write-Host ""
Write-Host "3. Verification du fichier .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   OK Fichier .env existe" -ForegroundColor Green
    
    # Verifier que DB_PASSWORD est defini
    $envContent = Get-Content ".env" -Raw -ErrorAction SilentlyContinue
    if ($envContent -match "DB_PASSWORD=") {
        Write-Host "   OK DB_PASSWORD est defini" -ForegroundColor Green
    } else {
        Write-Host "   ATTENTION DB_PASSWORD n'est pas defini dans .env" -ForegroundColor Yellow
        Write-Host "   Ajoutez: DB_PASSWORD=babylone_secure_pass_2024" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERREUR Fichier .env n'existe pas" -ForegroundColor Red
    Write-Host "   Creation du fichier .env avec les valeurs par defaut..." -ForegroundColor Yellow
    
    # Creer le contenu du fichier .env
    $envLines = @(
        "# Environnement",
        "NODE_ENV=development",
        "PORT=3000",
        "API_PREFIX=api/v1",
        "",
        "# Database PostgreSQL",
        "DB_HOST=localhost",
        "DB_PORT=5432",
        "DB_USERNAME=babylone_user",
        "DB_PASSWORD=babylone_secure_pass_2024",
        "DB_DATABASE=babylone_prod",
        "DB_SYNCHRONIZE=false",
        "",
        "# Redis",
        "REDIS_HOST=localhost",
        "REDIS_PORT=6379",
        "REDIS_PASSWORD=babylone_redis_pass_2024",
        "",
        "# JWT",
        "JWT_SECRET=dev_jwt_secret_key_change_in_production",
        "JWT_EXPIRES_IN=7d",
        "JWT_REFRESH_SECRET=dev_refresh_secret_key_change_in_production",
        "JWT_REFRESH_EXPIRES_IN=30d",
        "",
        "# MinIO",
        "MINIO_ENDPOINT=localhost",
        "MINIO_PORT=9000",
        "MINIO_USE_SSL=false",
        "MINIO_ACCESS_KEY=babylone_admin",
        "MINIO_SECRET_KEY=babylone_minio_pass_2024",
        "MINIO_BUCKET_NAME=babylone-media",
        "",
        "# Rate Limiting",
        "THROTTLE_TTL=60",
        "THROTTLE_LIMIT=100",
        "",
        "# CinetPay (Sandbox pour developpement)",
        "CINETPAY_API_KEY=your_cinetpay_api_key",
        "CINETPAY_SITE_ID=your_site_id",
        "CINETPAY_SECRET_KEY=your_secret_key",
        "",
        "# URLs",
        "FRONTEND_URL=http://localhost:5173",
        "",
        "# Backup (optionnel pour developpement)",
        "BACKUP_DIR=./backups",
        "BACKUP_ENCRYPTION_KEY=",
        "BACKUP_REMOTE_STORAGE=",
        "BACKUP_RETENTION_DAYS=7"
    )
    
    $envLines | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
    Write-Host "   OK Fichier .env cree" -ForegroundColor Green
}

# Demarrer les conteneurs
Write-Host ""
Write-Host "4. Demarrage des conteneurs Docker..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Conteneurs demarres" -ForegroundColor Green
} else {
    Write-Host "   ERREUR lors du demarrage des conteneurs" -ForegroundColor Red
    exit 1
}

# Attendre que PostgreSQL demarre
Write-Host ""
Write-Host "5. Attente du demarrage de PostgreSQL (15 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verifier le statut des conteneurs
Write-Host ""
Write-Host "6. Statut des conteneurs:" -ForegroundColor Yellow
docker-compose ps

# Verifier les logs PostgreSQL
Write-Host ""
Write-Host "7. Verification des logs PostgreSQL (dernieres 10 lignes):" -ForegroundColor Yellow
docker logs babylone_postgres --tail 10

Write-Host ""
Write-Host "=== Services demarres avec succes! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant lancer l'application avec:" -ForegroundColor Cyan
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host ""
