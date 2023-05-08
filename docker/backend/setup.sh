#!/bin/bash

date -u

sleep 7

npx prisma generate
npx prisma db push

exec "$@"