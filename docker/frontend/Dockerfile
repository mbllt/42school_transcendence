FROM node:18

EXPOSE 5173

WORKDIR /usr/src/app

COPY ./frontend/package*.json .
COPY ./frontend/ .
COPY ./docker/frontend/setup.sh ./setup.sh

#RUN npm install -g npm@9.5.0 -s
RUN npm install -s

ENTRYPOINT [ "bash", "setup.sh" ]

CMD [ "npm", "run", "dev" ]