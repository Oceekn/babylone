#!/bin/bash

# Script de backup automatique pour BABYLONE
# À exécuter chaque nuit à 3h via cron: 0 3 * * * /path/to/backup.sh

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/babylone}"
DATE=$(date +%F_%H%M%S)
DB_USER="${DB_USER:-babylone_user}"
DB_NAME="${DB_NAME:-babylone_prod}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}" # Clé GPG publique (email ou ID)
REMOTE_STORAGE="${BACKUP_REMOTE_STORAGE}" # Ex: s3://bucket-name ou ftp://user:pass@host
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}" # Garder 30 jours de backups

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting backup at $(date)"

# 1. Dump de la base de données
echo "📦 Creating database dump..."
PGPASSWORD="${DB_PASSWORD}" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --schema=babylone \
  --format=custom \
  --file="$BACKUP_DIR/dump_$DATE.dump" \
  --verbose

if [ $? -ne 0 ]; then
  echo "❌ Database dump failed!"
  exit 1
fi

# 2. Compression
echo "🗜️ Compressing backup..."
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "dump_$DATE.dump"

# Supprimer le dump non compressé
rm -f "$BACKUP_DIR/dump_$DATE.dump"

# 3. Chiffrement GPG (si la clé est définie)
if [ -n "$ENCRYPTION_KEY" ]; then
  echo "🔐 Encrypting backup..."
  gpg --batch --yes --encrypt --recipient "$ENCRYPTION_KEY" \
    --output "$BACKUP_DIR/backup_$DATE.tar.gz.gpg" \
    "$BACKUP_DIR/backup_$DATE.tar.gz"
  
  if [ $? -eq 0 ]; then
    # Supprimer le fichier non chiffré
    rm -f "$BACKUP_DIR/backup_$DATE.tar.gz"
    BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz.gpg"
  else
    echo "⚠️ Encryption failed, keeping unencrypted backup"
    BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"
  fi
else
  echo "⚠️ No encryption key provided, backup is not encrypted"
  BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"
fi

# 4. Calculer la taille et le hash
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_HASH=$(sha256sum "$BACKUP_FILE" | cut -d' ' -f1)

echo "✅ Backup created: $BACKUP_FILE"
echo "📊 Size: $BACKUP_SIZE"
echo "🔑 Hash: $BACKUP_HASH"

# 5. Envoi vers stockage distant (si configuré)
if [ -n "$REMOTE_STORAGE" ]; then
  echo "☁️ Uploading to remote storage..."
  
  # Détecter le type de stockage
  if [[ "$REMOTE_STORAGE" == s3://* ]]; then
    # AWS S3 ou compatible (MinIO, Wasabi, etc.)
    if command -v aws &> /dev/null; then
      aws s3 cp "$BACKUP_FILE" "$REMOTE_STORAGE/backups/" --storage-class GLACIER
      echo "✅ Uploaded to S3"
    elif command -v rclone &> /dev/null; then
      rclone copy "$BACKUP_FILE" "$REMOTE_STORAGE/backups/"
      echo "✅ Uploaded via rclone"
    else
      echo "⚠️ Neither aws CLI nor rclone found. Install one to enable remote storage."
    fi
  elif [[ "$REMOTE_STORAGE" == ftp://* ]] || [[ "$REMOTE_STORAGE" == sftp://* ]]; then
    # FTP/SFTP
    if command -v rclone &> /dev/null; then
      rclone copy "$BACKUP_FILE" "$REMOTE_STORAGE/backups/"
      echo "✅ Uploaded via FTP/SFTP"
    else
      echo "⚠️ rclone not found. Install it to enable FTP/SFTP upload."
    fi
  else
    echo "⚠️ Unknown remote storage format: $REMOTE_STORAGE"
  fi
else
  echo "ℹ️ Remote storage not configured. Backup stored locally only."
fi

# 6. Nettoyage des anciens backups (garder RETENTION_DAYS jours)
echo "🧹 Cleaning old backups (keeping $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.tar.gz*" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "dump_*.dump" -mtime +7 -delete

# 7. Créer un fichier de métadonnées
METADATA_FILE="$BACKUP_DIR/backup_$DATE.metadata.json"
cat > "$METADATA_FILE" <<EOF
{
  "backup_date": "$DATE",
  "backup_file": "$(basename $BACKUP_FILE)",
  "backup_size": "$BACKUP_SIZE",
  "backup_hash": "$BACKUP_HASH",
  "database": "$DB_NAME",
  "encrypted": $([ -n "$ENCRYPTION_KEY" ] && echo "true" || echo "false"),
  "remote_storage": $([ -n "$REMOTE_STORAGE" ] && echo "\"$REMOTE_STORAGE\"" || echo "null"),
  "created_at": "$(date -Iseconds)"
}
EOF

echo "✅ Backup completed successfully at $(date)"
echo "📄 Metadata: $METADATA_FILE"
