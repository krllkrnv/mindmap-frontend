# Глоссарий терминов ВКР

Веб-приложение для создания и управления глоссарием терминов с визуализацией связей между терминами.

## Технологии

- Vue.js 3, Vue Router 4
- D3.js
- Node.js, Express.js
- Vite

## Установка

### Требования
- Node.js 16.0+

### Запуск

```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run start
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`

## Развертывание

### Docker Compose

```bash
docker compose up --build
```

Приложение доступно по адресу: `http://localhost:3000`

### Docker

```bash
docker build -t mindmap-vkr .
docker run --rm -p 3000:3000 mindmap-vkr
```

## API

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/terms` | Список терминов (`?search=...`) |
| GET | `/api/terms/:id` | Термин по ID |
| GET | `/api/search?q=...` | Поиск терминов |
| GET | `/api/health` | Статус API |
