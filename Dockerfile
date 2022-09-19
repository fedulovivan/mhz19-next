FROM node:16-alpine AS compiler
WORKDIR /build
COPY server server
COPY lib lib
RUN apk add --no-cache python3 make g++
RUN cd server && yarn install && yarn compile && yarn install --production=true

FROM node:16-alpine AS server
WORKDIR /app
COPY server/package.json .
COPY --from=compiler /build/server/dist .
COPY --from=compiler /build/server/node_modules node_modules
CMD node server/index.js
