# Script pour corriger le mot de passe de la base de données
Write-Host "🔧 Correction du mot de passe PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# Mot de passe par défaut utilisé dans docker-compose.yml
$defaultPassword = "babylone_secure_pass_2024"

# Vérifier si le fichier .env existe
if (-not (Test-Path .env)) {
    Write-Host "❌ Le fichier .env n'existe pas!" -ForegroundColor Red
    Write-Host "Création du fichier .env..." -ForegroundColor Yellow
    & .\create-env.ps1
    exit
}

# Lire le fichier .env
$envContent = Get-Content .env -Raw

# Vérifier si DB_PASSWORD existe
if ($envContent -match "DB_PASSWORD=(.+)") {
    $currentPassword = $matches[1].Trim()
    Write-Host "Mot de passe actuel dans .env: $currentPassword" -ForegroundColor Yellow
    
    # Remplacer par le mot de passe par défaut
    $envContent = $envContent -replace "DB_PASSWORD=.+", "DB_PASSWORD=$defaultPassword"
    
    # Sauvegarder
    $envContent | Set-Content .env -NoNewline
    Write-Host "✅ Mot de passe mis à jour: $defaultPassword" -ForegroundColor Green
} else {
    Write-Host "❌ DB_PASSWORD non trouvé dans .env" -ForegroundColor Red
    Write-Host "Ajout de DB_PASSWORD..." -ForegroundColor Yellow
    
    # Ajouter DB_PASSWORD à la fin du fichier
    Add-Content .env "`nDB_PASSWORD=$defaultPassword"
    Write-Host "✅ DB_PASSWORD ajouté: $defaultPassword" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Vérification des variables importantes:" -ForegroundColor Cyan
Get-Content .env | Select-String -Pattern "^(DB_|POSTGRES_)" | ForEach-Object {
    $line = $_.Line
    if ($line -match "PASSWORD") {
        Write-Host "  $($line -replace '=.*', '=***')" -ForegroundColor Gray
    } else {
        Write-Host "  $line" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "✅ Correction terminée!" -ForegroundColor Green
Write-Host "Redémarrez le backend avec: npm run start:dev" -ForegroundColor Yellow
