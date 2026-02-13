# ✅ PARTIE 3 : LA STRATÉGIE DE SAUVEGARDE (BACKUP) - COMPLÉTÉE

## 🎯 Objectifs atteints

### 1. ✅ Script de Backup Automatique

#### Script Bash (`scripts/backup.sh`)
- **Dump PostgreSQL** : Format custom pour restauration rapide
- **Compression** : Tar.gz pour réduire la taille
- **Chiffrement GPG** : Protection des données sensibles
- **Upload distant** : Support S3, FTP, SFTP via rclone/aws CLI
- **Nettoyage automatique** : Suppression des backups anciens (30 jours par défaut)
- **Métadonnées** : Fichier JSON avec hash, taille, date

**Fonctionnalités :**
- Dump avec schéma `babylone` uniquement
- Format custom PostgreSQL (plus rapide que SQL)
- Chiffrement optionnel avec clé GPG publique
- Support multiple stockages distants
- Gestion des erreurs avec codes de sortie

### 2. ✅ Service de Backup NestJS

#### BackupService
- **`createBackup()`** : Créer un backup manuel
- **`listBackups()`** : Lister tous les backups disponibles
- **`cleanOldBackups()`** : Nettoyer les anciens backups
- **`uploadToRemoteStorage()`** : Upload automatique vers stockage distant

**Fonctionnalités :**
- Intégration avec la configuration NestJS
- Calcul automatique de hash SHA256
- Formatage des tailles (Bytes, KB, MB, GB)
- Gestion des erreurs avec logging
- Support S3, FTP, SFTP

### 3. ✅ Chiffrement GPG

**Configuration :**
```env
BACKUP_ENCRYPTION_KEY=admin@babylone.cm  # Email ou ID de la clé GPG publique
```

**Processus :**
1. Backup créé et compressé
2. Chiffrement avec clé GPG publique
3. Suppression du fichier non chiffré
4. Stockage du fichier `.gpg`

**Sécurité :**
- Seule la clé privée (gardée au Cameroun) peut déchiffrer
- Même si le backup est volé, les données sont protégées
- Légalement défendable (coffre-fort numérique)

### 4. ✅ Planification Automatique (Cron)

#### BackupScheduler
- **Backup quotidien** : Chaque nuit à 3h (fuseau horaire Cameroun)
- **Nettoyage hebdomadaire** : Chaque dimanche à 4h
- **Logging complet** : Suivi de tous les backups

**Configuration :**
```typescript
@Cron('0 3 * * *', {
  name: 'daily-backup',
  timeZone: 'Africa/Douala',
})
```

### 5. ✅ Endpoints API

#### BackupController (Protégé Admin)
- **`POST /api/v1/backup/create`** - Créer un backup manuel (Admin)
- **`GET /api/v1/backup/list`** - Lister les backups (Admin)
- **`POST /api/v1/backup/clean`** - Nettoyer les anciens backups (Admin)

**Sécurité :**
- `JwtAuthGuard` : Authentification requise
- `AdminRoleGuard` : Seuls les admins peuvent accéder

### 6. ✅ Stockage Distant

#### Options Supportées

**1. AWS S3 / Compatible (MinIO, Wasabi)**
```env
BACKUP_REMOTE_STORAGE=s3://bucket-name/backups/
```
- Utilise `aws CLI` ou `rclone`
- Support classe de stockage GLACIER (économique)

**2. FTP / SFTP**
```env
BACKUP_REMOTE_STORAGE=ftp://user:pass@host/backups/
BACKUP_REMOTE_STORAGE=sftp://user:pass@host/backups/
```
- Utilise `rclone`
- Support authentification

**3. Stockage Local (Cameroun)**
- Si `REMOTE_STORAGE` non configuré, backup local uniquement
- Recommandé : Serveur FTP séparé chez ST Digital

### 7. ✅ Métadonnées et Traçabilité

Chaque backup génère un fichier `.metadata.json` :
```json
{
  "backup_date": "2024-01-15_030000",
  "backup_file": "backup_2024-01-15_030000.tar.gz.gpg",
  "backup_size": "125.5 MB",
  "backup_hash": "sha256:abc123...",
  "database": "babylone_prod",
  "encrypted": true,
  "remote_storage": "s3://bucket/backups/",
  "created_at": "2024-01-15T03:00:00.000Z"
}
```

## 📋 Configuration Requise

### Variables d'environnement
```env
# Backup
BACKUP_DIR=/var/backups/babylone
BACKUP_ENCRYPTION_KEY=admin@babylone.cm
BACKUP_REMOTE_STORAGE=s3://babylone-backups/backups/
BACKUP_RETENTION_DAYS=30

# Database (pour le dump)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=babylone_user
DB_PASSWORD=your_password
DB_DATABASE=babylone_prod
```

### Prérequis Système
- `pg_dump` (PostgreSQL client)
- `gpg` (GNU Privacy Guard) - pour le chiffrement
- `tar` et `gzip` - pour la compression
- `aws CLI` ou `rclone` - pour l'upload distant (optionnel)

### Installation rclone (recommandé)
```bash
# Linux
curl https://rclone.org/install.sh | sudo bash

# Configuration
rclone config
```

## 🔒 Sécurité

### Chiffrement
- **Clé publique GPG** : Stockée dans l'environnement
- **Clé privée GPG** : Gardée au Cameroun, jamais sur le serveur
- **Backup chiffré** : Inutile sans la clé privée

### Accès
- **Endpoints protégés** : Seuls les admins peuvent créer/lister
- **Logs** : Tous les backups sont loggés
- **Hash SHA256** : Vérification de l'intégrité

## 📊 Rétention

- **Par défaut** : 30 jours de backups
- **Configurable** : Via `BACKUP_RETENTION_DAYS`
- **Nettoyage automatique** : Chaque dimanche à 4h
- **Nettoyage manuel** : Via endpoint API

## 🚀 Utilisation

### Backup Manuel (API)
```bash
POST /api/v1/backup/create
Headers: Authorization: Bearer <ADMIN_JWT_TOKEN>
```

### Backup Manuel (Script)
```bash
# Exécuter le script directement
bash scripts/backup.sh

# Ou via cron
0 3 * * * /path/to/backend/scripts/backup.sh
```

### Lister les Backups
```bash
GET /api/v1/backup/list
Headers: Authorization: Bearer <ADMIN_JWT_TOKEN>
```

### Restaurer un Backup
```bash
# 1. Déchiffrer (si chiffré)
gpg --decrypt backup_2024-01-15.tar.gz.gpg > backup_2024-01-15.tar.gz

# 2. Décompresser
tar -xzf backup_2024-01-15.tar.gz

# 3. Restaurer
pg_restore -h localhost -U babylone_user -d babylone_prod dump_2024-01-15.dump
```

## ✅ Checklist Partie 3

- [x] Script bash de backup automatique
- [x] Service NestJS pour backup
- [x] Chiffrement GPG
- [x] Upload vers stockage distant (S3/FTP)
- [x] Planification automatique (cron)
- [x] Endpoints API protégés (Admin)
- [x] Nettoyage automatique des anciens backups
- [x] Métadonnées et traçabilité
- [x] Logging complet
- [x] Gestion des erreurs

## 🎯 Prêt pour la Production

La Partie 3 est complète. Le système de backup est :
- **Automatique** : Exécution quotidienne à 3h
- **Chiffré** : Protection des données sensibles
- **Externalisé** : Upload vers stockage distant
- **Traçable** : Métadonnées et logs complets
- **Sécurisé** : Accès restreint aux admins

**Règle d'or respectée** : Le backup est Automatique, Chiffré et Externalisé ! ✅

