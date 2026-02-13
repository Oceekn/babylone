# BABYLONE - Messagerie Social Services

Application complète (frontend + backend) pour la plateforme BABYLONE : messagerie, social, services, réservations, portefeuille.

## Lancer l’application

**Pour tout détaillé (Docker, .env, ordre des commandes), voir [DEMARRAGE.md](./DEMARRAGE.md).**

En bref :
1. **Docker** (depuis `backend/`) : `docker-compose up -d`
2. **Backend** (depuis `backend/`) : `npm run start:dev`
3. **Frontend** (à la racine) : `npm run dev`

- Frontend : **http://localhost:5173**
- API : **http://localhost:3000/api/v1**

## Installation (une fois)

À la racine du projet (frontend) :
```bash
npm install
```

Dans `backend/` (backend) :
```bash
cd backend
npm install
```
Un fichier `backend/.env` est requis ; voir [DEMARRAGE.md](./DEMARRAGE.md) pour le contenu.

## 🏗️ Structure du Projet

- **Onboarding & Auth**: Écrans de bienvenue, inscription, connexion, vérification
- **Client**: Feed d'accueil, messages, chat
- **Social**: Feed social, création de posts/stories, groupes
- **Services**: Recherche, réservation, paiement
- **Bookings**: Gestion des réservations, suivi, avis
- **Wallet**: Portefeuille numérique, transactions
- **Profile**: Profil utilisateur, paramètres, favoris
- **Professional**: Dashboard professionnel, gestion des services, finances

## 🎨 Design

L'application utilise une palette de couleurs moderne:
- Bleu clair (#4A90E2) pour les éléments principaux
- Rouge (#E53935) pour les actions importantes
- Blanc et gris pour les arrière-plans

## 📦 Technologies

- React 18
- TypeScript
- React Router
- Vite
- Lucide React (icônes)

## 📝 Routes Principales

- `/` - Écran de bienvenue
- `/login` - Connexion
- `/signup/*` - Inscription (3 étapes)
- `/client/home` - Feed client
- `/messages` - Liste des messages
- `/social` - Feed social
- `/services` - Recherche de services
- `/bookings` - Mes réservations
- `/wallet` - Portefeuille
- `/profile` - Profil utilisateur
- `/professional/*` - Dashboard professionnel




