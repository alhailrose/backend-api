# Tahap 1: Build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Tahap 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY --from=build /app/dist ./dist
RUN npm install --only=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
