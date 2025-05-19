<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import JobCard from '@/components/JobCard.vue'

// Sample job data (in a real app, this would come from an API)
const jobs = ref([
  {
    id: 1,
    title: 'Уборщица на 2 часа',
    description: 'Требуется уборщица для уборки квартиры, площадь 65 кв.м.',
    salary: '1000 сом',
    location: 'Бишкек, 10 мкр',
    phone: '+996 555 123456',
    date: '2023-06-01',
    category: 'Уборка',
  },
  {
    id: 2,
    title: 'Разнорабочий на стройку',
    description: 'Требуется разнорабочий на стройку на 1 день.',
    salary: '1500 сом',
    location: 'Бишкек, ул. Киевская',
    phone: '+996 700 654321',
    date: '2023-06-02',
    category: 'Строительство',
  },
  {
    id: 3,
    title: 'Курьер на 3 часа',
    description: 'Требуется курьер для доставки документов по городу.',
    salary: '500 сом',
    location: 'Бишкек, центр',
    phone: '+996 777 987654',
    date: '2023-06-03',
    category: 'Доставка',
  },
  {
    id: 4,
    title: 'Помощь с переездом',
    description: 'Требуется помощь с погрузкой и разгрузкой вещей при переезде.',
    salary: '2000 сом',
    location: 'Бишкек, Юг-2',
    phone: '+996 555 789012',
    date: '2023-06-04',
    category: 'Разное',
  },
  {
    id: 5,
    title: 'Няня на вечер',
    description: 'Требуется няня для присмотра за ребенком 5 лет на вечер.',
    salary: '800 сом',
    location: 'Бишкек, 12 мкр',
    phone: '+996 700 345678',
    date: '2023-06-05',
    category: 'Няни',
  },
  {
    id: 6,
    title: 'Сборка мебели',
    description: 'Требуется человек для сборки шкафа из ИКЕА.',
    salary: '1200 сом',
    location: 'Бишкек, Асанбай',
    phone: '+996 777 901234',
    date: '2023-06-06',
    category: 'Ремонт',
  },
])

const categories = ref(['Все', 'Уборка', 'Строительство', 'Доставка', 'Ремонт', 'Няни', 'Разное'])

const selectedCategory = ref('Все')
const searchQuery = ref('')

const filteredJobs = computed(() => {
  return jobs.value.filter((job) => {
    // Filter by category
    if (selectedCategory.value !== 'Все' && job.category !== selectedCategory.value) {
      return false
    }

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      return (
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      )
    }

    return true
  })
})

function setCategory(category: string) {
  selectedCategory.value = category
}
</script>

<template>
  <div class="jobs-view">
    <section class="section">
      <div class="container">
        <h1 class="text-center">Найти работу</h1>

        <div class="search-bar">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск работы..."
            class="search-input"
          />
        </div>

        <div class="categories">
          <button
            v-for="category in categories"
            :key="category"
            class="category-btn"
            :class="{ active: selectedCategory === category }"
            @click="setCategory(category)"
          >
            {{ category }}
          </button>
        </div>

        <div class="jobs-count">
          <p>Найдено вакансий: {{ filteredJobs.length }}</p>
        </div>

        <div class="jobs-grid">
          <template v-if="filteredJobs.length > 0">
            <div v-for="job in filteredJobs" :key="job.id" class="job-card-wrapper">
              <JobCard :job="job" />
            </div>
          </template>
          <template v-else>
            <div class="no-jobs">
              <p>По вашему запросу ничего не найдено</p>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.section {
  padding: var(--spacing-xl) 0;
}

h1 {
  margin-bottom: var(--spacing-xl);
  color: var(--primary-color);
}

.search-bar {
  max-width: 600px;
  margin: 0 auto var(--spacing-lg);
}

.search-input {
  width: 100%;
  padding: 14px 24px;
  border: 1px solid var(--border-color);
  border-radius: 30px;
  font-size: 1rem;
  font-family: var(--font-family-body);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(62, 104, 255, 0.1);
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.category-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: white;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 3px 8px rgba(62, 104, 255, 0.2);
}

.category-btn:hover:not(.active) {
  background-color: var(--bg-color);
  transform: translateY(-2px);
}

.jobs-count {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-lg);
  font-family: var(--font-family-body);
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.job-card-wrapper {
  height: 100%;
}

.no-jobs {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--bg-color);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-family: var(--font-family-body);
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .categories {
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
  }

  .category-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }

  .search-bar {
    margin-bottom: var(--spacing-md);
  }

  .search-input {
    padding: 12px 20px;
  }
}
</style>
