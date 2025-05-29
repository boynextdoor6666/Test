<script setup lang="ts">
import { computed } from 'vue'

/**
 * Компонент отображения рейтинга в виде звезд
 * Принимает значение рейтинга и количество отзывов
 * Отображает желтые звезды в соответствии с рейтингом
 */

const props = defineProps<{
  rating: number // значение рейтинга от 0 до 5
  reviewCount?: number // количество отзывов
  showValue?: boolean // показывать ли числовое значение рейтинга
  showCount?: boolean // показывать ли количество отзывов
  size?: 'sm' | 'md' | 'lg' // размер звезд
}>()

// Вычисляем массив звезд на основе рейтинга
const stars = computed(() => {
  const result = []
  
  // Округляем рейтинг до ближайшего 0.5
  const fullRating = Math.floor(props.rating)
  const hasHalfStar = props.rating - fullRating >= 0.3 && props.rating - fullRating < 0.8
  const emptyStars = 5 - fullRating - (hasHalfStar ? 1 : 0)
  
  // Добавляем полные звезды
  for (let i = 0; i < fullRating; i++) {
    result.push('full')
  }
  
  // Добавляем половину звезды, если нужно
  if (hasHalfStar) {
    result.push('half')
  }
  
  // Добавляем пустые звезды
  for (let i = 0; i < emptyStars; i++) {
    result.push('empty')
  }
  
  return result
})

// Определяем классы для размера звезд
const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'stars-sm'
    case 'lg': return 'stars-lg'
    default: return 'stars-md'
  }
})

// Форматируем рейтинг для отображения (одно число после запятой)
const formattedRating = computed(() => {
  return props.rating.toFixed(1)
})
</script>

<template>
  <div class="rating-stars" :class="sizeClass">
    <div class="stars">
      <span v-for="(star, index) in stars" :key="index" class="star">
        <i v-if="star === 'full'" class="fas fa-star"></i>
        <i v-else-if="star === 'half'" class="fas fa-star-half-alt"></i>
        <i v-else class="far fa-star"></i>
      </span>
    </div>
    
    <div v-if="showValue || showCount" class="rating-info">
      <span v-if="showValue" class="rating-value">{{ formattedRating }}</span>
      <span v-if="showValue && showCount" class="rating-separator">&nbsp;•&nbsp;</span>
      <span v-if="showCount" class="rating-count">{{ reviewCount }} {{ reviewCount === 1 ? 'отзыв' : (reviewCount && reviewCount < 5 ? 'отзыва' : 'отзывов') }}</span>
    </div>
  </div>
</template>

<style scoped>
.rating-stars {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-family-body);
}

.stars {
  display: flex;
  align-items: center;
}

.star {
  color: #FFD700;
  margin-right: 2px;
  filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.2));
}

.star:last-child {
  margin-right: 0;
}

.rating-info {
  margin-left: 6px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.rating-value {
  font-weight: var(--font-weight-bold);
  color: var(--text-color);
}

.rating-count {
  font-weight: var(--font-weight-regular);
}

/* Размеры звезд */
.stars-sm .star i {
  font-size: 0.9rem;
}

.stars-md .star i {
  font-size: 1.1rem;
}

.stars-lg .star i {
  font-size: 1.4rem;
}
</style> 