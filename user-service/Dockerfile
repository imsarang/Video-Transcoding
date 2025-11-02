# Stage 1: dependencies (dev)
FROM node:18-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./

# Harden npm networking against timeouts and speed up installs
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-timeout 600000 \
    && npm config set registry https://registry.npmjs.org/
# Prefer clean, reproducible installs
RUN npm ci --no-audit --no-fund

# Install curl (apk instead of apt-get because alpine base image)
RUN apk add --no-cache curl

# Stage 2: development
FROM node:18-alpine AS dev
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# # Stage 3: production build
# FROM node:18-alpine AS build
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install --production=true
# COPY . .
# RUN npm run build
# EXPOSE 3001
# CMD ["node", "dist/main.js"]
