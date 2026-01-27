const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  /^https:\/\/.*\.vercel\.app$/
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false
}));

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

app.get('/', (req, res) => {
  res.json({
    message: 'MindMap API Server',
    branch: 'ab-testing',
    timestamp: new Date().toISOString(),
    endpoints: {
      terms: '/api/terms',
      search: '/api/search?q=query',
      health: '/api/health',
      termById: '/api/terms/:id'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API Endpoints',
    available: [
      'GET /api/terms',
      'GET /api/search?q=query',
      'GET /api/health',
      'GET /api/terms/:id'
    ]
  });
});

app.get('/api/terms', (req, res) => {
  try {
    const search = req.query.search || '';

    let filteredTerms = termsData;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTerms = termsData.filter(term => 
        term.term.toLowerCase().includes(searchLower) ||
        (term.definition && term.definition.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      terms: filteredTerms
    });
  } catch (error) {
    console.error('Ошибка получения терминов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

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

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    terms_count: termsData.length
  });
});

module.exports = app;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
  });
}