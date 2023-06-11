FROM node:alpine AS server-builder
WORKDIR /build
COPY server server
COPY lib lib
RUN apk add --no-cache python3 make g++
RUN cd server && yarn install && yarn build && yarn install --production=true

FROM node:alpine AS server
WORKDIR /app
COPY server/package.json .
COPY --from=server-builder /build/server/dist .
COPY --from=server-builder /build/server/node_modules node_modules
RUN apk add --no-cache graphviz
CMD node dist/server/index.js

FROM node:alpine AS client-compiler
WORKDIR /build
COPY client client
RUN apk add --no-cache python3 make g++
RUN cd client && yarn && yarn build

FROM nginx:alpine AS client
WORKDIR /usr/share/nginx/html
COPY --from=client-compiler /build/client/dist .
