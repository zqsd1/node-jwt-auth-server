FROM node:lts

ENV NODE_ENV=production

WORKDIR /home/node/app

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

USER node

COPY package.json ./

RUN npm i

COPY --chown=node:node . .

EXPOSE 3200

CMD [ "node","index.js" ]