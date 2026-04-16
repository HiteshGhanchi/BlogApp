# --- Stage 1: Base ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
# We don't COPY the source here yet to keep the base image layer clean

# --- Stage 2: Development ---
FROM base AS development
# In dev, we use VOLUMES (defined in docker-compose) to sync code.
# This stage just runs nodemon.
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# --- Stage 3: Build (for production) ---
FROM base AS build
COPY . .
# If you had a build step for the backend (like typescript), it would go here.

# --- Stage 4: Production ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# Only copy necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/src ./src
# Install only production dependencies
RUN npm install --only=production
CMD ["npm", "start"]
