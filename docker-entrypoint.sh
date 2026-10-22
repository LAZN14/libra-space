#!/bin/sh
set -e
npx prisma db push
npx tsx prisma/seed.ts
exec node server.js
