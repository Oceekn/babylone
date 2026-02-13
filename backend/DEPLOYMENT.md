# 🚀 Guide de Déploiement - BABYLONE Backend

## 📋 Feuille de Route de Déploiement

### Mois 1-2 : Développement Backend ✅
- [x] Phase 1 : Le socle multi-pays
- [x] Phase 2 : Marketplace & Géolocalisation
- [x] Phase 3 : Le système financier
- [x] Phase 4 : Chat & Social
- [x] Partie 3 : Stratégie de sauvegarde

### Mois 3 (Semaine 1-2) : Alpha Test (Interne)
- [ ] Déploiement sur serveur de test
- [ ] Tests internes par l'équipe
- [ ] Correction des bugs critiques
- [ ] Tests de sécurité

### Mois 3 (Semaine 3-4) : Load Testing (Crash Test)
- [ ] Simulation de 5000 utilisateurs
- [ ] Optimisation des performances
- [ ] Ajustement de la configuration PostgreSQL
- [ ] Tests de scalabilité

### Mois 4 : Soft Launch (Ville Pilote)
- [ ] Déploiement à Douala uniquement
- [ ] Tests avec utilisateurs réels
- [ ] Vérification géolocalisation
- [ ] Tests de paiement

### Mois 5 : Lancement National & Extension
- [ ] Ouverture Yaoundé, Bafoussam, etc.
- [ ] Préparation option "Pays" (Gabon, Tchad, Congo)
- [ ] Monitoring et support

## 🏗️ Architecture de Production

### Serveurs

**1. Serveur APP (4 vCPU, 8 Go RAM)**
- NestJS API
- WebSockets (Socket.io)
- Nginx (Reverse Proxy)

**2. Serveur DATA (4 vCPU, 16 Go RAM)**
- PostgreSQL + PostGIS
- Redis

**3. Serveur MEDIA (2 vCPU, 8 Go RAM, 1 To)**
- MinIO (Stockage fichiers)

### Infrastructure

- **Load Balancer** : Nginx
- **CDN/Protection DDoS** : Cloudflare
- **Monitoring** : GlitchTip / Grafana
- **Backups** : Automatiques (3h du matin)

## 📦 Prérequis

### Sur le Serveur APP
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (Process Manager)
sudo npm install -g pm2

# Docker & Docker Compose
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Nginx
sudo apt-get install nginx

# Certificats SSL (Let's Encrypt)
sudo apt-get install certbot python3-certbot-nginx
```

### Sur le Serveur DATA
```bash
# PostgreSQL 15 + PostGIS
# (Déjà dans docker-compose.yml)

# Redis 7
# (Déjà dans docker-compose.yml)
```

## 🚀 Déploiement

### 1. Cloner le Repository
```bash
cd /opt
git clone https://github.com/babylone/backend.git
cd backend
```

### 2. Configurer l'Environnement
```bash
# Copier le fichier d'environnement
cp .env.production .env

# Éditer avec les vraies valeurs
nano .env
```

**Variables critiques à changer :**
- `JWT_SECRET` : Générer avec `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` : Générer avec `openssl rand -base64 32`
- `DB_PASSWORD` : Mot de passe fort
- `REDIS_PASSWORD` : Mot de passe fort
- `MINIO_ACCESS_KEY` et `MINIO_SECRET_KEY` : Clés fortes
- `CINETPAY_*` : Clés de production

### 3. Installer les Dépendances
```bash
npm install
```

### 4. Lancer les Services Docker
```bash
# Démarrer PostgreSQL, Redis, MinIO
docker-compose up -d

# Vérifier que les services sont prêts
docker-compose ps
```

### 5. Exécuter les Migrations
```bash
npm run migration:run
```

### 6. Build et Déploiement
```bash
# Build de l'application
npm run build

# Déployer avec le script
chmod +x scripts/deploy.sh
./scripts/deploy.sh production v1.0.0
```

### 7. Configurer Nginx
```bash
# Copier la configuration
sudo cp nginx/nginx.conf /etc/nginx/sites-available/babylone-backend

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/babylone-backend /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 8. Configurer SSL (Let's Encrypt)
```bash
sudo certbot --nginx -d api.babylone.cm
```

### 9. Configurer PM2 (Production)
```bash
# Créer le fichier ecosystem.config.js
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'babylone-backend',
    script: 'dist/main.js',
    instances: 2, // Nombre d'instances (CPU cores)
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
  }]
};
EOF

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
```

### 10. Configurer Cloudflare (Optionnel)
1. Ajouter le domaine dans Cloudflare
2. Configurer les DNS (A record vers l'IP du serveur)
3. Activer le proxy (orange cloud)
4. Configurer les règles de rate limiting dans Cloudflare

## 🧪 Load Testing

### Installer k6
```bash
# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D53
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Exécuter le Test
```bash
chmod +x scripts/load-test.sh
./scripts/load-test.sh
```

### Objectifs de Performance
- **95% des requêtes < 500ms**
- **Taux d'erreur < 1%**
- **Support de 1000+ utilisateurs simultanés**

## 📊 Monitoring

### Health Check
```bash
# Health check simple
curl http://localhost:3000/api/v1/health

# Health check détaillé
curl http://localhost:3000/api/v1/health/detailed
```

### PM2 Monitoring
```bash
# Statut des processus
pm2 status

# Logs en temps réel
pm2 logs babylone-backend

# Monitoring
pm2 monit
```

### PostgreSQL Monitoring
```sql
-- Vérifier les connexions actives
SELECT count(*) FROM pg_stat_activity;

-- Vérifier la taille de la base
SELECT pg_size_pretty(pg_database_size('babylone_prod'));

-- Vérifier les index
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

## 🔧 Optimisations Production

### PostgreSQL
```sql
-- Dans postgresql.conf
shared_buffers = 4GB          # 25% de la RAM
effective_cache_size = 12GB   # 75% de la RAM
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1        # Pour SSD
effective_io_concurrency = 200
work_mem = 20MB
min_wal_size = 1GB
max_wal_size = 4GB
max_connections = 200
```

### Redis
```conf
# Dans redis.conf
maxmemory 8gb
maxmemory-policy allkeys-lru
save ""  # Désactiver la persistance si Redis est utilisé uniquement pour cache
```

## 🚨 Troubleshooting

### L'application ne démarre pas
```bash
# Vérifier les logs
pm2 logs babylone-backend

# Vérifier les variables d'environnement
pm2 env 0

# Redémarrer
pm2 restart babylone-backend
```

### Base de données lente
```sql
-- Vérifier les requêtes lentes
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Analyser une table
ANALYZE babylone.users;
```

### Redis ne répond pas
```bash
# Vérifier le statut
docker-compose exec redis redis-cli ping

# Vérifier la mémoire
docker-compose exec redis redis-cli info memory
```

## 📝 Checklist de Déploiement

### Avant le Déploiement
- [ ] Toutes les variables d'environnement configurées
- [ ] JWT secrets générés (forts et uniques)
- [ ] Certificats SSL configurés
- [ ] Nginx configuré et testé
- [ ] Migrations exécutées
- [ ] Backups configurés

### Après le Déploiement
- [ ] Health check OK
- [ ] Load testing réussi
- [ ] Monitoring configuré
- [ ] Logs vérifiés
- [ ] Documentation à jour

## 🎯 Prochaines Étapes

1. **Alpha Test** : Déployer sur serveur de test
2. **Load Testing** : Tester avec 5000 utilisateurs
3. **Soft Launch** : Douala uniquement
4. **Lancement National** : Toutes les villes du Cameroun
5. **Extension** : Gabon, Tchad, Congo

