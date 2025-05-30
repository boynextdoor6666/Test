<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { jobsAPI } from '@/utils/api'
import type { Job } from '@/utils/api'
import RatingStars from '@/components/RatingStars.vue'
import ReviewList from '@/components/ReviewList.vue'
import ReviewForm from '@/components/ReviewForm.vue'

const route = useRoute()
const jobId = parseInt(route.params.id as string)

const job = ref<Job | null>(null)
const loading = ref(true)
const error = ref('')
const applyMessage = ref('')
const showReviewForm = ref(false)

const isLoggedIn = ref(!!localStorage.getItem('token'))

onMounted(async () => {
  console.log('JobDetailView: компонент монтируется для вакансии ID:', jobId);
  loading.value = true
  error.value = ''
  try {
    // Получаем вакансию
    const fetchedJob = await jobsAPI.getJob(jobId)
    console.log('JobDetailView: получены данные о вакансии:', fetchedJob);
    
    // Проверяем наличие ошибки
    if (fetchedJob && 'error' in fetchedJob) {
      error.value = fetchedJob.error as string
      job.value = null
    } else {
      // Если нет ошибки, записываем вакансию
      job.value = fetchedJob
      console.log('JobDetailView: установлена вакансия, employerId:', job.value.employer_id);
    }
  } catch (e) {
    console.error('JobDetailView: ошибка при загрузке вакансии:', e);
    error.value = 'Ошибка при загрузке вакансии'
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function applyToJob() {
  applyMessage.value = ''
  try {
    const res = await jobsAPI.apply(jobId)
    if (res.message) {
      applyMessage.value = res.message
    } else {
      applyMessage.value = 'Вы успешно откликнулись!'
    }
  } catch (e) {
    applyMessage.value = 'Ошибка при отклике'
  }
}

function toggleReviewForm() {
  showReviewForm.value = !showReviewForm.value
}

function handleReviewSubmitted() {
  // Обновляем информацию о работодателе после добавления отзыва
  if (job.value) {
    // Перезагружаем вакансию, чтобы получить обновленный рейтинг
    jobsAPI.getJob(jobId).then(updatedJob => {
      if (updatedJob && !('error' in updatedJob)) {
        job.value = updatedJob
      }
    })
  }
  // Скрываем форму
  showReviewForm.value = false
}

function runTestScript() {
  if (!job.value || !job.value.employer_id) {
    console.error('Невозможно создать тестовые отзывы: ID работодателя не указан');
    return;
  }
  
  const employerId = job.value.employer_id;
  console.log('Создаем тестовые отзывы для работодателя ID:', employerId);
  
  // Создаем тестовые отзывы для работодателя
  const testReviews = [
    {
      id: Date.now(),
      user_id: 9999,
      employer_id: employerId,
      rating: 5,
      content: 'Отличный работодатель! Тестовый отзыв 1.',
      created_at: new Date().toISOString(),
      user: {
        id: 9999,
        name: 'Тестовый пользователь'
      }
    },
    {
      id: Date.now() + 1,
      user_id: 9998,
      employer_id: employerId,
      rating: 4,
      content: 'Хороший работодатель, но есть некоторые моменты. Тестовый отзыв 2.',
      created_at: new Date().toISOString(),
      user: {
        id: 9998,
        name: 'Другой тестовый пользователь'
      }
    }
  ];
  
  // Сохраняем отзывы в localStorage
  const savedReviews = JSON.parse(localStorage.getItem('demoReviews') || '[]');
  const updatedReviews = [...savedReviews, ...testReviews];
  localStorage.setItem('demoReviews', JSON.stringify(updatedReviews));
  
  // Пересчитываем рейтинг
  function calculateAverageRating(reviews: Array<{rating: number}>): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total: number, review: {rating: number}) => total + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }
  
  // Получаем все отзывы для работодателя
  const employerReviews = updatedReviews.filter(review => review.employer_id === employerId);
  const averageRating = calculateAverageRating(employerReviews);
  
  // Обновляем текущую вакансию
  if (job.value) {
    job.value.employer_rating = averageRating;
    job.value.employer_review_count = employerReviews.length;
  }
  
  // Обновляем все вакансии работодателя
  const demoJobs = JSON.parse(localStorage.getItem('demoJobs') || '[]');
  const updatedJobs = demoJobs.map((demoJob: any) => {
    if (demoJob.employer_id === employerId) {
      return {
        ...demoJob,
        employer_rating: averageRating,
        employer_review_count: employerReviews.length
      };
    }
    return demoJob;
  });
  
  localStorage.setItem('demoJobs', JSON.stringify(updatedJobs));
  console.log('Тестовые отзывы созданы и сохранены.');
  console.log('Средний рейтинг:', averageRating);
  console.log('Количество отзывов:', employerReviews.length);
  
  // Перезагружаем страницу для отображения изменений
  alert('Тестовые отзывы созданы! Сейчас страница будет перезагружена.');
  window.location.reload();
}
</script>

<template>
  <div class="job-detail">
    <div class="container">
      <div v-if="loading" class="text-center py-5">Загрузка...</div>
      <div v-else-if="error" class="not-found">
        <h2>Ошибка</h2>
        <p>{{ error }}</p>
        <router-link to="/jobs" class="btn btn-primary mt-3">Вернуться к списку вакансий</router-link>
      </div>
      <div v-else-if="job" class="job-detail-content">
        <div class="job-detail-header">
          <router-link to="/jobs" class="back-link">← Назад к списку вакансий</router-link>
          <h1>{{ job.title }}</h1>
          <div class="job-meta">
            <div class="job-category">{{ job.category }}</div>
            <div class="job-date">Опубликовано: {{ formatDate(job.date) }}</div>
          </div>
        </div>

        <div class="job-detail-body">
          <div class="job-detail-main">
            <div class="job-section">
              <h2>Описание</h2>
              <p>{{ job.description }}</p>
            </div>

            <div class="job-section" v-if="job.requirements && job.requirements.length > 0">
              <h2>Требования</h2>
              <ul>
                <li v-for="(req, index) in job.requirements" :key="index">{{ req }}</li>
              </ul>
            </div>

            <div class="job-section">
              <h2>Работодатель</h2>
              <div class="employer-info">
                <div class="employer-name">{{ job.employer }}</div>
                <div v-if="job.employer_rating" class="employer-rating-container">
                  <div class="rating-label">Рейтинг работодателя:</div>
                  <rating-stars 
                    :rating="job.employer_rating" 
                    :review-count="job.employer_review_count" 
                    size="lg"
                    :show-value="true"
                    :show-count="true"
                  />
                </div>
                <div v-else class="employer-no-rating">
                  Нет отзывов
                </div>
              </div>
              
              <div v-if="isLoggedIn" class="add-review-btn-container">
                <button @click="toggleReviewForm" class="btn btn-outline">
                  <i class="fas" :class="showReviewForm ? 'fa-times' : 'fa-star'"></i>
                  {{ showReviewForm ? 'Отменить' : 'Оставить отзыв о работодателе' }}
                </button>
              </div>
              
              <div v-if="showReviewForm && isLoggedIn" class="review-form-container">
                <review-form 
                  :employer-id="job.employer_id" 
                  @review-submitted="handleReviewSubmitted"
                />
              </div>
            </div>
            
            <!-- Компонент для отображения отзывов -->
            <div v-if="job && job.employer_id" class="debug-info" style="margin: 20px 0; padding: 15px; background: #f0f9ff; border: 1px solid #cce5ff; border-radius: 4px;">
              <h4>Отладочная информация:</h4>
              <p>ID работодателя: {{ job.employer_id }}</p>
              <p>Рейтинг работодателя: {{ job.employer_rating || 'Не указан' }}</p>
              <p>Количество отзывов: {{ job.employer_review_count || 0 }}</p>
              <button class="btn btn-sm btn-primary" @click="runTestScript">Создать тестовые отзывы</button>
            </div>

            <review-list v-if="job && job.employer_id" :employer-id="job.employer_id" />
          </div>

          <div class="job-detail-sidebar">
            <div class="job-detail-card">
              <div class="job-info-item">
                <div class="label">Оплата:</div>
                <div class="value">{{ job.salary }}</div>
              </div>

              <div class="job-info-item">
                <div class="label">Место:</div>
                <div class="value">{{ job.location }}</div>
              </div>

              <div class="job-info-item">
                <div class="label">Телефон:</div>
                <div class="value phone">{{ job.phone }}</div>
              </div>

              <div class="job-actions">
                <a :href="`tel:${job.phone}`" class="btn btn-primary btn-block">Позвонить</a>
                <button v-if="isLoggedIn" @click="applyToJob" class="btn btn-success btn-block mt-2">Откликнуться</button>
                <div v-if="applyMessage" class="mt-2 text-success">{{ applyMessage }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="not-found">
        <h2>Вакансия не найдена</h2>
        <p>Извините, вакансия с ID {{ jobId }} не найдена.</p>
        <router-link to="/jobs" class="btn btn-primary mt-3">Вернуться к списку вакансий</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.job-detail {
  padding-top: 30px;
  padding-bottom: 50px;
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: var(--primary-color);
}

.job-detail-header {
  margin-bottom: 30px;
}

.job-meta {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.job-category {
  background-color: var(--primary-color);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.job-date {
  color: #666;
  font-size: 0.9rem;
}

.job-detail-body {
  display: flex;
  gap: 30px;
}

.job-detail-main {
  flex: 1;
}

.job-detail-sidebar {
  width: 300px;
}

.job-section {
  margin-bottom: 30px;
}

.job-section h2 {
  font-size: 1.3rem;
  margin-bottom: 15px;
}

.job-section ul {
  margin-left: 20px;
}

.job-section li {
  margin-bottom: 5px;
}

.employer-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.employer-name {
  font-size: 1.1rem;
  font-weight: bold;
}

.employer-rating-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employer-no-rating {
  color: #666;
  font-style: italic;
}

.job-detail-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
}

.job-info-item {
  margin-bottom: 15px;
}

.job-info-item .label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.job-info-item .value {
  font-weight: bold;
}

.job-info-item .value.phone {
  color: var(--primary-color);
}

.job-actions {
  margin-top: 20px;
}

.btn-block {
  display: block;
  width: 100%;
  text-align: center;
  padding: 10px;
}

.mt-2 {
  margin-top: 10px;
}

.mt-3 {
  margin-top: 15px;
}

.py-5 {
  padding-top: 25px;
  padding-bottom: 25px;
}

.text-center {
  text-align: center;
}

.not-found {
  text-align: center;
  padding: 50px 0;
}

.text-success {
  color: var(--success-color);
  text-align: center;
}

.add-review-btn-container {
  margin-top: 20px;
}

.review-form-container {
  margin-top: 15px;
}

@media (max-width: 768px) {
  .job-detail-body {
    flex-direction: column-reverse;
  }

  .job-detail-sidebar {
    width: 100%;
    margin-bottom: 30px;
  }
}
</style>
