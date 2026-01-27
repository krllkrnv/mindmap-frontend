import { ref } from 'vue'

export function useAbTest({ flagName, metrikaId }) {
  const variant = ref(null)
  const isResolved = ref(false)

  const init = () => {
    if (typeof window === 'undefined') return

    const ymab = window.ymab
    if (!ymab) {
      variant.value = 'A'
      isResolved.value = true
      return
    }

    try {
      ymab(`metrika.${metrikaId}`, 'getFlags', (flags) => {
        const raw = flags && flags[flagName]
        const flag = Array.isArray(raw) ? raw[0] : raw
        variant.value = flag === 'B' ? 'B' : 'A'
        isResolved.value = true
      })
    } catch (e) {
      variant.value = 'A'
      isResolved.value = true
    }
  }

  return { variant, isResolved, init }
}
