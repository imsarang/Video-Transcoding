FROM node:18-alpine

WORKDIR /usr/src/app

# Install development dependencies for better hot reloading
RUN apk add --no-cache curl \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-timeout 600000 \
    && npm config set registry https://registry.npmjs.org/

# Only copy package files for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

EXPOSE 3002

# Use nodemon for better hot reloading
CMD ["npm", "run", "start:dev"]
