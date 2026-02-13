# BABYLONE Backend API

Backend NestJS pour l'application BABYLONE - Production Nationale (Cameroun & Sous-région)

## 🏗️ Architecture

### Infrastructure
- **Serveur APP**: NestJS API + WebSockets
- **Serveur DATA**: PostgreSQL + PostGIS + Redis
- **Serveur MEDIA**: MinIO (Stockage fichiers)

### Stack Technique
- **Framework**: NestJS 10
- **Database**: PostgreSQL 15 + PostGIS 3.3
- **Cache/Queue**: Redis 7
- **Storage**: MinIO
- **Auth**: JWT + Passport
- **Rate Limiting**: @nestjs/throttler

## 🚀 Installation

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (ou via Docker)

### Setup

1. **Installer les dépendances**
```bash
cd backend
npm install
```

2. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

3. **Lancer les services Docker**
```bash
docker-compose up -d
```

4. **Lancer l'application**
```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentification JWT
│   │   ├── users/         # Gestion utilisateurs
│   │   ├── professionals/ # Profils professionnels
│   │   ├── services/      # Services proposés
│   │   ├── transactions/  # Transactions financières
│   │   ├── chat/          # WebSocket Chat
│   │   ├── social/        # Feed social
│   │   └── storage/       # MinIO Storage
│   ├── config/            # Configurations (DB, Redis)
│   └── main.ts            # Point d'entrée
├── scripts/               # Scripts SQL
└── docker-compose.yml     # Services Docker
```

## 🔐 Sécurité

- **Rate Limiting**: 100 requêtes/minute par défaut
- **JWT**: Expiration 7 jours
- **Password Hashing**: bcrypt (10 rounds)
- **Validation**: class-validator sur tous les DTOs

## 🌍 Multi-Pays

Le système supporte plusieurs pays via le champ `pays_code` (ISO 3166-1 alpha-2):
- `CM`: Cameroun
- `GA`: Gabon
- `TD`: Tchad
- `CG`: Congo

## 📊 Base de Données

### Schéma principal: `babylone`

Les tables principales:
- `users`: Utilisateurs (clients & professionnels)
- `professionals`: Profils professionnels avec géolocalisation PostGIS
- `services`: Services proposés
- `transactions`: Transactions financières

### PostGIS

Pour la recherche géolocalisée:
```sql
-- Index spatial (déjà créé)
CREATE INDEX ON babylone.professionals USING GIST (position_gps);
```

## 🔄 API Endpoints

### Auth
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion

### Users
- `GET /api/v1/users/:id` - Profil utilisateur (JWT requis)

### Professionals
- `GET /api/v1/professionals/search?latitude=&longitude=&radius=` - Recherche par rayon
- `GET /api/v1/professionals/:id` - Détails professionnel

### Services
- `GET /api/v1/services/:id` - Détails service
- `GET /api/v1/services/professional/:professionalId` - Services d'un professionnel

### Transactions
- `GET /api/v1/transactions/my-transactions` - Mes transactions (JWT requis)

## 🐳 Docker Services

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **MinIO**: `localhost:9000` (API), `localhost:9001` (Console)

## 📝 Migrations

```bash
# Générer une migration
npm run migration:generate -- -n MigrationName

# Exécuter les migrations
npm run migration:run

# Revenir en arrière
npm run migration:revert
```

## 🧪 Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 🔒 Production

### Checklist avant déploiement:
- [ ] Changer `JWT_SECRET` et `JWT_REFRESH_SECRET`
- [ ] Configurer `DB_SYNCHRONIZE=false`
- [ ] Activer HTTPS
- [ ] Configurer Cloudflare (DDoS protection)
- [ ] Mettre en place les backups automatiques
- [ ] Configurer le monitoring (Grafana/GlitchTip)

## 📞 Support

Pour toute question, contactez l'équipe BABYLONE.

