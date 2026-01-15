// Используем переменную окружения или дефолтное значение для разработки
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class TermsDataService {
  async getTerms(search = '') {
    try {
      const params = new URLSearchParams()
      
      if (search) {
        params.append('search', search)
      }
      
      const response = await fetch(`${API_BASE_URL}/terms?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.terms || []
    } catch (error) {
      console.error('Ошибка получения терминов:', error)
      throw error
    }
  }

  async getTerm(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/terms/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Ошибка получения термина:', error)
      throw error
    }
  }

  async searchTerms(query) {
    try {
      if (!query) {
        return []
      }
      
      const params = new URLSearchParams({ q: query })
      const response = await fetch(`${API_BASE_URL}/search?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.terms || []
    } catch (error) {
      console.error('Ошибка поиска терминов:', error)
      throw error
    }
  }

  async getAllTerms() {
    try {
      return await this.getTerms()
    } catch (error) {
      console.error('Ошибка получения всех терминов:', error)
      throw error
    }
  }

  async findTermByName(name) {
    try {
      const allTerms = await this.getAllTerms()
      return allTerms.find(t => t.term === name) || null
    } catch (error) {
      console.error('Ошибка поиска термина по названию:', error)
      throw error
    }
  }
}

export default new TermsDataService()
