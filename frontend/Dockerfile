# --- Stage 1: Base ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

# --- Stage 2: Development ---
FROM base AS development
# Vite runs internally on 5173
ENV NODE_ENV=development
CMD ["npm", "run", "dev", "--", "--host"]

# --- Stage 3: Build (Production artifacts) ---
FROM base AS build
COPY . .
RUN npm run build

# --- Stage 4: Production (Serve with Nginx) ---
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# Include custom nginx config if needed for SPA routing
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
