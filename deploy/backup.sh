#!/usr/bin/env bash
# Ежедневный дамп Postgres EgoCast: локально храним KEEP_DAYS дней + копия в S3
# (в S3 старые копии удаляет lifecycle-правило бакета, 30 дней).
# На сервере: /opt/egocast/backup.sh, cron: 15 3 * * * /opt/egocast/backup.sh >> /opt/egocast/backups/backup.log 2>&1
# Доступ к S3 — через IAM-роль инстанса (egocast-ec2-role), ключей на сервере нет.
set -euo pipefail

# cron запускает с урезанным PATH, а aws лежит в /usr/local/bin
export PATH=/usr/local/bin:/usr/bin:/bin

BACKUP_DIR=/opt/egocast/backups
KEEP_DAYS=14
S3_BUCKET=egocast-backups-maksym
S3_PREFIX=db
AWS_REGION=eu-north-1

cd /opt/egocast
mkdir -p "$BACKUP_DIR"

TS=$(date +%F_%H%M)
NAME="egocast_$TS.sql.gz"
FILE="$BACKUP_DIR/$NAME"
trap 'rm -f "$FILE.tmp"' EXIT

# креды берём из env самого контейнера postgres — .env не трогаем
docker compose --env-file .env --env-file .env.tag exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --clean --if-exists' \
  | gzip > "$FILE.tmp"

# не отправляем битый архив
gzip -t "$FILE.tmp"

mv "$FILE.tmp" "$FILE"
find "$BACKUP_DIR" -name 'egocast_*.sql.gz' -mtime +"$KEEP_DAYS" -delete

echo "$(date -Is) OK local $FILE $(du -h "$FILE" | cut -f1)"

# off-site копия; при ошибке скрипт упадёт с ненулевым кодом, ошибка попадёт в backup.log
aws s3 cp "$FILE" "s3://$S3_BUCKET/$S3_PREFIX/$NAME" --region "$AWS_REGION" --only-show-errors

echo "$(date -Is) OK s3 s3://$S3_BUCKET/$S3_PREFIX/$NAME"