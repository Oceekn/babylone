# Lancer BABYLONE – ce qu’il faut faire

## Une seule fois (ou après un clone)

### 1. Prérequis
- **Node.js 18+** (`node --version`)
- **Docker Desktop** installé et démarré (pour PostgreSQL, Redis, MinIO)
- **npm** (fourni avec Node)

### 2. Backend
```bash
cd backend
npm install
```
Le fichier **`backend/.env`** doit exister. S’il manque, copiez le contenu ci‑dessous dans `backend/.env` (et adaptez les mots de passe si besoin) :

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=babylone_user
DB_PASSWORD=babylone_secure_pass_2024
DB_DATABASE=babylone_prod
DB_SYNCHRONIZE=true

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=babylone_redis_pass_2024

JWT_SECRET=dev_secret_key_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=babylone_admin
MINIO_SECRET_KEY=babylone_minio_pass_2024
MINIO_BUCKET_NAME=babylone-media

FRONTEND_URL=http://localhost:5173
```

Important : **`DB_PASSWORD`** doit être le même que **`POSTGRES_PASSWORD`** dans Docker (par défaut dans `docker-compose.yml` c’est `babylone_secure_pass_2024`).

### 3. Frontend
À la **racine du projet** (dossier BABYLON, pas backend) :
```bash
npm install
```

---

## À chaque lancement

### 1. Démarrer Docker (PostgreSQL, Redis, MinIO)
```bash
cd backend
docker-compose up -d
```
Attendre ~30 secondes que PostgreSQL soit prêt.

### 2. Démarrer le backend
```bash
cd backend
npm run start:dev
```
Laisser ce terminal ouvert. L’API tourne sur **http://localhost:3000/api/v1**.

### 3. Démarrer le frontend
Dans un **autre terminal**, à la racine du projet :
```bash
npm run dev
```
L’app est sur **http://localhost:5173**.

---

## Vérifier que tout marche

1. **Backend** : ouvrir http://localhost:3000/api/v1/health  
   → doit renvoyer du JSON avec `"status":"ok"` ou similaire.

2. **Frontend** : ouvrir http://localhost:5173  
   → écran d’accueil BABYLONE, inscription / connexion possibles.

3. Si le backend ne démarre pas (erreur base de données) :
   - Vérifier que Docker tourne : `docker ps` (postgres, redis, minio doivent être “Up”).
   - Vérifier que `backend/.env` existe et que `DB_PASSWORD` correspond au mot de passe PostgreSQL dans `docker-compose.yml`.

---

## En résumé

| Étape              | Où          | Commande              |
|--------------------|------------|------------------------|
| Docker             | `backend/` | `docker-compose up -d` |
| Backend            | `backend/` | `npm run start:dev`    |
| Frontend           | racine     | `npm run dev`         |

**URLs :**
- Frontend : http://localhost:5173  
- API : http://localhost:3000/api/v1  

Une fois ces étapes faites, tu peux lancer sans problème à chaque fois en suivant « À chaque lancement ».
