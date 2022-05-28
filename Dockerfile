FROM node:15.14.0-slim
COPY . /usr/src/app/
WORKDIR /usr/src/app/web
RUN npm install && npm run build
WORKDIR /usr/src/app
RUN npm install
ENV NODE_ENV=production NODE_OPTIONS=--openssl-legacy-provider PORT=3000
ENV CLIENT_ID="xyz" CLIENT_SECRET="abc" TOKEN="pqr" PARENT_FOLDER="def"
CMD [ "node", "index.js" ]
