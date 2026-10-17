#!/bin/sh
set -eu
printf '%s\n' 'Aplicando migrations Prisma…'
npx prisma migrate deploy
if [ "${SEED_ON_STARTUP:-true}" = "true" ]; then
  printf '%s\n' 'Executando seed idempotente…'
  npx prisma db seed
fi
exec npm start
