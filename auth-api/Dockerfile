# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /auth-api/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: production
FROM node:20-alpine

WORKDIR /auth-api/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /auth-api/app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/main"]
