<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { reviewsAPI } from '@/utils/api'
import RatingStars from './RatingStars.vue'
import type { Review } from '@/utils/api'

const props = defineProps<{
  employerId: number
}>()

const reviews = ref<Review[]>([])
const loading = ref(true)
const error = ref('')
const totalReviews = ref(0)
const averageRating = ref(0)

// Загрузка отзывов
async function loadReviews() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await reviewsAPI.getEmployerReviews(props.employerId)
    reviews.value = response.reviews
    totalReviews.value = response.total
    averageRating.value = response.average_rating
  } catch (err) {
    console.error('Error loading employer reviews:', err)
    error.value = 'Не удалось загрузить отзывы о работодателе'
  } finally {
    loading.value = false
  }
}

// Форматирование даты
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Загружаем отзывы при монтировании
onMounted(() => {
  loadReviews()
})

// Обновляем отзывы при изменении employerId
watch(() => props.employerId, () => {
  loadReviews()
})
</script>

<template>
  <div class="reviews-section">
    <h2>Отзывы о работодателе</h2>
    
    <div v-if="loading" class="loading">
      Загрузка отзывов...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="reviews.length === 0" class="no-reviews">
      <p>Пока нет отзывов об этом работодателе.</p>
    </div>
    
    <div v-else class="reviews-container">
      <div class="reviews-summary">
        <div class="average-rating">
          <div class="rating-value">{{ averageRating }}</div>
          <rating-stars 
            :rating="averageRating"
            :review-count="totalReviews"
            size="lg"
            :show-value="false"
            :show-count="true"
          />
        </div>
        
        <div class="reviews-count">
          Всего {{ totalReviews }} {{ 
            totalReviews % 10 === 1 && totalReviews % 100 !== 11 
              ? 'отзыв' 
              : totalReviews % 10 >= 2 && totalReviews % 10 <= 4 && (totalReviews % 100 < 10 || totalReviews % 100 >= 20) 
                ? 'отзыва' 
                : 'отзывов' 
          }}
        </div>
      </div>
      
      <div class="review-list">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-header">
            <div class="user-info">
              <div class="user-avatar" v-if="review.user.avatar">
                <img :src="review.user.avatar" alt="User avatar" />
              </div>
              <div class="user-avatar default-avatar" v-else>
                <i class="fas fa-user"></i>
              </div>
              <div class="user-name">{{ review.user.name }}</div>
            </div>
            <div class="review-date">{{ formatDate(review.created_at) }}</div>
          </div>
          
          <div class="review-rating">
            <rating-stars 
              :rating="review.rating"
              size="md"
              :show-value="true"
              :show-count="false"
            />
          </div>
          
          <div class="review-content">
            {{ review.content }}
          </div>
          
          <div v-if="review.job_id" class="review-job-info">
            <small>Отзыв оставлен на основе выполненной работы</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reviews-section {
  margin-top: 30px;
}

h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.loading, .error, .no-reviews {
  padding: 20px 0;
}

.error {
  color: var(--error-color);
}

.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reviews-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 15px;
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 15px;
}

.rating-value {
  font-size: 3rem;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  line-height: 1;
}

.reviews-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-item {
  padding: 15px;
  border-radius: var(--radius-lg);
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e9e9e9;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  color: #888;
}

.user-name {
  font-weight: var(--font-weight-medium);
}

.review-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.review-rating {
  margin-bottom: 10px;
}

.review-content {
  line-height: 1.5;
}

.review-job-info {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color-light);
  font-size: 0.85rem;
  color: var(--text-secondary);
}
</style> 