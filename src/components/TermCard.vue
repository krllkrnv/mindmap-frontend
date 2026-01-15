<template>
  <div 
    class="term-card" 
    :class="{ 'term-card--variant-b': abTestVariant === 'B' }"
    @click="handleCardClick" 
    role="button" 
    tabindex="0" 
    @keydown.enter="handleCardClick" 
    @keydown.space.prevent="handleCardClick" 
    :aria-label="`Перейти к термину: ${term.term}`"
  >
    <div class="term-header">
      <div class="term-title-wrapper">
        <h3 class="term-title" :class="{ 'term-title--underlined': abTestVariant === 'B' }">
          {{ term.term }}
        </h3>
        <svg 
          v-if="abTestVariant === 'B'" 
          class="term-external-icon" 
          width="14" 
          height="14" 
          viewBox="0 0 1792 1792" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M1408 928v320q0 119-84.5 203.5t-203.5 84.5h-832q-119 0-203.5-84.5t-84.5-203.5v-832q0-119 84.5-203.5t203.5-84.5h704q14 0 23 9t9 23v64q0 14-9 23t-23 9h-704q-66 0-113 47t-47 113v832q0 66 47 113t113 47h832q66 0 113-47t47-113v-320q0-14 9-23t23-9h64q14 0 23 9t9 23zm384-864v512q0 26-19 45t-45 19-45-19l-176-176-652 652q-10 10-23 10t-23-10l-114-114q-10-10-10-23t10-23l652-652-176-176q-19-19-19-45t19-45 45-19h512q26 0 45 19t19 45z" fill="currentColor"/>
        </svg>
      </div>
      <span v-if="term.category" class="term-category">{{ term.category }}</span>
    </div>
    
    <p class="term-definition" v-html="linkify(term.definition)"></p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { initABTest, sendEvent, saveVariant } from '../utils/abTest.js'

const props = defineProps({
  term: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const abTestVariant = ref(null)

// Инициализация A/B теста
onMounted(async () => {
  if (typeof window === 'undefined') {
    return
  }

  const variant = await initABTest()
  if (variant) {
    abTestVariant.value = variant
    saveVariant(variant)
  } else {
    // Если не удалось получить вариант, используем A по умолчанию
    abTestVariant.value = 'A'
  }
})

const handleCardClick = () => {
  // Отправляем событие в Яндекс.Метрику при клике на карточку
  if (abTestVariant.value) {
    sendEvent('term_card_clicked', {
      variant: abTestVariant.value,
      termId: props.term.id,
      termName: props.term.term
    })
  }

  navigateToTerm()
}

const navigateToTerm = () => {
  router.push(`/terms/${props.term.id}`)
}

const linkify = (text) => {
  if (!text) return ''
  return text.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank" @click.stop>$1</a>')
}

</script>

<style lang="scss" scoped>

.term-card {
  @include academic-card;
  margin-bottom: 0;
  @include transition(border-color box-shadow);
  cursor: pointer;
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.term-card:hover {
  @include academic-card-hover;
  border-color: $color-primary;
}

// Усиленные эффекты для варианта B
.term-card--variant-b {
  @include transition(border-color box-shadow transform);
}

.term-card--variant-b:hover {
  box-shadow: $shadow-md;
  transform: translateY(-0.2rem);
  border-color: $color-primary;
  
  .term-title--underlined {
    border-bottom-color: $color-primary-hover;
  }
  
  .term-external-icon {
    color: $color-primary-hover;
    transform: translate(0.1rem, -0.1rem);
  }
}

.term-card:focus {
  outline: none !important;
}

.term-header {
  @include flex-between(flex-start);
  margin-bottom: $spacing-xl;
}

.term-title-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex: 1;
}

.term-title {
  @include heading-h3;
  margin: 0;
  flex: 1;
  @include transition(color);
}

.term-title--underlined {
  border-bottom: 0.15rem solid $color-primary;
  padding-bottom: 0.2rem;
  @include transition(border-color);
}

.term-external-icon {
  flex-shrink: 0;
  color: $color-primary;
  @include transition(color transform);
  width: 1.6rem;
  height: 1.6rem;
}

.term-category {
  background: $color-primary;
  color: $color-white;
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-sm;
  font-size: $font-size-sm;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: $font-family-sans;
}

.term-definition {
  color: $color-text-secondary;
  line-height: $line-height-base;
  font-size: $font-size-base;
  margin: 0;
}

.external-link {
  @include link;
  border-bottom: 0.1rem solid $color-primary;
}

.external-link:hover {
  color: $color-primary-hover;
  border-bottom-color: $color-primary-hover;
}

@media (max-width: 48rem) {
  .term-card {
    padding: $spacing-xl;
  }
  
  .term-header {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
  }
  
  .term-title-wrapper {
    width: 100%;
  }
  
  .term-title {
    font-size: $font-size-md;
  }
  
  .term-external-icon {
    width: 1.4rem;
    height: 1.4rem;
  }
  
  .term-category {
    font-size: $font-size-xs;
    padding: 0.3rem $spacing-sm;
  }
  
  .term-definition {
    font-size: $font-size-sm;
  }
}
</style>
