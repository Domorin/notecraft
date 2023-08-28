
FROM node:18
WORKDIR /app

# Copy root package.json
COPY package.json package-lock.json ./
COPY .env.prod ./


# COPY notecraft-COMMON
COPY notecraft-common/src notecraft-common/src
COPY notecraft-common/package.json notecraft-common/
COPY notecraft-common/tsconfig.json notecraft-common/

# COPY notecraft-WS
COPY notecraft-ws/src notecraft-ws/src
COPY notecraft-ws/package.json notecraft-ws/
COPY notecraft-ws/tsconfig.json notecraft-ws/tsconfig.json

# COPY notecraft-SCHEMA
COPY notecraft-schema notecraft-schema

# NPM install
RUN npm install

# build COMMON and WS
RUN npm run generate --workspace=notecraft-schema
RUN npm run build --workspace=notecraft-common
RUN npm run build --workspace=notecraft-ws

# Start ws server
CMD ["npm", "run", "start", "--workspace=notecraft-ws"]
