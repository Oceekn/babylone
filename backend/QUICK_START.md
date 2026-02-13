# ⚡ DÉMARRAGE RAPIDE - BACKEND BABYLONE

## 🚀 En 5 Minutes

### 1️⃣ Prérequis (une seule fois)

Vérifier que vous avez :
- ✅ Node.js 18+ (`node --version`)
- ✅ Docker Desktop démarré
- ✅ Git installé

### 2️⃣ Installation

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install
```

### 3️⃣ Configuration

Créez un fichier `.env` dans `backend/` avec ce contenu minimal :

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

### 4️⃣ Démarrer Docker

```bash
docker-compose up -d
```

Attendre 30 secondes que les services démarrent.

### 5️⃣ Démarrer l'application

```bash
npm run start:dev
```

### 6️⃣ Vérifier

Ouvrir un autre terminal et tester :

```bash
curl http://localhost:3000/api/v1/health
```

**✅ Si vous voyez `{"status":"ok",...}`, c'est bon !**

---

## 📖 Guide Complet

Pour plus de détails, voir **[GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md)**

---

## 🐛 Problèmes ?

### Port 3000 déjà utilisé ?
```bash
# Changer dans .env
PORT=3001
```

### Docker ne démarre pas ?
- Vérifier que Docker Desktop est lancé
- `docker-compose ps` pour voir l'état

### Erreur de base de données ?
```bash
# Réinitialiser Docker
docker-compose down -v
docker-compose up -d
```

---

**🎉 C'est tout ! Votre backend est prêt.**

