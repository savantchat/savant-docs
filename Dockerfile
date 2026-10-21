##############################################
# Stage 1: Build Docusaurus static files
##############################################
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files (the lockfile references local file: tarballs
# for the dev-only uilint packages, so they must exist before npm ci)
COPY package.json package-lock.json ./
COPY .uilint-packages ./.uilint-packages

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build static files
RUN npm run build

##############################################
# Stage 2: Serve static files with web server
##############################################
FROM node:20-alpine AS serve

# server.mjs lives in /srv, outside /app, so it is never served.
WORKDIR /srv

# The two packages server.mjs needs, pinned to the versions serve@14.2.1 used.
RUN npm install --no-save --no-audit --no-fund serve-handler@6.1.5 compression@1.7.4

COPY server.mjs /srv/server.mjs

# Copy only built static files from previous stage
COPY --from=build /app/build /app

# Expose port 3000
EXPOSE 3000

# serve-handler with per-route HTML support, serve.json from /app, and a 404
# (not a 500) for paths the filesystem cannot name. See server.mjs.
CMD ["node", "/srv/server.mjs"]
