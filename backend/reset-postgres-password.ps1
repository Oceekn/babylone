# Script pour réinitialiser le mot de passe PostgreSQL dans le conteneur Docker
Write-Host "🔧 Réinitialisation du mot de passe PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

$password = "babylone_secure_pass_2024"

# Vérifier si le conteneur existe
$containerExists = docker ps -a --filter "name=babylone_postgres" --format "{{.Names}}"
if (-not $containerExists) {
    Write-Host "❌ Le conteneur babylone_postgres n'existe pas!" -ForegroundColor Red
    Write-Host "Démarrez d'abord les services avec: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Options:" -ForegroundColor Cyan
Write-Host "1. Réinitialiser le mot de passe dans le conteneur (nécessite redémarrage)" -ForegroundColor White
Write-Host "2. Recréer le conteneur avec le bon mot de passe (recommandé)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Choisissez une option (1 ou 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "⚠️  Réinitialisation du mot de passe dans le conteneur..." -ForegroundColor Yellow
    Write-Host "Cette méthode nécessite d'arrêter et redémarrer le conteneur." -ForegroundColor Yellow
    Write-Host ""
    
    # Arrêter le conteneur
    Write-Host "Arrêt du conteneur..." -ForegroundColor Yellow
    docker stop babylone_postgres
    
    # Modifier la variable d'environnement
    Write-Host "Modification de la variable d'environnement..." -ForegroundColor Yellow
    docker rm babylone_postgres
    
    # Redémarrer avec docker-compose
    Write-Host "Redémarrage avec docker-compose..." -ForegroundColor Yellow
    docker-compose up -d postgres
    
    Write-Host "✅ Conteneur redémarré avec le nouveau mot de passe" -ForegroundColor Green
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "🔄 Recréation du conteneur PostgreSQL..." -ForegroundColor Yellow
    Write-Host ""
    
    # Arrêter et supprimer le conteneur
    Write-Host "Arrêt et suppression du conteneur..." -ForegroundColor Yellow
    docker-compose stop postgres
    docker-compose rm -f postgres
    
    # Supprimer le volume (optionnel - décommentez si vous voulez réinitialiser complètement)
    Write-Host ""
    $resetVolume = Read-Host "Voulez-vous supprimer les données existantes? (o/N)"
    if ($resetVolume -eq "o" -or $resetVolume -eq "O") {
        Write-Host "Suppression du volume de données..." -ForegroundColor Yellow
        docker volume rm babylone_postgres_data 2>$null
        Write-Host "✅ Volume supprimé" -ForegroundColor Green
    }
    
    # Recréer le conteneur
    Write-Host ""
    Write-Host "Création du nouveau conteneur..." -ForegroundColor Yellow
    docker-compose up -d postgres
    
    # Attendre que PostgreSQL soit prêt
    Write-Host "Attente que PostgreSQL soit prêt..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    $ready = $false
    
    while ($attempt -lt $maxAttempts -and -not $ready) {
        Start-Sleep -Seconds 2
        $result = docker exec babylone_postgres pg_isready -U babylone_user 2>&1
        if ($result -match "accepting connections") {
            $ready = $true
            Write-Host "✅ PostgreSQL est prêt!" -ForegroundColor Green
        } else {
            $attempt++
            Write-Host "  Tentative $attempt/$maxAttempts..." -ForegroundColor Gray
        }
    }
    
    if (-not $ready) {
        Write-Host "❌ PostgreSQL n'est pas prêt après $maxAttempts tentatives" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Conteneur recréé avec succès!" -ForegroundColor Green
} else {
    Write-Host "❌ Option invalide" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🧪 Test de connexion..." -ForegroundColor Cyan
$testResult = docker exec babylone_postgres psql -U babylone_user -d babylone_prod -c "SELECT version();" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connexion réussie!" -ForegroundColor Green
    Write-Host "Vous pouvez maintenant redémarrer le backend avec: npm run start:dev" -ForegroundColor Yellow
} else {
    Write-Host "❌ Échec de la connexion" -ForegroundColor Red
    Write-Host $testResult
    exit 1
}
