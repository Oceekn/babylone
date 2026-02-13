# 🔧 Résolution de l'erreur de connexion PostgreSQL

## ❌ Erreur actuelle
```
authentification par mot de passe échouée pour l'utilisateur 'babylone_user'
```

## ✅ Solution étape par étape

### Étape 1 : Vérifier que Docker Desktop est démarré

1. Ouvrez **Docker Desktop** (icône dans la barre des tâches Windows)
2. Attendez que Docker soit complètement démarré (icône verte)
3. Si Docker n'est pas installé : https://www.docker.com/products/docker-desktop/

### Étape 2 : Démarrer les conteneurs Docker

Ouvrez PowerShell dans le dossier `backend` et exécutez :

```powershell
cd E:\BABYLON\backend
docker-compose up -d
```

**Attendez 15-20 secondes** que PostgreSQL démarre complètement.

### Étape 3 : Vérifier que les conteneurs sont démarrés

```powershell
docker-compose ps
```

Vous devriez voir :
- `babylone_postgres` - Status: Up
- `babylone_redis` - Status: Up  
- `babylone_minio` - Status: Up

### Étape 4 : Vérifier/créer le fichier .env

Le fichier `.env` doit exister dans `backend/` avec ce contenu :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=babylone_user
DB_PASSWORD=babylone_secure_pass_2024
DB_DATABASE=babylone_prod
DB_SYNCHRONIZE=false
```

**Important** : Le mot de passe `babylone_secure_pass_2024` doit être identique dans :
- Le fichier `.env` (variable `DB_PASSWORD`)
- Le fichier `docker-compose.yml` (variable `POSTGRES_PASSWORD`)

### Étape 5 : Si les conteneurs existent déjà mais ne fonctionnent pas

Arrêtez et recréez les conteneurs :

```powershell
cd E:\BABYLON\backend
docker-compose down
docker-compose up -d
```

Attendez 20 secondes, puis vérifiez :

```powershell
docker-compose ps
docker logs babylone_postgres --tail 20
```

### Étape 6 : Tester la connexion manuellement

Pour vérifier que PostgreSQL fonctionne :

```powershell
docker exec -it babylone_postgres psql -U babylone_user -d babylone_prod
```

Si cela fonctionne, vous verrez le prompt PostgreSQL. Tapez `\q` pour quitter.

### Étape 7 : Relancer l'application

Une fois que les conteneurs sont démarrés et que le fichier `.env` est correct :

```powershell
npm run start:dev
```

## 🔍 Diagnostic rapide

Exécutez ces commandes dans l'ordre :

```powershell
# 1. Vérifier Docker
docker --version

# 2. Aller dans backend
cd E:\BABYLON\backend

# 3. Voir l'état des conteneurs
docker-compose ps

# 4. Si pas démarrés, les démarrer
docker-compose up -d

# 5. Attendre 20 secondes
Start-Sleep -Seconds 20

# 6. Vérifier les logs PostgreSQL
docker logs babylone_postgres --tail 30

# 7. Vérifier le fichier .env
if (Test-Path .env) { Write-Host ".env existe" } else { Write-Host ".env n'existe pas - CRÉEZ-LE!" }

# 8. Relancer l'app
npm run start:dev
```

## ⚠️ Problèmes courants

### Problème 1 : Docker Desktop n'est pas démarré
**Solution** : Démarrer Docker Desktop et attendre qu'il soit complètement prêt

### Problème 2 : Le port 5432 est déjà utilisé
**Solution** : 
- Arrêter l'autre instance PostgreSQL
- Ou changer le port dans `docker-compose.yml` (ligne 13: `"5433:5432"`)

### Problème 3 : Le mot de passe ne correspond pas
**Solution** : 
- Vérifier que `DB_PASSWORD=babylone_secure_pass_2024` dans `.env`
- Vérifier que `POSTGRES_PASSWORD: ${DB_PASSWORD:-babylone_secure_pass_2024}` dans `docker-compose.yml`

### Problème 4 : Les conteneurs sont arrêtés
**Solution** : `docker-compose up -d` pour les redémarrer

## 📝 Commandes utiles

```powershell
# Voir tous les conteneurs
docker ps -a

# Voir les logs en temps réel
docker-compose logs -f postgres

# Arrêter tous les conteneurs
docker-compose down

# Redémarrer un conteneur spécifique
docker-compose restart postgres

# Supprimer et recréer (⚠️ supprime les données)
docker-compose down -v
docker-compose up -d
```

