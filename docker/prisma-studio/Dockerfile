FROM node:18

EXPOSE 5556

COPY ./backend/*.json .
COPY ./backend/prisma/schema.prisma .
COPY ./docker/prisma-studio/setup.sh .

RUN npm install -g npm@9.5.0 -s
RUN npm install -s

ENTRYPOINT ["/bin/sh", "setup.sh"]