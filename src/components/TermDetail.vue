<template>
  <div class="term-detail">
    <div v-if="loading" class="loading" role="status" aria-live="polite">
      Загрузка термина...
    </div>

    <div v-else-if="error" class="error" role="alert" aria-live="assertive">
      <p>Ошибка: {{ error }}</p>
      <router-link to="/terms" class="btn-back" aria-label="Вернуться к списку терминов">К списку</router-link>
    </div>

    <div v-else-if="term" class="term-content">
      <nav class="breadcrumbs-header" aria-label="Навигационная цепочка">
        <nav class="breadcrumbs">
          <router-link to="/terms" class="breadcrumb-link">Список терминов</router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ term.term }}</span>
        </nav>
        <router-link to="/terms" class="btn-back" aria-label="Вернуться к списку терминов">К списку</router-link>
      </nav>

      <div class="term-header">
        <h1 class="term-title">{{ term.term }}</h1>
        <span v-if="term.category" class="term-category">{{ term.category }}</span>
      </div>

      <div class="term-definition">
        <p v-html="linkify(term.definition)"></p>
      </div>

      <div v-if="term.relations && term.relations.length > 0" class="related-terms">
        <h2>Связанные термины</h2>
        <ul class="relations-list">
          <li 
            v-for="(relation, index) in term.relations" 
            :key="index" 
            class="relation-item"
          >
            <span class="relation-type">{{ relation.type }}:</span>
            <button 
              @click="navigateToRelatedTerm(relation.term)"
              class="related-term-link"
              :disabled="!getRelatedTermId(relation.term)"
              :aria-label="`Перейти к термину: ${relation.term}`"
            >
              {{ relation.term }}
            </button>
          </li>
        </ul>
      </div>

      <div v-if="term.sources && term.sources.length > 0" class="sources">
        <h2>Источники</h2>
        <ol class="sources-list">
          <li 
            v-for="(source, index) in term.sources" 
            :key="index" 
            class="source-item"
          >
            <span class="citation-badge">{{ source.citation }}</span>
            <span class="source-text" v-html="linkify(source.full)"></span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dataService from '../services/data.js'

export default {
  name: 'TermDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const term = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const allTerms = ref([])

    const loadTerm = async () => {
      try {
        loading.value = true
        error.value = null
        
        const termId = parseInt(route.params.id)
        if (isNaN(termId)) {
          throw new Error('Неверный ID термина')
        }

        allTerms.value = await dataService.getAllTerms()
        const loadedTerm = await dataService.getTerm(termId)
        
        if (!loadedTerm) {
          throw new Error('Термин не найден')
        }
        
        term.value = loadedTerm
      } catch (err) {
        error.value = err.message || 'Ошибка загрузки термина'
        console.error('Ошибка загрузки термина:', err)
      } finally {
        loading.value = false
      }
    }

    const getRelatedTermId = (termName) => {
      const foundTerm = allTerms.value.find(t => t.term === termName)
      return foundTerm ? foundTerm.id : null
    }

    const navigateToRelatedTerm = async (termName) => {
      const relatedTermId = getRelatedTermId(termName)
      if (relatedTermId) {
        router.push(`/terms/${relatedTermId}`)
      } else {
        console.warn(`Термин "${termName}" не найден`)
      }
    }

    const linkify = (text) => {
      if (!text) return ''
      return text.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>')
    }

    onMounted(() => {
      loadTerm()
    })

    watch(() => route.params.id, () => {
      if (route.params.id) {
        loadTerm()
      }
    })

    return {
      term,
      loading,
      error,
      getRelatedTermId,
      navigateToRelatedTerm,
      linkify
    }
  }
}
</script>

<style lang="scss" scoped>

.term-detail {
  max-width: $max-width-content;
  margin: 0 auto;
  padding: $spacing-2xl;
}

.loading, .error {
  text-align: center;
  padding: $spacing-5xl;
  font-size: $font-size-md;
}

.error {
  color: $color-error;
}

.error .btn-back {
  margin-top: $spacing-2xl;
  display: inline-block;
}


.btn-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  @include academic-button;
  text-decoration: none;
  line-height: 1;
  vertical-align: middle;
}

.term-content {
  background: $color-white;
  border: 0.05rem solid $color-border;
  border-radius: $radius-md;
  padding: $spacing-4xl;
  box-shadow: $shadow-sm;
  animation: fadeIn 0.4s ease-in;
}

.breadcrumbs-header {
  @include flex-between;
  align-items: center;
  margin-bottom: $spacing-2xl;
  padding-bottom: $spacing-lg;
  border-bottom: 0.05rem solid $color-border;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-sm;
}

.breadcrumb-link {
  @include academic-link;
  color: $color-text-tertiary;
  
  &:hover {
    color: $color-primary;
  }
}

.breadcrumb-separator {
  color: $color-text-tertiary;
}

.breadcrumb-current {
  color: $color-text-primary;
  font-weight: 500;
}

.term-header {
  @include flex-between(flex-start);
  margin-bottom: $spacing-3xl;
  padding-bottom: $spacing-2xl;
  border-bottom: 0.05rem solid $color-border;
}

.term-title {
  @include heading-h1;
  margin: 0;
  flex: 1;
}

.term-category {
  background: $color-primary;
  color: $color-white;
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-sm;
  font-size: $font-size-sm;
  font-weight: 500;
  margin-left: $spacing-2xl;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: $font-family-sans;
}

.term-definition {
  margin-bottom: $spacing-4xl;
}

.term-definition p {
  color: $color-text-secondary;
  line-height: $line-height-relaxed;
  font-size: $font-size-base;
  text-align: justify;
}

.related-terms,
.sources {
  margin-top: $spacing-4xl;
  padding-top: $spacing-3xl;
  border-top: 0.05rem solid $color-border;
}

.related-terms h2,
.sources h2 {
  @include heading-h2;
  margin-bottom: $spacing-2xl;
}

.relations-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.relations-list li {
  padding: 0;
  margin: 0;
}

.relation-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.relation-type {
  color: $color-text-tertiary;
  font-size: $font-size-base;
  font-style: italic;
  font-weight: 500;
}

.related-term-link {
  background: transparent;
  color: $color-primary;
  border: none;
  border-bottom: 0.1rem solid transparent;
  padding: $spacing-sm $spacing-xs;
  border-radius: 0;
  font-size: $font-size-base;
  cursor: pointer;
  @include transition;
  text-align: left;
  font-family: $font-family-sans;
  text-decoration: none;
  
  &:hover:not(:disabled) {
    color: $color-primary-hover;
    border-bottom-color: $color-primary-hover;
    background: transparent;
  }
  
  &:focus:not(:disabled) {
    outline: none !important;
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    color: $color-text-tertiary;
  }
}

.sources-list {
  list-style: decimal;
  padding-left: $spacing-3xl;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-2xl;
}

.source-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-xl;
  padding-left: $spacing-sm;
}

.citation-badge {
  background: $color-primary;
  color: $color-white;
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-sm;
  font-size: $font-size-sm;
  font-weight: 600;
  flex-shrink: 0;
  font-family: $font-family-sans;
  min-width: 4rem;
  text-align: center;
}

.source-text {
  color: $color-text-secondary;
  font-size: $font-size-base;
  line-height: $line-height-base;
  flex: 1;
}

.external-link {
  @include link;
  border-bottom: 0.1rem solid $color-primary;
}

.external-link:hover {
  color: $color-primary-hover;
  border-bottom-color: $color-primary-hover;
}

.term-definition .external-link {
  color: $color-primary;
  font-weight: 500;
}

@media (min-width: 48.1rem) and (max-width: 76.8rem) {
  .term-detail {
    padding: $spacing-2xl;
  }

  .term-content {
    padding: $spacing-4xl $spacing-3xl;
  }
  
  .breadcrumbs {
    font-size: $font-size-sm;
  }

  .term-header {
    flex-direction: row;
    gap: $spacing-xl;
  }

  .term-title {
    font-size: $font-size-lg;
  }
  
  .relation-type {
    min-width: 10rem;
  }
}

@media (max-width: 48rem) {
  .term-detail {
    padding: $spacing-xl $spacing-lg;
  }

  .term-content {
    padding: $spacing-3xl $spacing-2xl;
  }
  
  .breadcrumbs {
    font-size: $font-size-xs;
    flex-wrap: wrap;
  }

  .term-header {
    flex-direction: column;
    gap: $spacing-lg;
    margin-bottom: $spacing-3xl;
    padding-bottom: $spacing-2xl;
  }

  .term-category {
    margin-left: 0;
    align-self: flex-start;
  }

  .term-title {
    font-size: $font-size-lg;
  }
  
  .term-definition {
    margin-bottom: $spacing-4xl;
  }
  
  .term-definition p {
    text-align: left;
  }

  .relation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-xs;
  }

  .relation-type {
    min-width: auto;
  }
  
  .source-item {
    flex-direction: column;
    gap: $spacing-md;
  }
}
</style>

