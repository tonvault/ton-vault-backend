FROM node:18.13.0-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

FROM node:18.13.0-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NO_COLOR=1

WORKDIR /usr/src/app


RUN apk add curl --no-cache \
    && curl -L https://github.com/ton-blockchain/ton/releases/download/v2023.06/storage-daemon-cli-linux-x86_64 -o /usr/local/bin/storage-daemon-cli \
    && chmod +x /usr/local/bin/storage-daemon-cli


COPY package*.json ./

RUN npm install --only=production

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
