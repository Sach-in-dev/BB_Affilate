# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install deps first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---------- Stage 2: Serve via nginx ----------
FROM nginx:alpine

# Remove default nginx site
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
