# Script pour vérifier la configuration de l'environnement
Write-Host "🔍 Vérification de la configuration..." -ForegroundColor Cyan
Write-Host ""

# Vérifier les fichiers .env
Write-Host "📁 Fichiers de configuration:" -ForegroundColor Cyan
if (Test-Path .env.local) {
    Write-Host "  ✅ .env.local existe (priorité 1)" -ForegroundColor Yellow
    $localPassword = (Get-Content .env.local | Select-String "DB_PASSWORD").ToString() -replace "DB_PASSWORD=", ""
    Write-Host "     DB_PASSWORD: $localPassword" -ForegroundColor Gray
} else {
    Write-Host "  ⚪ .env.local n'existe pas" -ForegroundColor Gray
}

if (Test-Path .env) {
    Write-Host "  ✅ .env existe (priorité 2)" -ForegroundColor Green
    $envPassword = (Get-Content .env | Select-String "DB_PASSWORD").ToString() -replace "DB_PASSWORD=", ""
    Write-Host "     DB_PASSWORD: $envPassword" -ForegroundColor Gray
} else {
    Write-Host "  ❌ .env n'existe pas" -ForegroundColor Red
}

Write-Host ""

# Vérifier Docker
Write-Host "🐳 Conteneur PostgreSQL:" -ForegroundColor Cyan
$containerStatus = docker ps --filter "name=babylone_postgres" --format "{{.Status}}"
if ($containerStatus) {
    Write-Host "  ✅ Conteneur en cours d'exécution: $containerStatus" -ForegroundColor Green
    
    # Récupérer le mot de passe du conteneur
    $containerPassword = docker inspect babylone_postgres --format='{{index .Config.Env 0}}' 2>$null
    $containerPassword = docker inspect babylone_postgres --format='{{range .Config.Env}}{{if (contains . "POSTGRES_PASSWORD")}}{{.}}{{end}}{{end}}' 2>$null
    if ($containerPassword) {
        $containerPassword = $containerPassword -replace "POSTGRES_PASSWORD=", ""
        Write-Host "     Mot de passe du conteneur: $containerPassword" -ForegroundColor Gray
    }
} else {
    Write-Host "  ❌ Conteneur non trouvé ou arrêté" -ForegroundColor Red
}

Write-Host ""

# Test de connexion
Write-Host "🧪 Test de connexion PostgreSQL:" -ForegroundColor Cyan
$testResult = docker exec babylone_postgres psql -U babylone_user -d babylone_prod -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Connexion réussie depuis Docker" -ForegroundColor Green
} else {
    Write-Host "  ❌ Échec de la connexion" -ForegroundColor Red
    Write-Host $testResult
}

Write-Host ""
Write-Host "💡 Recommandations:" -ForegroundColor Cyan
Write-Host "  - Assurez-vous que DB_PASSWORD dans .env correspond à POSTGRES_PASSWORD du conteneur" -ForegroundColor White
Write-Host "  - Si .env.local existe, il sera lu en priorité" -ForegroundColor White
Write-Host "  - Redémarrez le backend après toute modification de .env" -ForegroundColor White
