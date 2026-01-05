# Глоссарий терминов ВКР

Веб-приложение для создания и управления глоссарием терминов выпускной квалификационной работы с визуализацией связей между терминами в виде интерактивной ментальной карты.

## Содержание

- [Описание проекта](#описание-проекта)
- [Технологический стек](#технологический-стек)
- [Установка и запуск](#установка-и-запуск)
- [Развертывание](#развертывание)
- [API документация](#api-документация)
- [Функциональность](#функциональность)

## Описание проекта

Данное приложение предназначено для создания и управления глоссарием терминов, используемых в выпускной квалификационной работе. Основные возможности:

- **CRUD операции** с терминами (создание, чтение, обновление, удаление)
- **Поиск и фильтрация** терминов
- **Интерактивная визуализация** связей между терминами
- **Категоризация** терминов
- **Связанные термины** для построения связей

## Технологический стек

### Frontend
- **Vue.js 3** - прогрессивный JavaScript фреймворк
- **Vue Router 4** - маршрутизация для SPA
- **D3.js** - библиотека для создания интерактивных визуализаций
- **Vite** - быстрый инструмент сборки

### Backend
- **Python 3.12** - язык программирования
- **FastAPI** - современный веб-фреймворк для создания API
- **Pydantic** - валидация и сериализация данных с автоматической генерацией схем
- **Uvicorn** - ASGI сервер

### Развертывание
- **Vercel** - платформа для развертывания

## Установка и запуск

### Предварительные требования

- **Node.js** версии 16.0+
- **Python** версии 3.12+
- **Git** для клонирования репозитория

### 1. Клонирование репозитория

```bash
git clone https://github.com/krllkrnv/mindmap-vkr.git
cd mindmap-vkr
```

### 2. Настройка Frontend

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

Frontend будет доступен по адресу: `http://localhost:5173`

### 3. Настройка Backend

```bash
# Переход в папку backend
cd backend

# Создание виртуального окружения
python -m venv venv

# Активация виртуального окружения
# Linux/macOS:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt

# Запуск сервера
python app/main.py
# или
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API будет доступен по адресу: `http://localhost:8000`

### 4. Проверка работы

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API документация**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/api/health

## Развертывание

### Развертывание на Vercel

#### Frontend

1. **Подключение репозитория к Vercel:**
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Подключите GitHub репозиторий

2. **Настройка сборки:**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Backend

1. **Создание отдельного проекта для backend:**
   - Создайте новый проект в Vercel
   - Выберите папку `backend` как корневую

2. **Настройка vercel.json:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "app/main.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "app/main.py"
       }
     ]
   }
   ```

3. **Обновление CORS в backend:**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://ваш-frontend-домен.vercel.app",
           "http://localhost:5173"
       ],
       allow_credentials=False,
       allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
       allow_headers=["*"],
   )
   ```

### Настройка доменов

1. **Получение URL проектов:**
   - Frontend: `https://mindmap-vkr.vercel.app`
   - Backend: `https://mindmap-vkr-backend.vercel.app`

2. **Обновление API_BASE в frontend:**
   ```javascript
   const API_BASE = process.env.NODE_ENV === 'production' 
     ? 'https://mindmap-vkr-backend.vercel.app/api'
     : 'http://localhost:8000/api'
   ```

## API документация

### Эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/terms` | Получить список терминов с пагинацией |
| GET | `/api/terms/{id}` | Получить конкретный термин |
| POST | `/api/terms` | Создать новый термин |
| PUT | `/api/terms/{id}` | Обновить термин |
| DELETE | `/api/terms/{id}` | Удалить термин |
| GET | `/api/terms/search/{query}` | Поиск терминов |
| GET | `/api/health` | Проверка состояния API |

### Примеры запросов

#### Получение списка терминов
```bash
curl -X GET "https://mindmap-vkr-backend.vercel.app/api/terms?page=1&per_page=10"
```

#### Создание нового термина
```bash
curl -X POST "https://mindmap-vkr-backend.vercel.app/api/terms" \
  -H "Content-Type: application/json" \
  -d '{
    "term": "Алгоритм",
    "definition": "Конечная последовательность инструкций для решения задачи",
    "category": "Программирование",
    "related_terms": ["Структура данных", "Сложность"]
  }'
```

## Функциональность

### Основные возможности

1. **Управление терминами:**
   - Создание новых терминов
   - Редактирование существующих терминов
   - Удаление терминов с подтверждением
   - Просмотр детальной информации

2. **Поиск и фильтрация:**
   - Поиск по названию термина
   - Фильтрация по категориям
   - Пагинация результатов

3. **Визуализация связей:**
   - Интерактивная ментальная карта
   - Drag & drop для перемещения узлов
   - Зум и панорамирование
   - Tooltip с информацией о терминах

4. **Пользовательский интерфейс:**
   - Адаптивный дизайн
   - Интуитивная навигация
   - Подтверждение действий
   - Обработка ошибок

### Технические особенности

- **SPA (Single Page Application)** - быстрая навигация без перезагрузки
- **RESTful API** - стандартизированные HTTP методы
- **Pydantic модели** - строгая типизация и валидация данных:
  - `TermBase` - базовая модель термина
  - `TermCreate` - модель для создания термина
  - `TermUpdate` - модель для обновления термина
  - `TermResponse` - модель ответа API
  - `TermListResponse` - модель для списка терминов
- **CORS** - поддержка кросс-доменных запросов
- **Responsive Design** - адаптация под разные устройства
- **Error Handling** - обработка ошибок на всех уровнях

## Разработка

### Команды для разработки

```bash
# Frontend
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run preview      # Предварительный просмотр сборки

# Backend
python app/main.py                    # Запуск сервера
uvicorn app.main:app --reload        # Запуск с автоперезагрузкой
```

### Отладка

- **Frontend**: Используйте Vue DevTools в браузере
- **Backend**: Логи выводятся в консоль, API документация доступна по `/docs`
- **Network**: Проверяйте Network tab в DevTools для отладки API запросов


---