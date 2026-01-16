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
      <h3 class="term-title">
        {{ term.term }}
      </h3>

      <span v-if="term.category" class="term-category">
        {{ term.category }}
      </span>
    </div>

    <p class="term-definition" v-html="linkify(term.definition)"></p>

    <div
      v-if="abTestVariant === 'B'"
      class="term-link-button"
      aria-hidden="true"
    >
      <svg
        class="term-external-icon"
        viewBox="0 0 1792 1792"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1408 928v320q0 119-84.5 203.5t-203.5 84.5h-832q-119 0-203.5-84.5t-84.5-203.5v-832q0-119 84.5-203.5t203.5-84.5h704q14 0 23 9t9 23v64q0 14-9 23t-23 9h-704q-66 0-113 47t-47 113v832q0 66 47 113t113 47h832q66 0 113-47t47-113v-320q0-14 9-23t23-9h64q14 0 23 9t9 23zm384-864v512q0 26-19 45t-45 19-45-19l-176-176-652 652q-10 10-23 10t-23-10l-114-114q-10-10-10-23t10-23l652-652-176-176q-19-19-19-45t19-45 45-19h512q26 0 45 19t19 45z"
          fill="currentColor"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  
  const props = defineProps({
    term: {
      type: Object,
      required: true
    }
  })
  
  const router = useRouter()
  const abTestVariant = ref(null)
  
  const initABTest = () => {
    if (typeof window === 'undefined') {
      return Promise.resolve('A')
    }
  
    const ymab = window.ymab
    if (!ymab) {
      abTestVariant.value = 'A'
      return Promise.resolve('A')
    }
  
    return new Promise((resolve) => {
      try {
        ymab('metrika.106281217', 'getFlags', (flags) => {
          let raw = null
          if (flags) {
            if (flags.snippet_templates !== undefined) raw = flags.snippet_templates
            else if (flags.term_card !== undefined) raw = flags.term_card
            else {
              const keys = Object.keys(flags)
              if (keys.length === 1) raw = flags[keys[0]]
            }
          }
  
          const flag = Array.isArray(raw) ? raw[0] : raw
          const variant = flag === 'B' ? 'B' : 'A'
          abTestVariant.value = variant
          resolve(variant)
        })
      } catch (e) {
        abTestVariant.value = 'A'
        resolve('A')
      }
    })
  }
  
  const sendEvent = (goalName) => {
    if (typeof window === 'undefined') return
    const ym = window.ym
    if (typeof ym === 'function') {
      try {
        ym(106281217, 'reachGoal', goalName)
      } catch (e) {
      }
    }
  }
  
  onMounted(async () => {
    await initABTest()
  })
  
  const handleCardClick = () => {
    sendEvent('term_clicked')
    navigateToTerm()
  }
  
  const navigateToTerm = () => {
    router.push(`/terms/${props.term.id}`)
  }
  
  const linkify = (text) => {
    if (!text) return ''
    return text.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" @click.stop>$1</a>')
  }
  </script>
  

<style lang="scss" scoped>
  .term-card {
    @include academic-card;
    position: relative;
    cursor: pointer;
  
    transform: translateY(0);
    will-change: transform;
  
    transition:
      transform 0.25s ease,
      box-shadow $transition-base,
      border-color $transition-base;
  
    animation: fadeIn 0.4s ease-out both;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .term-card--variant-b:hover {
    @include academic-card-hover;
    border-color: $color-primary;
    box-shadow: $shadow-md;
    transform: translateY(-0.25rem);
  }
  
  .term-header {
    @include flex-between(flex-start);
    margin-bottom: $spacing-xl;
  }
  
  .term-title {
    @include heading-h3;
    margin: 0;
    text-decoration: none;
  }
  
  .term-card--variant-b .term-title {
    text-decoration: underline;
    text-decoration-thickness: 0.15rem;
    text-underline-offset: 0.25rem;
    text-decoration-color: $color-primary;
  }
  
  .term-definition {
    color: $color-text-secondary;
    line-height: $line-height-base;
    font-size: $font-size-base;
    margin: 0;
  }
  
  .term-category {
    background: $color-primary;
    color: $color-white;
    padding: $spacing-xs $spacing-md;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
  }
  
  .term-link-button {
    position: absolute;
    right: $spacing-xl;
    bottom: $spacing-xl;
    color: $color-primary;
  }
  
  .term-external-icon {
    width: 1.6rem;
    height: 1.6rem;
  }
  
  @media (max-width: 48rem) {
    .term-card {
      padding: $spacing-xl;
    }
  
    .term-link-button {
      right: $spacing-lg;
      bottom: $spacing-lg;
    }
  }
  </style>  