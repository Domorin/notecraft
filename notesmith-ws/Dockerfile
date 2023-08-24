
FROM node:18
WORKDIR /app

# Copy root package.json
COPY package.json package-lock.json ./
COPY .env ./


# COPY NOTESMITH-COMMON
COPY notesmith-common/src notesmith-common/src
COPY notesmith-common/package.json notesmith-common/
COPY notesmith-common/tsconfig.json notesmith-common/

# COPY NOTESMITH-WS
COPY notesmith-ws/src notesmith-ws/src
COPY notesmith-ws/package.json notesmith-ws/
COPY notesmith-ws/tsconfig.json notesmith-ws/tsconfig.json

# COPY NOTESMITH-SCHEMA
COPY notesmith-schema notesmith-schema

# NPM install
RUN npm install

# build COMMON and WS
RUN npm run generate --workspace=notesmith-schema
RUN npm run build --workspace=notesmith-common
RUN npm run build --workspace=notesmith-ws

# Start ws server
CMD ["npm", "run", "start", "--workspace=notesmith-ws"]
