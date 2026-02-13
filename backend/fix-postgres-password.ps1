# Corrige l'erreur "authentification par mot de passe echouee" en recréant
# le conteneur PostgreSQL avec le mot de passe du fichier .env
# Les donnees (DB, Redis, MinIO) seront reinitialisees.

Write-Host "Arret des conteneurs et suppression des volumes..." -ForegroundColor Yellow
docker-compose down -v

Write-Host "Redemarrage (PostgreSQL sera recree avec le mot de passe du .env)..." -ForegroundColor Green
docker-compose up -d

Write-Host ""
Write-Host "Attendre 20 secondes que PostgreSQL demarre..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

Write-Host "Termine. Relance le backend: npm run start:dev" -ForegroundColor Green
