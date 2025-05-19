<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const jobId = parseInt(route.params.id as string)

// Sample job data (in a real app, this would be fetched from an API)
const jobs = ref([
  {
    id: 1,
    title: 'Уборщица на 2 часа',
    description:
      'Требуется уборщица для уборки квартиры, площадь 65 кв.м. Необходимо помыть полы, протереть пыль, помыть санузел и кухню. Все моющие средства имеются. Работа на 2 часа, можно в выходной день.',
    salary: '1000 сом',
    location: 'Бишкек, 10 мкр',
    phone: '+996 555 123456',
    date: '2023-06-01',
    category: 'Уборка',
    requirements: ['Опыт работы', 'Пунктуальность', 'Ответственность'],
    employer: 'Частное лицо',
  },
  {
    id: 2,
    title: 'Разнорабочий на стройку',
    description:
      'Требуется разнорабочий на стройку на 1 день. Работа включает в себя разгрузку строительных материалов, помощь при бетонировании. Оплата в конце дня.',
    salary: '1500 сом',
    location: 'Бишкек, ул. Киевская',
    phone: '+996 700 654321',
    date: '2023-06-02',
    category: 'Строительство',
    requirements: ['Физическая выносливость', 'Готовность к физическому труду'],
    employer: 'Строительная компания "Курулуш"',
  },
  {
    id: 3,
    title: 'Курьер на 3 часа',
    description:
      'Требуется курьер для доставки документов по городу. Необходимо доставить документы в 5 разных точек города. Транспорт не предоставляется, оплата проезда включена в стоимость работы.',
    salary: '500 сом',
    location: 'Бишкек, центр',
    phone: '+996 777 987654',
    date: '2023-06-03',
    category: 'Доставка',
    requirements: ['Знание города', 'Ответственность', 'Наличие телефона'],
    employer: 'ОсОО "Документ Сервис"',
  },
  {
    id: 4,
    title: 'Помощь с переездом',
    description:
      'Требуется помощь с погрузкой и разгрузкой вещей при переезде. Работа на 4-5 часов, включает погрузку вещей в грузовой автомобиль, перевозку и разгрузку на новом месте.',
    salary: '2000 сом',
    location: 'Бишкек, Юг-2',
    phone: '+996 555 789012',
    date: '2023-06-04',
    category: 'Разное',
    requirements: ['Физическая сила', 'Аккуратность при обращении с вещами'],
    employer: 'Частное лицо',
  },
  {
    id: 5,
    title: 'Няня на вечер',
    description:
      'Требуется няня для присмотра за ребенком 5 лет на вечер. Необходимо покормить ребенка ужином, поиграть с ним, уложить спать. Время работы с 18:00 до 23:00.',
    salary: '800 сом',
    location: 'Бишкек, 12 мкр',
    phone: '+996 700 345678',
    date: '2023-06-05',
    category: 'Няни',
    requirements: ['Опыт работы с детьми', 'Рекомендации', 'Доброжелательность'],
    employer: 'Частное лицо',
  },
  {
    id: 6,
    title: 'Сборка мебели',
    description:
      'Требуется человек для сборки шкафа из ИКЕА. Необходимо собрать шкаф-купе по инструкции. Все детали и инструменты имеются.',
    salary: '1200 сом',
    location: 'Бишкек, Асанбай',
    phone: '+996 777 901234',
    date: '2023-06-06',
    category: 'Ремонт',
    requirements: ['Опыт сборки мебели', 'Наличие базовых инструментов'],
    employer: 'Частное лицо',
  },
])

const job = computed(() => {
  return jobs.value.find((job) => job.id === jobId)
})

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="job-detail">
    <div class="container">
      <div v-if="job" class="job-detail-content">
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

            <div class="job-section" v-if="job.requirements && job.requirements.length">
              <h2>Требования</h2>
              <ul>
                <li v-for="(req, index) in job.requirements" :key="index">{{ req }}</li>
              </ul>
            </div>

            <div class="job-section">
              <h2>Работодатель</h2>
              <p>{{ job.employer }}</p>
            </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="not-found">
        <h2>Вакансия не найдена</h2>
        <p>Извините, вакансия с ID {{ jobId }} не найдена.</p>
        <router-link to="/jobs" class="btn btn-primary mt-3"
          >Вернуться к списку вакансий</router-link
        >
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
  flex: 2;
}

.job-detail-sidebar {
  flex: 1;
}

.job-section {
  margin-bottom: 30px;
}

.job-section h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--primary-color);
}

.job-detail-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.job-info-item {
  display: flex;
  margin-bottom: 15px;
}

.job-info-item .label {
  font-weight: bold;
  width: 100px;
}

.job-info-item .value {
  flex: 1;
}

.phone {
  font-weight: bold;
  color: var(--primary-color);
}

.btn-block {
  display: block;
  width: 100%;
  text-align: center;
}

.btn-whatsapp {
  display: none; /* Hide WhatsApp button */
}

.not-found {
  text-align: center;
  padding: 50px 0;
}

@media (max-width: 768px) {
  .job-detail-body {
    flex-direction: column;
  }

  .job-detail-main {
    order: 2;
  }

  .job-detail-sidebar {
    order: 1;
    margin-bottom: 30px;
  }
}
</style>
