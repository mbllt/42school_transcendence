#!/bin/sh

sleep 7

cat <<EOF > schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
generator client {
  provider = "prisma-client-js"
}
EOF

node_modules/.bin/prisma db pull

exec node_modules/.bin/prisma studio -p 5556