FROM node:18
WORKDIR /app

# Copy root package.json
COPY package.json package-lock.json ./
COPY .env ./

# COPY notecraft-COMMON
COPY notecraft-common/src notecraft-common/src
COPY notecraft-common/package.json notecraft-common/
COPY notecraft-common/tsconfig.json notecraft-common/

# COPY notecraft-APP
COPY notecraft-app/src notecraft-app/src
COPY notecraft-app/package.json notecraft-app/
COPY notecraft-app/tsconfig.json notecraft-app/
COPY notecraft-app/tsconfig.json notecraft-app/
COPY notecraft-app/tailwind.config.js notecraft-app/
COPY notecraft-app/postcss.config.js notecraft-app/

# COPY notecraft-SCHEMA
COPY notecraft-schema notecraft-schema

# NPM install
RUN npm install

# build COMMON and APP
RUN npm run generate --workspace=notecraft-schema
RUN npm run build --workspace=notecraft-common
RUN npm run build --workspace=notecraft-app

# Start next server
CMD ["npm", "run", "start", "--workspace=notecraft-app"]
