# Pull base image
FROM node:21-alpine

ARG version_info
ENV REACT_APP_VERSION_INFO=${version_info}
# This is required in low-memory environments (possibly need to setup swap)
ENV NODE_OPTIONS=--max_old_space_size=2048

WORKDIR /app

# Install dependencies
COPY ./movimenti-fe/lingui.config.js ./movimenti-fe/package.json ./movimenti-fe/package-lock.json ./
# Cache npm dependencies locally to /usr/src/app/.npm
RUN --mount=type=cache,target=/app/.npm \
    npm set cache /app/.npm && \
    npm ci serve && \
    npm ci

# Copy the rest of app's files
COPY ./movimenti-fe/public/ ./public
COPY ./movimenti-fe/src/ ./src
COPY ./movimenti-fe/.env ./

# Build translations and app
RUN npm run compile && \
    npm run build


CMD ["npx", "serve", "-s", "build", "-l", "3000"]
