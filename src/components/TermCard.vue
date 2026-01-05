<template>
  <div class="term-card" @click="navigateToTerm" role="button" tabindex="0" @keydown.enter="navigateToTerm" @keydown.space.prevent="navigateToTerm" :aria-label="`Перейти к термину: ${term.term}`">
    <div class="term-header">
      <h3 class="term-title">{{ term.term }}</h3>
      <span v-if="term.category" class="term-category">{{ term.category }}</span>
    </div>
    
    <p class="term-definition" v-html="linkify(term.definition)"></p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  term: {
    type: Object,
    required: true
  }
})

const router = useRouter()

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

.term-card:focus {
  outline: none !important;
}

.term-header {
  @include flex-between(flex-start);
  margin-bottom: $spacing-xl;
}

.term-title {
  @include heading-h3;
  margin: 0;
  flex: 1;
  @include transition(color);
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
  
  .term-title {
    font-size: $font-size-md;
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
