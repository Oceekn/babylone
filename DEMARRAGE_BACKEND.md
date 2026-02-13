# 🚀 Guide de Démarrage du Backend

## ⚠️ Erreur: `ERR_CONNECTION_REFUSED`

Si vous voyez cette erreur, c'est que le **backend n'est pas démarré**.

## 📋 Étapes pour Démarrer le Backend

### 1. Vérifier que Docker est en cours d'exécution
```powershell
docker ps
```

Si Docker n'est pas démarré, lancez Docker Desktop.

### 2. Démarrer les services Docker (PostgreSQL, Redis, MinIO)
```powershell
cd backend
docker-compose up -d
```

Ou utilisez le script PowerShell :
```powershell
.\start-services.ps1
```

### 3. Vérifier que le fichier `.env` existe
```powershell
cd backend
Test-Path .env
```

Si le fichier n'existe pas, créez-le :
```powershell
.\create-env.ps1
```

### 4. Installer les dépendances (si nécessaire)
```powershell
cd backend
npm install
```

### 5. Démarrer le backend NestJS
```powershell
cd backend
npm run start:dev
```

Le backend devrait démarrer sur `http://localhost:3000`

## ✅ Vérification

Une fois le backend démarré, vous devriez voir :
```
[Nest] INFO  [NestFactory] Starting Nest application...
[Nest] INFO  [InstanceLoader] AppModule dependencies initialized
[Nest] INFO  [NestApplication] Nest application successfully started
```

## 🔍 Test de Connexion

Ouvrez votre navigateur et allez sur :
```
http://localhost:3000/api/v1/health
```

Vous devriez voir une réponse JSON avec le statut du serveur.

## 🐛 Dépannage

### Le backend ne démarre pas
1. Vérifiez que le port 3000 n'est pas déjà utilisé
2. Vérifiez les logs : `npm run start:dev`
3. Vérifiez que PostgreSQL est accessible : `docker ps`

### Erreur de connexion à la base de données
1. Vérifiez que Docker est démarré : `docker ps`
2. Vérifiez que les conteneurs sont en cours d'exécution : `docker-compose ps`
3. Redémarrez les services : `docker-compose restart`

### Erreur MinIO
1. Vérifiez que le port 9000 n'est pas utilisé
2. Vérifiez les variables d'environnement dans `.env`

## 📝 Commandes Utiles

```powershell
# Voir les logs du backend
cd backend
npm run start:dev

# Voir les logs Docker
docker-compose logs -f

# Redémarrer tous les services
docker-compose restart

# Arrêter tous les services
docker-compose down

# Voir le statut des conteneurs
docker-compose ps
```
