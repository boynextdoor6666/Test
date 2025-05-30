<script setup lang="ts">
import { computed } from 'vue'

/**
 * Компонент отображения рейтинга в виде звезд
 * Принимает значение рейтинга и количество отзывов
 * Отображает желтые звезды в соответствии с рейтингом
 */

const props = defineProps({
  rating: {
    type: Number,
    required: true
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  size: {
    type: String,
    default: 'md', // options: sm, md, lg
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  showValue: {
    type: Boolean,
    default: true
  },
  showCount: {
    type: Boolean,
    default: false
  }
})

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

const getStarClass = (index: number, rating: number) => {
  if (rating >= index) return 'fas fa-star'
  if (rating >= index - 0.5) return 'fas fa-star-half-alt'
  return 'far fa-star'
}

const getSizeClass = (size: string) => {
  switch (size) {
    case 'sm': return 'stars-sm'
    case 'lg': return 'stars-lg'
    default: return 'stars-md'
  }
}
</script>

<template>
  <div class="rating-stars-container">
    <div class="stars" :class="getSizeClass(size)">
      <i v-for="i in 5" :key="i" :class="getStarClass(i, rating)"></i>
    </div>
    <span v-if="showValue" class="rating-value">{{ rating.toFixed(1) }}</span>
    <span v-if="showCount && reviewCount > 0" class="review-count">
      ({{ reviewCount }} {{ 
        reviewCount % 10 === 1 && reviewCount % 100 !== 11 
          ? 'отзыв' 
          : reviewCount % 10 >= 2 && reviewCount % 10 <= 4 && (reviewCount % 100 < 10 || reviewCount % 100 >= 20) 
            ? 'отзыва' 
            : 'отзывов' 
      }})
    </span>
  </div>
</template>

<style scoped>
.rating-stars-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  display: flex;
  gap: 2px;
  color: #FFD700;
}

.stars-sm {
  font-size: 0.85rem;
}

.stars-md {
  font-size: 1.1rem;
}

.stars-lg {
  font-size: 1.5rem;
}

.rating-value {
  font-weight: var(--font-weight-medium);
  color: var(--text-color);
}

.review-count {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style> 