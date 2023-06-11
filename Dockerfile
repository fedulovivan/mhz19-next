FROM node:alpine AS server-compiler
WORKDIR /build
COPY server server
COPY lib lib
RUN apk add --no-cache python3 make g++
RUN cd server && yarn install && yarn compile && yarn install --production=true

FROM node:alpine AS server
WORKDIR /app
COPY server/package.json .
COPY --from=server-compiler /build/server/dist .
COPY --from=server-compiler /build/server/node_modules node_modules
CMD node server/index.js

FROM node:alpine AS client-compiler
WORKDIR /build
COPY client client
RUN apk add --no-cache python3 make g++
RUN cd client && yarn && yarn build

FROM nginx:alpine AS client
WORKDIR /usr/share/nginx/html
COPY --from=client-compiler /build/client/dist .
