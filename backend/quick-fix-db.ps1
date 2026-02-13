# Script rapide pour corriger la connexion PostgreSQL
Write-Host "Correction rapide de la connexion PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que Docker est en cours d'exécution
Write-Host "1. Vérification de Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Docker n'est pas en cours d'exécution!" -ForegroundColor Red
    Write-Host "   Démarrez Docker Desktop et réessayez." -ForegroundColor Yellow
    exit 1
}
Write-Host "   Docker est en cours d'execution" -ForegroundColor Green

# 2. Vérifier que le conteneur PostgreSQL est en cours d'exécution
Write-Host ""
Write-Host "2. Vérification du conteneur PostgreSQL..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=babylone_postgres" --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "   Conteneur non trouve, demarrage..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Start-Sleep -Seconds 5
}

$containerStatus = docker ps --filter "name=babylone_postgres" --format "{{.Status}}"
if ($containerStatus) {
    Write-Host "   Conteneur en cours d'execution: $containerStatus" -ForegroundColor Green
} else {
    Write-Host "   ❌ Impossible de démarrer le conteneur" -ForegroundColor Red
    exit 1
}

# 3. Attendre que PostgreSQL soit prêt
Write-Host ""
Write-Host "3. Attente que PostgreSQL soit prêt..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    Start-Sleep -Seconds 2
    $result = docker exec babylone_postgres pg_isready -U babylone_user 2>&1
    if ($result -match "accepting connections") {
        $ready = $true
        Write-Host "   PostgreSQL est pret!" -ForegroundColor Green
    } else {
        $attempt++
        Write-Host "   Tentative $attempt/$maxAttempts..." -ForegroundColor Gray
    }
}

if (-not $ready) {
    Write-Host "   ❌ PostgreSQL n'est pas prêt" -ForegroundColor Red
    exit 1
}

# 4. Vérifier le fichier .env
Write-Host ""
Write-Host "4. Vérification du fichier .env..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Write-Host "   Fichier .env manquant, creation..." -ForegroundColor Yellow
    & .\create-env.ps1
}

$envPassword = (Get-Content .env | Select-String "DB_PASSWORD").ToString() -replace "DB_PASSWORD=", "" -replace "`"", ""
$containerPassword = docker inspect babylone_postgres --format='{{range .Config.Env}}{{if (contains . "POSTGRES_PASSWORD")}}{{.}}{{end}}{{end}}' 2>$null
$containerPassword = $containerPassword -replace "POSTGRES_PASSWORD=", ""

if ($envPassword -eq $containerPassword) {
    Write-Host "   Les mots de passe correspondent: $envPassword" -ForegroundColor Green
} else {
    Write-Host "   Mots de passe differents!" -ForegroundColor Yellow
    Write-Host "      .env: $envPassword" -ForegroundColor Gray
    Write-Host "      Container: $containerPassword" -ForegroundColor Gray
    Write-Host "   Correction en cours..." -ForegroundColor Yellow
    
    # Mettre à jour .env avec le mot de passe du conteneur
    $envContent = Get-Content .env -Raw
    $envContent = $envContent -replace "DB_PASSWORD=.+", "DB_PASSWORD=$containerPassword"
    $envContent | Set-Content .env -NoNewline
    Write-Host "   .env mis a jour" -ForegroundColor Green
}

# 5. Test de connexion
Write-Host ""
Write-Host "5. Test de connexion..." -ForegroundColor Yellow
$testResult = docker exec babylone_postgres psql -U babylone_user -d babylone_prod -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Connexion reussie!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Échec de la connexion" -ForegroundColor Red
    Write-Host $testResult
    exit 1
}

Write-Host ""
Write-Host "Configuration verifiee et corrigee!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines etapes:" -ForegroundColor Cyan
Write-Host "   1. Arretez le backend s'il est en cours d'execution (Ctrl+C)" -ForegroundColor White
Write-Host "   2. Redemarrez le backend: npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "💡 Si le probleme persiste, verifiez que:" -ForegroundColor Yellow
Write-Host "   - Le port 5432 n'est pas utilise par un autre service" -ForegroundColor Gray
Write-Host "   - Aucun autre fichier .env.local n'existe pas" -ForegroundColor Gray
Write-Host "   - Le backend lit bien le fichier .env" -ForegroundColor Gray
