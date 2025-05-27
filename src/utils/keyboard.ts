import { onMounted, onUnmounted } from 'vue'
import { switchLanguage } from './i18n'

export function useKeyboardShortcuts() {
  const handleKeypress = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
      event.preventDefault()
      switchLanguage()
    }
  }
  onMounted(() => {
    document.addEventListener('keydown', handleKeypress)
  })
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeypress)
  })
} 