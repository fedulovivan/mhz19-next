FROM node:20-alpine AS builder
WORKDIR /app
COPY tsconfig.json package.json yarn.lock .
COPY src src
RUN yarn install && yarn build && yarn install --production=true

FROM node:20-alpine AS runner
RUN apk add --no-cache tzdata mpg123
WORKDIR /app
COPY assets assets
COPY package.json .
COPY --from=builder /app/dist dist
COPY --from=builder /app/node_modules node_modules
CMD yarn sync && yarn start
