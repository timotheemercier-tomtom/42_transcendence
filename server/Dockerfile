FROM node:20

WORKDIR /app

COPY . .

RUN ls -lah .

RUN corepack enable

RUN yarn install

WORKDIR /app/server

RUN yarn run build

CMD ["yarn", "run", "start:prod"]