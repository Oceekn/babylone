# 🔧 Guide de Résolution des Problèmes

## ❌ Erreur : "authentification par mot de passe échouée pour l'utilisateur 'babylone_user'"

Cette erreur indique que l'application NestJS ne peut pas se connecter à PostgreSQL. Voici les étapes pour résoudre le problème :

### ✅ Solution 1 : Vérifier que Docker est démarré

1. **Vérifier que Docker Desktop est en cours d'exécution** (Windows)
   - Ouvrez Docker Desktop
   - Assurez-vous qu'il est démarré (icône dans la barre des tâches)

2. **Démarrer les conteneurs Docker** :
   ```powershell
   cd backend
   docker-compose up -d
   ```

3. **Vérifier que les conteneurs sont démarrés** :
   ```powershell
   docker-compose ps
   ```
   
   Vous devriez voir :
   - `babylone_postgres` - Status: Up
   - `babylone_redis` - Status: Up
   - `babylone_minio` - Status: Up

### ✅ Solution 2 : Vérifier le fichier .env

Le fichier `.env` doit exister dans le dossier `backend/` et contenir les bonnes valeurs :

```env
# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=babylone_user
DB_PASSWORD=babylone_secure_pass_2024
DB_DATABASE=babylone_prod
DB_SYNCHRONIZE=false
```

**Important** : Le mot de passe dans `.env` doit correspondre à celui dans `docker-compose.yml` :
- Dans `docker-compose.yml` : `POSTGRES_PASSWORD: ${DB_PASSWORD:-babylone_secure_pass_2024}`
- Dans `.env` : `DB_PASSWORD=babylone_secure_pass_2024`

### ✅ Solution 3 : Recréer les conteneurs (si nécessaire)

Si les conteneurs existent mais ne fonctionnent pas correctement :

```powershell
cd backend
docker-compose down
docker-compose up -d
```

### ✅ Solution 4 : Vérifier les logs PostgreSQL

Pour voir les logs du conteneur PostgreSQL :

```powershell
docker logs babylone_postgres
```

### ✅ Solution 5 : Tester la connexion manuellement

Pour tester la connexion PostgreSQL directement :

```powershell
docker exec -it babylone_postgres psql -U babylone_user -d babylone_prod
```

Si cela fonctionne, vous devriez voir le prompt PostgreSQL.

### 🔍 Vérification complète

Exécutez ces commandes dans l'ordre :

```powershell
# 1. Aller dans le dossier backend
cd backend

# 2. Vérifier que Docker est installé
docker --version

# 3. Démarrer les conteneurs
docker-compose up -d

# 4. Attendre 10-15 secondes que PostgreSQL démarre
Start-Sleep -Seconds 15

# 5. Vérifier le statut
docker-compose ps

# 6. Vérifier les logs PostgreSQL
docker logs babylone_postgres --tail 20

# 7. Relancer l'application
npm run start:dev
```

### ⚠️ Problèmes courants

1. **Docker Desktop n'est pas démarré**
   - Solution : Démarrer Docker Desktop

2. **Le port 5432 est déjà utilisé**
   - Solution : Arrêter l'autre instance PostgreSQL ou changer le port dans `docker-compose.yml`

3. **Le mot de passe ne correspond pas**
   - Solution : Vérifier que `DB_PASSWORD` dans `.env` correspond à `POSTGRES_PASSWORD` dans `docker-compose.yml`

4. **Les conteneurs sont arrêtés**
   - Solution : `docker-compose up -d` pour les redémarrer

### 📝 Commandes utiles

```powershell
# Voir tous les conteneurs
docker ps -a

# Voir les logs en temps réel
docker-compose logs -f postgres

# Arrêter tous les conteneurs
docker-compose down

# Redémarrer un conteneur spécifique
docker-compose restart postgres

# Supprimer et recréer les volumes (⚠️ supprime les données)
docker-compose down -v
docker-compose up -d
```

