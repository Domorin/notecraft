FROM node:18
WORKDIR /app

# Copy root package.json
COPY package.json package-lock.json ./
COPY .env ./

# COPY NOTESMITH-COMMON
COPY notesmith-common/src notesmith-common/src
COPY notesmith-common/package.json notesmith-common/
COPY notesmith-common/tsconfig.json notesmith-common/

# COPY NOTESMITH-APP
COPY notesmith-app/src notesmith-app/src
COPY notesmith-app/package.json notesmith-app/
COPY notesmith-app/tsconfig.json notesmith-app/
COPY notesmith-app/tsconfig.json notesmith-app/
COPY notesmith-app/tailwind.config.js notesmith-app/
COPY notesmith-app/postcss.config.js notesmith-app/

# COPY NOTESMITH-SCHEMA
COPY notesmith-schema notesmith-schema

# NPM install
RUN npm install

# build COMMON and APP
RUN npm run generate --workspace=notesmith-schema
RUN npm run build --workspace=notesmith-common
RUN npm run build --workspace=notesmith-app

# Start next server
CMD ["npm", "run", "start", "--workspace=notesmith-app"]
