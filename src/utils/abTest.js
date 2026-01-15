// Утилита для работы с A/B тестированием через Яндекс.Метрику и Яндекс.ABT

const AB_TEST_FLAG = 'term_card'

// Инициализация A/B теста
export const initABTest = () => {
  if (!window?.ymab) {
    return Promise.resolve('A')
  }

  return new Promise((resolve) => {
    window.ymab('metrika.106281217', 'getFlags', (flags) => {
      const flag = Array.isArray(flags[AB_TEST_FLAG]) 
        ? flags[AB_TEST_FLAG][0] 
        : flags[AB_TEST_FLAG]
      resolve(flag === 'B' ? 'B' : 'A')
    })
  })
}

// Отправка события в Яндекс.Метрику
export const sendEvent = (goalName) => {
  if (window?.ym) {
    window.ym(106281217, 'reachGoal', goalName)
  }
}

// Сохранение варианта в localStorage
export const saveVariant = (variant) => {
  try {
    localStorage.setItem('ab_test_variant', variant)
  } catch (e) {
    // Игнорируем ошибки localStorage
  }
}