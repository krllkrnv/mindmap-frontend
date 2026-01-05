# Этап 1: Сборка фронтенда
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY package*.json ./
COPY vite.config.js ./
RUN npm ci
COPY src ./src
COPY index.html ./
COPY jsconfig.json ./
COPY public ./public
RUN npm run build

# Этап 2: Подготовка backend
FROM node:20-alpine AS backend-setup
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/server.js ./
COPY backend/data ./data

# Финальный образ
FROM node:20-alpine
WORKDIR /app
COPY --from=backend-setup /app/backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./backend/public
EXPOSE 3000
WORKDIR /app/backend
CMD ["node", "server.js"]
