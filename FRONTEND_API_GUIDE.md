# Guide de Connexion Frontend-Backend

## Configuration

Le frontend est maintenant configuré pour se connecter au backend. Voici ce qui a été mis en place :

### Fichiers créés

1. **`src/config/api.ts`** : Configuration de l'URL de l'API et tous les endpoints
2. **`src/services/api.ts`** : Service API de base avec axios et intercepteurs
3. **`src/services/auth.service.ts`** : Service d'authentification
4. **`src/services/professionals.service.ts`** : Exemple de service pour les professionnels

### Configuration Vite

Le fichier `vite.config.ts` a été mis à jour :
- Port du frontend : `5173` (au lieu de 3000 pour éviter le conflit avec le backend)
- Proxy configuré pour rediriger `/api` vers `http://localhost:3000`

### Variables d'environnement

Créez un fichier `.env` à la racine du projet frontend :

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Installation

Installez la dépendance axios :

```bash
npm install
```

## Utilisation

### Exemple : Connexion (Login)

```typescript
import { authService } from '../services/auth.service';

// Dans votre composant
const handleLogin = async () => {
  try {
    const response = await authService.login({
      telephone: '+237XXXXXXXXX',
      password: 'votre_mot_de_passe'
    });
    
    // Le token est automatiquement stocké dans localStorage
    console.log('Connexion réussie:', response);
    navigate('/client/home');
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};
```

### Exemple : Recherche de professionnels

```typescript
import { professionalsService } from '../services/professionals.service';

// Rechercher des professionnels près de Douala
const searchProfessionals = async () => {
  try {
    const professionals = await professionalsService.search({
      latitude: 4.0500,
      longitude: 9.7000,
      radius: 5000, // 5km
      pays_code: 'CM',
      profession: 'Plombier'
    });
    
    console.log('Professionnels trouvés:', professionals);
  } catch (error) {
    console.error('Erreur de recherche:', error);
  }
};
```

### Exemple : Utilisation directe de l'API

```typescript
import { api } from '../services/api';
import { API_ENDPOINTS } from '../config/api';

// GET request
const getUser = async (userId: string) => {
  try {
    const user = await api.get(API_ENDPOINTS.USERS.GET_BY_ID(userId));
    return user;
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// POST request
const createPost = async (content: string) => {
  try {
    const post = await api.post(API_ENDPOINTS.SOCIAL.CREATE_POST, {
      content,
      pays_code: 'CM'
    });
    return post;
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## Fonctionnalités automatiques

### Gestion du token JWT

- Le token est automatiquement ajouté à chaque requête via l'intercepteur
- Le token est stocké dans `localStorage` avec la clé `auth_token`
- En cas d'erreur 401 (non autorisé), l'utilisateur est automatiquement déconnecté et redirigé vers `/login`

### Gestion des erreurs

- Les erreurs sont automatiquement gérées par les intercepteurs
- Les erreurs sont loggées dans la console
- Les erreurs 401 déclenchent une déconnexion automatique

## Endpoints disponibles

Tous les endpoints sont définis dans `src/config/api.ts` :

- **Auth** : `/auth/login`, `/auth/register`
- **Users** : `/users/:id`
- **Professionals** : `/professionals/search`, `/professionals/my-profile`, etc.
- **Services** : `/services`, `/services/:id`, etc.
- **Wallet** : `/wallet/balance`, `/wallet`
- **Transactions** : `/transactions/my-transactions`
- **Payments** : `/payments/initialize`, `/payments/:id`
- **Chat** : `/chat/conversations`, `/chat/conversations/:id/messages`
- **Social** : `/social/feed`, `/social/posts`
- **Storage** : `/storage/upload`
- **Health** : `/health`, `/health/detailed`

## Prochaines étapes

1. **Installer axios** : `npm install`
2. **Mettre à jour les écrans** pour utiliser les services API
3. **Tester la connexion** en utilisant l'écran de login

## Exemple complet : Mise à jour du LoginScreen

Vous pouvez mettre à jour `src/screens/onboarding/LoginScreen.tsx` pour utiliser le service d'authentification :

```typescript
import { authService } from '../../services/auth.service';

const handleLogin = async () => {
  try {
    // Extraire le numéro de téléphone du champ emailOrPhone
    const telephone = formData.emailOrPhone.startsWith('+') 
      ? formData.emailOrPhone 
      : `+237${formData.emailOrPhone}`;
    
    await authService.login({
      telephone,
      password: formData.password
    });
    
    // Rediriger selon le type de compte
    const user = authService.getUserFromToken();
    if (user?.role === 'professional') {
      navigate('/professional/dashboard');
    } else {
      navigate('/client/home');
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    // Afficher un message d'erreur à l'utilisateur
  }
};
```

