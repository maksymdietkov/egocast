#!/usr/bin/env bash
# Ежедневный дамп Postgres EgoCast, хранение KEEP_DAYS дней
# На сервере: /opt/egocast/backup.sh, cron: 15 3 * * * /opt/egocast/backup.sh >> /opt/egocast/backups/backup.log 2>&1
set -euo pipefail

BACKUP_DIR=/opt/egocast/backups
KEEP_DAYS=14

cd /opt/egocast
mkdir -p "$BACKUP_DIR"

TS=$(date +%F_%H%M)
FILE="$BACKUP_DIR/egocast_$TS.sql.gz"
trap 'rm -f "$FILE.tmp"' EXIT

# креды берём из env самого контейнера postgres — .env не трогаем
docker compose --env-file .env --env-file .env.tag exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --clean --if-exists' \
  | gzip > "$FILE.tmp"

mv "$FILE.tmp" "$FILE"
find "$BACKUP_DIR" -name 'egocast_*.sql.gz' -mtime +"$KEEP_DAYS" -delete

echo "$(date -Is) OK $FILE $(du -h "$FILE" | cut -f1)"
