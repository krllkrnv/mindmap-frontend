const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const termsPath = path.join(__dirname, 'data', 'terms.json');
let termsData = [];

try {
  const data = fs.readFileSync(termsPath, 'utf8');
  termsData = JSON.parse(data);
  console.log(`Загружено ${termsData.length} терминов`);
} catch (error) {
  console.error('Ошибка загрузки данных:', error);
  process.exit(1);
}

// GET /api/terms - список терминов с пагинацией
app.get('/api/terms', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const search = req.query.search || '';

    let filteredTerms = termsData;

    // Поиск по названию термина
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTerms = termsData.filter(term => 
        term.term.toLowerCase().includes(searchLower) ||
        (term.definition && term.definition.toLowerCase().includes(searchLower))
      );
    }

    const total = filteredTerms.length;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedTerms = filteredTerms.slice(startIndex, endIndex);

    res.json({
      terms: paginatedTerms,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    console.error('Ошибка получения терминов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/terms/:id - получить конкретный термин
app.get('/api/terms/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const term = termsData.find(t => t.id === id);

    if (!term) {
      return res.status(404).json({ error: 'Термин не найден' });
    }

    res.json(term);
  } catch (error) {
    console.error('Ошибка получения термина:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/search - поиск терминов
app.get('/api/search', (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query) {
      return res.json({ terms: [] });
    }

    const queryLower = query.toLowerCase();
    const results = termsData.filter(term => 
      term.term.toLowerCase().includes(queryLower) ||
      (term.definition && term.definition.toLowerCase().includes(queryLower)) ||
      (term.category && term.category.toLowerCase().includes(queryLower))
    );

    res.json({ terms: results });
  } catch (error) {
    console.error('Ошибка поиска:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/health - проверка состояния
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    terms_count: termsData.length
  });
});

// Статические файлы фронтенда
app.use(express.static(path.join(__dirname, 'public')));

// Fallback для SPA - все остальные запросы на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
  console.log(`Фронтенд доступен по адресу: http://localhost:${PORT}`);
});

