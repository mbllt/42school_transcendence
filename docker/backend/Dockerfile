FROM node:18

EXPOSE 5555

WORKDIR /usr/src/app

COPY ./backend/ .
COPY ./docker/backend/setup.sh ./setup.sh

#RUN npm install -g npm@9.5.0 -s
RUN npm install -s

ENTRYPOINT [ "bash", "setup.sh" ]

CMD [ "npm", "run", "start:dev" ]