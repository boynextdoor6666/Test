<script setup lang="ts">
import { ref } from 'vue'
import RatingStars from './RatingStars.vue'
import { reviewsAPI } from '@/utils/api'

const props = defineProps<{
  employerId: number
}>()

const emit = defineEmits(['reviewSubmitted'])

const rating = ref(0)
const review = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

// Обработчик изменения рейтинга
function handleRatingChange(newRating: number) {
  rating.value = newRating
}

// Отправка формы
async function submitReview() {
  if (rating.value === 0) {
    errorMessage.value = 'Пожалуйста, укажите рейтинг'
    return
  }
  
  if (review.value.trim().length < 10) {
    errorMessage.value = 'Отзыв должен содержать минимум 10 символов'
    return
  }
  
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    // Используем наш новый API для отправки отзыва
    const response = await reviewsAPI.createReview({
      employer_id: props.employerId,
      rating: rating.value,
      content: review.value
    })
    
    if (response.success) {
      successMessage.value = 'Спасибо за ваш отзыв!'
      review.value = ''
      rating.value = 0
      emit('reviewSubmitted', response.data)
    } else {
      errorMessage.value = response.message || 'Ошибка при отправке отзыва'
    }
  } catch (error) {
    console.error('Error submitting review:', error)
    errorMessage.value = 'Произошла ошибка при отправке отзыва'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="review-form">
    <h3>Оставить отзыв о работодателе</h3>
    
    <div class="form-group">
      <label>Ваша оценка:</label>
      <div class="rating-selector">
        <span 
          v-for="i in 5" 
          :key="i" 
          class="star-selector" 
          @click="handleRatingChange(i)"
          @mouseenter="rating = i" 
          @mouseleave="rating = rating"
        >
          <i 
            :class="[
              'fas', 
              rating >= i ? 'fa-star' : 'far fa-star'
            ]"
          ></i>
        </span>
      </div>
    </div>
    
    <div class="form-group">
      <label for="reviewText">Ваш отзыв:</label>
      <textarea 
        id="reviewText" 
        v-model="review" 
        class="form-control" 
        rows="4" 
        placeholder="Расскажите о вашем опыте работы с этим работодателем..."
      ></textarea>
    </div>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <button 
      @click="submitReview" 
      class="btn btn-primary" 
      :disabled="isSubmitting"
    >
      {{ isSubmitting ? 'Отправка...' : 'Отправить отзыв' }}
    </button>
  </div>
</template>

<style scoped>
.review-form {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-top: 20px;
  border: 1px solid var(--border-color);
}

h3 {
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: var(--font-weight-medium);
}

.rating-selector {
  display: flex;
  gap: 5px;
}

.star-selector {
  cursor: pointer;
  font-size: 1.5rem;
  color: #FFD700;
  transition: transform 0.1s ease;
}

.star-selector:hover {
  transform: scale(1.2);
}

textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px;
  font-family: var(--font-family-body);
}

.error-message {
  color: var(--error-color);
  margin-bottom: 15px;
}

.success-message {
  color: var(--success-color);
  margin-bottom: 15px;
}
</style> 