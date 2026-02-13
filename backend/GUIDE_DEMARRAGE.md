# 🚀 GUIDE DE DÉMARRAGE - BACKEND BABYLONE

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **Docker** et **Docker Compose** ([Télécharger](https://www.docker.com/))
- **npm** ou **yarn** (inclus avec Node.js)
- **Git** (pour cloner le projet)

### Vérifier les prérequis

```bash
# Vérifier Node.js
node --version  # Doit être >= 18.0.0

# Vérifier npm
npm --version

# Vérifier Docker
docker --version

# Vérifier Docker Compose
docker-compose --version
```

---

## 🏁 Étapes de Démarrage

### Étape 1 : Aller dans le dossier backend

```bash
cd backend
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

Cette commande installe toutes les dépendances NestJS, TypeORM, Redis, MinIO, etc.

**⏱️ Durée estimée : 2-5 minutes**

---

### Étape 3 : Configurer les variables d'environnement

#### Option A : Configuration de développement (rapide)

Créez un fichier `.env` à la racine du dossier `backend` :

```bash
# Copier le fichier d'exemple (s'il existe)
cp .env.example .env

# Ou créer directement
touch .env
```

Puis ajoutez ce contenu dans `.env` :

```env
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
DB_SYNCHRONIZE=false

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

# CinetPay (Sandbox pour développement)
CINETPAY_API_KEY=your_cinetpay_api_key
CINETPAY_SITE_ID=your_site_id
CINETPAY_SECRET_KEY=your_secret_key

# URLs
FRONTEND_URL=http://localhost:5173

# Backup (optionnel pour développement)
BACKUP_DIR=./backups
BACKUP_ENCRYPTION_KEY=
BACKUP_REMOTE_STORAGE=
BACKUP_RETENTION_DAYS=7
```

#### Option B : Générer des secrets sécurisés (recommandé)

```bash
# Générer JWT_SECRET
openssl rand -base64 32

# Générer JWT_REFRESH_SECRET
openssl rand -base64 32

# Copier les résultats dans votre .env
```

---

### Étape 4 : Démarrer les services Docker

Les services nécessaires (PostgreSQL + PostGIS, Redis, MinIO) sont configurés dans `docker-compose.yml`.

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier que les services sont démarrés
docker-compose ps
```

Vous devriez voir 3 services en cours d'exécution :
- `babylone_postgres` (PostgreSQL + PostGIS)
- `babylone_redis` (Redis)
- `babylone_minio` (MinIO)

**⏱️ Durée estimée : 1-2 minutes (premier lancement plus long)**

#### Vérifier les logs

```bash
# Voir les logs de tous les services
docker-compose logs

# Voir les logs d'un service spécifique
docker-compose logs postgres
docker-compose logs redis
docker-compose logs minio
```

#### Accéder aux services

- **PostgreSQL** : `localhost:5432`
- **Redis** : `localhost:6379`
- **MinIO Console** : `http://localhost:9001` (Admin: `babylone_admin` / `babylone_minio_pass_2024`)

---

### Étape 5 : Exécuter les migrations de base de données

```bash
# Compiler le projet TypeScript
npm run build

# Exécuter les migrations
npm run migration:run
```

**Note** : Si la commande `migration:run` n'existe pas encore, vous pouvez :

1. Créer les tables manuellement via SQL
2. Utiliser `DB_SYNCHRONIZE=true` en développement (⚠️ PAS en production)
3. Utiliser TypeORM CLI pour générer les migrations

#### Alternative : Synchronisation automatique (développement uniquement)

Si vous voulez éviter les migrations en développement, modifiez `.env` :

```env
DB_SYNCHRONIZE=true  # ⚠️ UNIQUEMENT en développement
```

**⚠️ ATTENTION** : Ne jamais utiliser `synchronize: true` en production !

---

### Étape 6 : Démarrer l'application

#### Mode Développement (avec hot-reload)

```bash
npm run start:dev
```

L'application va démarrer sur `http://localhost:3000`

#### Mode Production

```bash
# Build
npm run build

# Démarrer
npm run start:prod
```

#### Mode Débogage

```bash
npm run start:debug
```

---

### Étape 7 : Vérifier que l'application fonctionne

#### Vérifier le health check simple

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/health" | Select-Object -ExpandProperty Content

# Windows CMD / Linux / Mac
curl http://localhost:3000/api/v1/health
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0"
}
```

#### Vérifier le health check détaillé

```bash
curl http://localhost:3000/api/v1/health/detailed
```

#### Tester l'API root

```bash
curl http://localhost:3000/api/v1/
```

---

## ✅ Vérification Complète

### Checklist

- [ ] ✅ Docker Compose fonctionne (`docker-compose ps`)
- [ ] ✅ PostgreSQL accessible (logs sans erreur)
- [ ] ✅ Redis accessible (logs sans erreur)
- [ ] ✅ MinIO accessible (console sur http://localhost:9001)
- [ ] ✅ Application démarre (`npm run start:dev`)
- [ ] ✅ Health check répond (`/api/v1/health`)
- [ ] ✅ Pas d'erreur dans les logs

---

## 🛠️ Commandes Utiles

### Gestion Docker

```bash
# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Redémarrer un service
docker-compose restart postgres

# Voir les logs en temps réel
docker-compose logs -f
```

### Base de données

```bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U babylone_user -d babylone_prod

# Lister les tables
docker-compose exec postgres psql -U babylone_user -d babylone_prod -c "\dt babylone.*"
```

### Application

```bash
# Build
npm run build

# Lancer en développement
npm run start:dev

# Lancer en production
npm run start:prod

# Voir les logs
npm run start:dev  # Les logs s'affichent dans le terminal
```

---

## 🐛 Résolution de Problèmes

### Problème 1 : Port déjà utilisé

**Erreur** : `EADDRINUSE: address already in use :::3000`

**Solution** :
```bash
# Changer le port dans .env
PORT=3001
```

Ou arrêter le processus qui utilise le port :
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Problème 2 : Docker ne démarre pas

**Erreur** : `Cannot connect to Docker daemon`

**Solution** :
- Vérifier que Docker Desktop est démarré
- Vérifier les permissions Docker

### Problème 3 : PostgreSQL ne démarre pas

**Erreur** : `FATAL: password authentication failed`

**Solution** :
- Vérifier que le mot de passe dans `.env` correspond à celui dans `docker-compose.yml`
- Réinitialiser : `docker-compose down -v` puis `docker-compose up -d`

### Problème 4 : Erreur de migration

**Erreur** : `Migration failed`

**Solution** :
```bash
# Vérifier que la base de données existe
docker-compose exec postgres psql -U babylone_user -l

# Créer la base si nécessaire
docker-compose exec postgres psql -U babylone_user -c "CREATE DATABASE babylone_prod;"

# Réessayer les migrations
npm run migration:run
```

### Problème 5 : MinIO n'est pas accessible

**Erreur** : `Error: connect ECONNREFUSED`

**Solution** :
```bash
# Vérifier que MinIO est démarré
docker-compose ps minio

# Voir les logs
docker-compose logs minio

# Redémarrer
docker-compose restart minio
```

### Problème 6 : Erreur de build TypeScript

**Erreur** : `Cannot find module '...'`

**Solution** :
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Vérifier les dépendances
npm list --depth=0
```

---

## 📚 Prochaines Étapes

Une fois l'application démarrée :

1. **Tester l'API** :
   - Créer un utilisateur : `POST /api/v1/auth/register`
   - Se connecter : `POST /api/v1/auth/login`
   - Tester les endpoints

2. **Documentation API** :
   - Les endpoints sont documentés dans chaque module
   - Utiliser Postman ou Insomnia pour tester

3. **Accéder à MinIO Console** :
   - URL : http://localhost:9001
   - User : `babylone_admin`
   - Password : `babylone_minio_pass_2024`

4. **Monitoring** :
   - Health checks : `/api/v1/health`
   - Logs : Voir le terminal où l'application tourne

---

## 🚀 Démarrage Rapide (Résumé)

```bash
# 1. Aller dans backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Créer .env (copier le contenu ci-dessus)

# 4. Démarrer Docker
docker-compose up -d

# 5. Attendre 30 secondes que les services démarrent

# 6. Build et migrations
npm run build
npm run migration:run  # Ou utiliser DB_SYNCHRONIZE=true

# 7. Démarrer l'application
npm run start:dev

# 8. Vérifier
curl http://localhost:3000/api/v1/health
```

**🎉 L'application est maintenant lancée !**

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs : `docker-compose logs` et les logs de l'application
2. Vérifier que tous les services sont démarrés : `docker-compose ps`
3. Vérifier les variables d'environnement dans `.env`
4. Consulter la section "Résolution de Problèmes" ci-dessus

**Bonne chance ! 🚀**

