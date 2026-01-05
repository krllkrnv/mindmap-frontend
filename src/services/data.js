// Сервис для работы с локальными данными терминов
import termsData from '../data/terms.json'

class TermsDataService {
  getTerms(page = 1, perPage = 10, search = '') {
    let filteredTerms = [...termsData]
    
    // Применяем поиск, если указан
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTerms = filteredTerms.filter(term => 
        term.term.toLowerCase().includes(searchLower) ||
        term.definition.toLowerCase().includes(searchLower) ||
        (term.category && term.category.toLowerCase().includes(searchLower))
      )
    }
    
    // Сортировка по ID (новые термины сверху)
    filteredTerms.sort((a, b) => b.id - a.id)
    
    // Пагинация
    const total = filteredTerms.length
    const start = (page - 1) * perPage
    const end = start + perPage
    const paginatedTerms = filteredTerms.slice(start, end)
    
    return {
      terms: paginatedTerms,
      total: total,
      page: page,
      per_page: perPage
    }
  }

  getTerm(id) {
    return termsData.find(term => term.id === parseInt(id)) || null
  }

  searchTerms(query) {
    const queryLower = query.toLowerCase()
    return termsData.filter(term => 
      term.term.toLowerCase().includes(queryLower) ||
      term.definition.toLowerCase().includes(queryLower) ||
      (term.category && term.category.toLowerCase().includes(queryLower))
    )
  }

  getAllTerms() {
    return termsData
  }
}

export default new TermsDataService()
