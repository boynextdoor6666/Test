<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from '../utils/i18n'
import type { TranslationLanguages } from '../utils/i18n'

// Состояние текущего языка
const currentLanguage = ref<TranslationLanguages>('ru')

// Инициализация при монтировании компонента
onMounted(() => {
  const { currentLanguage: savedLanguage } = useI18n()
  currentLanguage.value = savedLanguage
})

// Переключение языка
const toggleLanguage = () => {
  currentLanguage.value = currentLanguage.value === 'ru' ? 'kg' : 'ru'
  localStorage.setItem('preferredLanguage', currentLanguage.value)
  // Перезагрузка страницы для обновления всех компонентов
  window.location.reload()
}

// Флаг для отображения
const flagIcon = computed(() => {
  return currentLanguage.value === 'ru' ? 'flag-ru' : 'flag-kg'
})
</script>

<template>
  <button
    @click="toggleLanguage"
    class="lang-btn"
    :title="currentLanguage === 'ru' ? 'Сменить язык на кыргызский' : 'Тилди орусчага алмаштыруу'"
  >
    <span :class="['flag', flagIcon]"></span>
  </button>
</template>

<style scoped>
.lang-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.lang-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.flag {
  width: 18px;
  height: 12px;
  display: inline-block;
  background-size: cover;
  background-position: center;
  border-radius: 2px;
}

.flag-ru {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6"><rect fill="white" width="9" height="2"/><rect fill="blue" y="2" width="9" height="2"/><rect fill="red" y="4" width="9" height="2"/></svg>');
}

.flag-kg {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 18"><rect fill="%23FF0000" width="30" height="18"/><circle cx="15" cy="9" r="4.5" fill="%23FFCC00"/><circle cx="15" cy="9" r="3.6" fill="%23FF0000"/><g fill="%23FFCC00"><path d="M15,5.4 L15.5,9 L19,9 L16.2,11.3 L17.2,14.6 L15,12.5 L12.8,14.6 L13.8,11.3 L11,9 L14.5,9 z"/><path d="M9.5,9 a5.5,5.5 0 1,0 11,0 a5.5,5.5 0 1,0 -11,0 M10.5,9 a4.5,4.5 0 1,0 9,0 a4.5,4.5 0 1,0 -9,0"/></g></svg>');
}

@media (max-width: 768px) {
  .lang-btn {
    margin-left: 0;
    width: 28px;
    height: 28px;
  }
}
</style>
