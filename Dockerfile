# Pull base image
FROM node:22-alpine

ARG version_info
ENV VITE_VERSION_INFO=${version_info}
# This is required in low-memory environments (possibly need to setup swap)
ENV NODE_OPTIONS=--max_old_space_size=2048

WORKDIR /app

# Install dependencies
COPY ./lingui.config.js ./package.json ./package-lock.json ./
# Cache npm dependencies locally to /usr/src/app/.npm
RUN --mount=type=cache,target=/app/.npm \
    npm set cache /app/.npm && \
    npm ci serve && \
    npm ci

# Copy the rest of app's files
COPY ./public/ ./public
COPY ./src/ ./src
COPY ./.env ./index.html ./vite.config.js ./

# Build translations and app
RUN npm run compile && \
    npm run build


CMD ["npx", "serve", "-s", "build", "-l", "3000"]
