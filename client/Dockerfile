FROM node:20

WORKDIR /app

COPY . .

RUN corepack enable

RUN yarn install

WORKDIR /app/client

RUN yarn run build

RUN yarn global add serve

CMD ["serve", "-s", "dist"]