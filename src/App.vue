<template>
  <div class="app">
    <header class="app-header">
      <h1>Глоссарий терминов ВКР</h1>
      <p class="app-subtitle">Систематизированный справочник терминов выпускной квалификационной работы</p>
    </header>

    <nav class="main-nav" role="navigation" aria-label="Основная навигация">
      <router-link to="/graph" class="nav-tab" aria-current="page">
        Граф связей
      </router-link>
      <router-link to="/terms" class="nav-tab" aria-current="page">
        Список терминов
      </router-link>
    </nav>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>

.app {
  margin: 0 auto;
  padding: $spacing-2xl;
  max-width: $max-width-container;
}

.app-header {
  text-align: center;
  margin-bottom: $spacing-4xl;
  padding-bottom: $spacing-2xl;
  border-bottom: 0.05rem solid $color-border;
}

.app-header h1 {
  @include heading-h1;
  margin-bottom: $spacing-lg;
}

.app-subtitle {
  color: $color-text-tertiary;
  font-size: $font-size-base;
  font-style: italic;
  margin: 0;
  line-height: $line-height-base;
}

.main-nav {
  @include flex-center;
  gap: 0;
  margin-bottom: $spacing-4xl;
  border-bottom: 0.05rem solid $color-border;
  position: relative;
}

.nav-tab {
  padding: $spacing-lg $spacing-2xl;
  color: $color-text-tertiary;
  font-weight: 500;
  font-size: $font-size-base;
  position: relative;
  border: none;
  border-bottom: 0.2rem solid transparent;
  margin-bottom: -0.05rem;
  background: transparent;
  transition: color $transition-base, border-color $transition-base;
  text-decoration: none;
  
  &:hover {
    color: $color-primary;
    border-bottom-color: transparent;
  }
  
  &.router-link-active {
    color: $color-primary;
    border: none;
    border-bottom: 0.2rem solid $color-primary;
    font-weight: 600;
  }
  
  &:focus {
    outline: none !important;
  }
}

.main-content {
  min-height: 60vh;
  animation: fadeIn 0.4s ease-in;
}

// Page transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (min-width: 48.1rem) and (max-width: 76.8rem) {
  .app {
    padding: $spacing-2xl;
  }
  
  .app-header {
    margin-bottom: $spacing-4xl;
    padding-bottom: $spacing-2xl;
  }
  
  .app-header h1 {
    font-size: $font-size-lg;
  }
  
  .app-subtitle {
    font-size: $font-size-base;
  }
  
  .main-nav {
    flex-direction: row;
    justify-content: center;
    margin-bottom: $spacing-4xl;
  }
  
  .nav-tab {
    padding: $spacing-lg $spacing-2xl;
    font-size: $font-size-base;
  }
}

@media (max-width: 48rem) {
  .app {
    padding: $spacing-xl $spacing-lg;
  }
  
  .app-header {
    margin-bottom: $spacing-3xl;
    padding-bottom: $spacing-2xl;
  }
  
  .app-header h1 {
    font-size: $font-size-lg;
  }
  
  .app-subtitle {
    font-size: $font-size-sm;
  }
  
  .main-nav {
    flex-direction: row;
    justify-content: center;
    margin-bottom: $spacing-4xl;
  }
  
  .nav-tab {
    padding: $spacing-md $spacing-xl;
    font-size: $font-size-sm;
  }
}
</style>