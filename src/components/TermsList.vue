<template>
  <div class="terms-list">
    <div class="search-container">
      <div class="search-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Поиск терминов..." 
          class="search-input"
          aria-label="Поиск терминов"
        />
      </div>
    </div>

    <div v-if="loading" class="loading" role="status" aria-live="polite">
      Загрузка терминов...
    </div>

    <div v-else-if="error" class="error" role="alert" aria-live="assertive">
      Ошибка: {{ error }}
    </div>

    <div v-else class="terms-grid">
      <TermCard 
        v-for="(term, index) in terms" 
        :key="term.id" 
        :term="term"
        :style="{ animationDelay: `${index * 0.05}s` }"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dataService from '../services/data.js'
import TermCard from './TermCard.vue'

export default {
  name: 'TermsList',
  components: {
    TermCard
  },
  setup() {
    const router = useRouter()
    const terms = ref([])
    const loading = ref(true)
    const error = ref(null)
    const searchQuery = ref('')

    const loadTerms = async (search = '') => {
      try {
        loading.value = true
        error.value = null
        if (search) {
          terms.value = await dataService.searchTerms(search)
        } else {
          terms.value = await dataService.getAllTerms()
        }
      } catch (err) {
        error.value = err.message || 'Ошибка загрузки терминов'
        console.error('Ошибка загрузки терминов:', err)
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      loadTerms(searchQuery.value)
    }

    onMounted(() => {
      loadTerms()
    })

    return {
      terms,
      loading,
      error,
      searchQuery,
      handleSearch
    }
  }
}
</script>

<style lang="scss" scoped>

.terms-list {
  max-width: $max-width-container;
  margin: 0 auto;
  padding: $spacing-2xl;
}

.search-container {
  margin-bottom: $spacing-3xl;
  display: flex;
  justify-content: center;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 60rem;
}

.search-icon {
  position: absolute;
  left: $spacing-xl;
  top: 50%;
  transform: translateY(-50%);
  color: $color-text-tertiary;
  pointer-events: none;
  width: 1.8rem;
  height: 1.8rem;
}

.search-input {
  width: 100%;
  padding: $spacing-lg $spacing-xl $spacing-lg 4.5rem;
  border: 0.05rem solid $color-border;
  border-radius: $radius-md;
  font-size: $font-size-base;
  font-family: $font-family-sans;
  background: $color-white;
  color: $color-text-primary;
  outline: none;
  @include transition;
  
  &::placeholder {
    color: $color-text-tertiary;
  }
  
  &:focus {
    border-color: $color-primary;
    box-shadow: 0 0 0 0.2rem rgba(44, 82, 130, 0.1);
  }
  
  &:focus + .search-icon,
  &:focus ~ .search-icon {
    color: $color-primary;
  }
}

.actions {
  display: flex;
  gap: $spacing-md;
}

.btn {
  @include button-base;
}

.btn-primary {
  background-color: $color-primary;
  color: $color-white;
}

.btn-primary:hover {
  background-color: $color-primary-hover;
}

.btn-secondary {
  background-color: $color-secondary;
  color: $color-white;
}

.btn-secondary:hover {
  background-color: $color-secondary-hover;
}

.loading, .error {
  text-align: center;
  padding: $spacing-5xl;
  font-size: $font-size-md;
}

.error {
  color: $color-error;
}

.terms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32rem, 1fr));
  gap: $spacing-2xl;
  
  @media (max-width: 48rem) {
    grid-template-columns: 1fr;
    gap: $spacing-xl;
  }
  
  @media (min-width: 48.1rem) and (max-width: 76.8rem) {
    grid-template-columns: 1fr;
    gap: $spacing-2xl;
  }
  
  @media (min-width: 77rem) and (max-width: 102.4rem) {
    grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
    gap: $spacing-2xl;
  }
}

@media (max-width: 48rem) {
  .terms-list {
    padding: $spacing-lg;
  }
  
  .search-container {
    margin-bottom: $spacing-3xl;
  }
  
  .search-wrapper {
    max-width: 100%;
  }
  
  .search-input {
    padding: $spacing-md $spacing-lg $spacing-md 4rem;
    font-size: $font-size-sm;
  }
  
  .search-icon {
    left: $spacing-md;
    width: 1.6rem;
    height: 1.6rem;
  }
}
</style>
