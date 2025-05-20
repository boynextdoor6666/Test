<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import JobCard from '@/components/JobCard.vue'

// Определение интерфейса Job для типизации
interface Job {
  id: number
  title: string
  description: string
  salary: string
  location: string
  phone: string
  date: string
  category: string
  applications?: Application[]
}

interface Application {
  applicantId: number
  applicantName: string
  appliedAt: string
  status: string
}

interface User {
  fullName?: string
  name?: string
  phone?: string
  email?: string
  skills?: string[]
  experience?: string
  userType?: string
}

interface JobFormErrors {
  title: string
  description: string
  salary: string
  location: string
  phone: string
  category: string
  [key: string]: string // Индексированный тип для динамического доступа
}

interface JobForm {
  id: number | null
  title: string
  description: string
  salary: string
  location: string
  phone: string
  category: string
  date: string
  [key: string]: string | number | null // Индексированный тип для динамического доступа
}

// Sample job data (in a real app, this would come from an API)
const jobs = ref<Job[]>([])

// Загружать тестовые вакансии только если в localStorage ничего нет
const defaultJobs: Job[] = [
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
    title: 'Курер на 3 часа',
    description: 'Требуется курер для доставки документов по городу.',
    salary: '500 сом',
    location: 'Бишкек, центр',
    phone: '+996 777 987654',
    date: '2023-06-03',
    category: 'Доставка',
  },
  {
    id: 4,
    title: 'Помощь с переездом',
    description: 'Требуется помощь с переездом и разгрузкой вещи на 1 этаж.',
    salary: '2000 сом',
    location: 'Бишкек, Рг-2',
    phone: '+996 555 789012',
    date: '2023-06-04',
    category: 'Разное',
  },
  {
    id: 5,
    title: 'Няня на вечеринку',
    description: 'Требуется няня для присмотра за ребенком 5 лет на вечеринку.',
    salary: '800 сом',
    location: 'Бишкек, 12 мкр',
    phone: '+996 700 345678',
    date: '2023-06-05',
    category: 'Няни',
  },
  {
    id: 6,
    title: 'Сборка мебели',
    description: 'Требуется человек для сборки шкафа из МДФ.',
    salary: '1200 сом',
    location: 'Бишкек, Асанбай',
    phone: '+996 777 901234',
    date: '2023-06-06',
    category: 'Ремонт',
  },
]

const categories = ref(['Все', 'Уборка', 'Строительство', 'Доставка', 'Ремонт', 'Няни', 'Разное'])

const selectedCategory = ref('Все')
const searchQuery = ref('')

// Проверка, авторизован ли пользователь и его тип
const isLoggedIn = ref(false)
const userType = ref('')

// Состояние для модального окна добавления вакансии
const showAddJobModal = ref(false)
const showEditJobModal = ref(false)
const currentJobId = ref<number | null>(null)
const newJob = ref<JobForm>({
  id: null,
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  category: 'Разное',
  date: new Date().toISOString().split('T')[0], // Текущая дата
})
const editJob = ref<JobForm>({
  // Для редактирования состояния модального окна
  id: null,
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  category: 'Разное',
  date: '',
})
const addJobErrors = ref<JobFormErrors>({
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  category: '',
})
const editJobErrors = ref<JobFormErrors>({
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  category: '',
})

// Загрузка данных пользователя и вакансий при монтировании
onMounted(() => {
  // Проверка авторизации пользователя
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      console.log('Пользователь авторизован:', user) // Для отладки
      isLoggedIn.value = true
      userType.value = user.userType || 'worker'
      console.log('Тип пользователя:', userType.value) // Для отладки

      if (user.phone) {
        newJob.value.phone = user.phone
      }

      // For testing purposes, force userType to 'employer' if needed
      // Comment this out in production
      // userType.value = 'employer'
    } catch (error) {
      console.error('Ошибка при парсинге данных пользователя:', error)
    }
  } else {
    console.log('Пользователь не авторизован') // Для отладки

    // For testing purposes, you can uncomment to simulate a logged-in employer
    // isLoggedIn.value = true
    // userType.value = 'employer'
  }

  // Загрузка вакансий из localStorage
  const jobsData = localStorage.getItem('jobs')
  if (jobsData) {
    try {
      jobs.value = JSON.parse(jobsData)
    } catch (error) {
      console.error('Ошибка при парсинге вакансий:', error)
      jobs.value = defaultJobs
      localStorage.setItem('jobs', JSON.stringify(defaultJobs))
    }
  } else {
    jobs.value = defaultJobs
    localStorage.setItem('jobs', JSON.stringify(defaultJobs))
  }
})

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

// Функции для тестовой панели
function setEmployerMode() {
  isLoggedIn.value = true
  userType.value = 'employer'

  // Сохраним режим в localStorage для тестирования
  const testUser = {
    userType: 'employer',
    name: 'Test Employer',
  }
  localStorage.setItem('user', JSON.stringify(testUser))

  console.log('Режим работодателя активирован')
  // Перезагрузим страницу, чтобы применить изменения
  window.location.reload()
}

function setWorkerMode() {
  isLoggedIn.value = true
  userType.value = 'worker'

  // Сохраним режим в localStorage для тестирования
  const testUser = {
    userType: 'worker',
    name: 'Test Worker',
  }
  localStorage.setItem('user', JSON.stringify(testUser))

  console.log('Режим работника активирован')
  // Перезагрузим страницу, чтобы применить изменения
  window.location.reload()
}

function setCategory(category: string) {
  selectedCategory.value = category
}

// Функция для сброса всех фильтров
function resetFilters() {
  selectedCategory.value = 'Все'
  searchQuery.value = ''
}

// Функция для модального окна добавления вакансии
const openAddJobModal = () => {
  showAddJobModal.value = true
  showEditJobModal.value = false // Закрываем модальное окно редактирования, если оно открыто
  // Очистка ошибок
  Object.keys(addJobErrors.value).forEach((key) => (addJobErrors.value[key] = ''))

  // Заполнение даты и телефона
  newJob.value.date = new Date().toISOString().split('T')[0]

  // Если пользователь указал телефон, используем его
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      if (user.phone) {
        newJob.value.phone = user.phone
      }
    } catch (e) {
      console.error('Ошибка при получении данных пользователя', e)
    }
  }
}

const closeAddJobModal = () => {
  showAddJobModal.value = false
}

const handleAddJob = () => {
  // Валидация
  let valid = true
  Object.keys(addJobErrors.value).forEach((key) => (addJobErrors.value[key] = ''))

  if (!newJob.value.title) {
    addJobErrors.value.title = 'Введите название'
    valid = false
  }
  if (!newJob.value.description) {
    addJobErrors.value.description = 'Введите описание'
    valid = false
  }
  if (!newJob.value.salary) {
    addJobErrors.value.salary = 'Введите зарплату'
    valid = false
  }
  if (!newJob.value.location) {
    addJobErrors.value.location = 'Введите локацию'
    valid = false
  }
  if (!newJob.value.phone) {
    addJobErrors.value.phone = 'Введите телефон'
    valid = false
  }
  if (!newJob.value.category) {
    addJobErrors.value.category = 'Выберите категорию'
    valid = false
  }

  if (!valid) return

  // Добавление вакансии
  const job: Job = {
    id: Date.now(),
    title: newJob.value.title,
    description: newJob.value.description,
    salary: newJob.value.salary,
    location: newJob.value.location,
    phone: newJob.value.phone,
    category: newJob.value.category,
    date: newJob.value.date,
  }

  jobs.value.unshift(job)
  localStorage.setItem('jobs', JSON.stringify(jobs.value))

  // Очистка полей формы
  Object.keys(newJob.value).forEach((key) => {
    if (key !== 'phone' && key !== 'date' && key !== 'category') {
      newJob.value[key] = ''
    }
  })
  showAddJobModal.value = false
}

// Функция для модального окна редактирования вакансии
const openEditJobModal = (job: Job) => {
  console.log('openEditJobModal вызван с job:', job)

  showAddJobModal.value = false // Закрываем модальное окно добавления, если оно открыто
  showEditJobModal.value = true

  // Очистка ошибок
  Object.keys(editJobErrors.value).forEach((key) => (editJobErrors.value[key] = ''))

  // Копирование данных редактируемой вакансии
  // Исключаем applications из копирования, т.к. этого поля нет в JobForm
  const { applications, ...jobData } = job
  editJob.value = { ...jobData }

  currentJobId.value = job.id

  console.log('editJob.value после заполнения:', editJob.value)
  console.log('currentJobId.value после заполнения:', currentJobId.value)
}

const closeEditJobModal = () => {
  showEditJobModal.value = false
  currentJobId.value = null
}

const handleEditJob = () => {
  // Валидация
  let valid = true
  Object.keys(editJobErrors.value).forEach((key) => (editJobErrors.value[key] = ''))

  if (!editJob.value.title) {
    editJobErrors.value.title = 'Введите название'
    valid = false
  }
  if (!editJob.value.description) {
    editJobErrors.value.description = 'Введите описание'
    valid = false
  }
  if (!editJob.value.salary) {
    editJobErrors.value.salary = 'Введите зарплату'
    valid = false
  }
  if (!editJob.value.location) {
    editJobErrors.value.location = 'Введите локацию'
    valid = false
  }
  if (!editJob.value.phone) {
    editJobErrors.value.phone = 'Введите телефон'
    valid = false
  }
  if (!editJob.value.category) {
    editJobErrors.value.category = 'Выберите категорию'
    valid = false
  }

  if (!valid) return

  // Обновление вакансии в массиве
  const index = jobs.value.findIndex((job) => job.id === currentJobId.value)
  if (index !== -1) {
    // Получаем applications из текущей вакансии, если оно есть
    const applications = jobs.value[index].applications || []

    // Создаем новый объект Job из editJob
    const updatedJob: Job = {
      ...(editJob.value as JobForm),
      id: currentJobId.value as number, // Приведение типа
      applications,
    }

    jobs.value[index] = updatedJob
    localStorage.setItem('jobs', JSON.stringify(jobs.value))
    showEditJobModal.value = false
    currentJobId.value = null
  }
}

// Функция для удаления вакансии
const handleDeleteJob = (jobId: number) => {
  console.log('handleDeleteJob вызван с jobId:', jobId)

  const index = jobs.value.findIndex((job) => job.id === jobId)
  console.log('Найден индекс для удаления:', index)

  if (index !== -1) {
    jobs.value.splice(index, 1)
    localStorage.setItem('jobs', JSON.stringify(jobs.value))
    console.log('Вакансия удалена. Новое количество вакансий:', jobs.value.length)
  }
}

// Обработчик отклика на вакансию
const handleApply = (job: Job) => {
  if (!isLoggedIn.value) {
    alert('Для отклика на вакансию необходимо авторизоваться')
    return
  }

  if (userType.value !== 'worker') {
    alert('Только работники могут откликаться на вакансию')
    return
  }

  // Проверяем, не откликнулся ли уже пользователь на эту вакансию
  const myJobsData = localStorage.getItem('myJobs')
  let myJobs: any[] = []

  if (myJobsData) {
    try {
      myJobs = JSON.parse(myJobsData)
      const alreadyApplied = myJobs.some((myJob: any) => myJob.id === job.id)

      if (alreadyApplied) {
        alert(`Вы уже откликнулись на вакансию "${job.title}"`)
        return
      }
    } catch (e) {
      console.error('Ошибка при получении принятых вакансий:', e)
    }
  }

  // Получаем данные пользователя
  const userData = localStorage.getItem('user')
  let user: User = {}

  if (userData) {
    try {
      user = JSON.parse(userData)
    } catch (e) {
      console.error('Ошибка при получении данных пользователя:', e)
      return
    }
  } else {
    alert('Ошибка: данные пользователя не найдены')
    return
  }

  // Добавляем вакансию в список принятых
  const jobCopy = {
    ...job,
    appliedAt: new Date().toISOString(),
    status: 'new',
    applicantData: {
      id: Date.now(),
      fullName: user.fullName || user.name || 'Пользователь',
      phone: user.phone || '',
      email: user.email || '',
      skills: user.skills || [],
      experience: user.experience || '',
    },
  }

  // Добавляем в список принятых вакансий
  myJobs.push(jobCopy)
  localStorage.setItem('myJobs', JSON.stringify(myJobs))

  // Обновляем статус вакансии в общем списке
  const jobIndex = jobs.value.findIndex((j) => j.id === job.id)
  if (jobIndex !== -1) {
    // Добавляем информацию о том, что есть заявка
    if (!jobs.value[jobIndex].applications) {
      jobs.value[jobIndex].applications = []
    }

    jobs.value[jobIndex].applications.push({
      applicantId: Date.now(),
      applicantName: user.fullName || user.name || 'Пользователь',
      appliedAt: new Date().toISOString(),
      status: 'new',
    })

    localStorage.setItem('jobs', JSON.stringify(jobs.value))
  }

  // Показываем уведомление
  alert(`Вы успешно откликнулись на вакансию "${job.title}"`)
}
</script>

<template>
  <div class="jobs-view">
    <div class="container">
      <section class="jobs-header">
        <h1 class="text-center">Найдите работу или исполнителя</h1>
        <p class="text-center subtitle">
          Более 500 вакансий и 1000 исполнителей на нашей платформе, готовых приступить к работе
          сегодня
        </p>

        <!-- Временная панель для тестирования (удалить в продакшн) -->
        <div class="test-panel">
          <div class="test-buttons">
            <button class="test-btn" @click="setEmployerMode()">Режим работодателя</button>
            <button class="test-btn" @click="setWorkerMode()">Режим работника</button>
            <span class="test-status"
              >Текущий режим: {{ isLoggedIn ? userType : 'Не авторизован' }}</span
            >
          </div>
        </div>

        <div class="search-section">
          <div class="search-container">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Поиск по названию, описанию или локации..."
              class="search-input"
            />
            <button class="search-button">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>

        <div class="categories-section">
          <div class="categories-wrapper">
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
        </div>

        <div class="jobs-actions" v-if="isLoggedIn && userType === 'employer'">
          <button @click="openAddJobModal" class="btn btn-primary add-job-btn">
            <i class="fas fa-plus"></i> Добавить вакансию
          </button>
        </div>
      </section>

      <section class="jobs-results">
        <div class="jobs-filter-info">
          <span class="jobs-count">Найдено вакансий: {{ filteredJobs.length }}</span>
          <div class="active-filters" v-if="selectedCategory !== 'Все' || searchQuery">
            <div class="filter-tag" v-if="selectedCategory !== 'Все'">
              {{ selectedCategory }}
              <button class="clear-filter" @click="setCategory('Все')">×</button>
            </div>
            <div class="filter-tag" v-if="searchQuery">
              Поиск: {{ searchQuery }}
              <button class="clear-filter" @click="searchQuery = ''">×</button>
            </div>
          </div>
        </div>

        <div class="jobs-grid">
          <job-card
            v-for="job in filteredJobs"
            :key="job.id"
            :job="job"
            :isEmployer="isLoggedIn && userType === 'employer'"
            @edit="openEditJobModal"
            @delete="handleDeleteJob"
            @apply="handleApply"
          />
        </div>

        <div v-if="filteredJobs.length === 0" class="no-jobs">
          <i class="fas fa-search job-icon"></i>
          <h3>Вакансии не найдены</h3>
          <p>
            Попробуйте изменить параметры поиска или
            <button class="reset-btn" @click="resetFilters">сбросить все фильтры</button>
          </p>
        </div>
      </section>
    </div>

    <!-- Модальное окно добавления вакансии -->
    <div v-if="showAddJobModal" class="modal-overlay">
      <div class="modal">
        <h2>Добавить вакансию</h2>
        <form @submit.prevent="handleAddJob">
          <div class="form-group">
            <label>Название вакансии *</label>
            <input
              type="text"
              v-model="newJob.title"
              class="form-control"
              :class="{ 'has-error': addJobErrors.title }"
            />
            <div class="error-message" v-if="addJobErrors.title">{{ addJobErrors.title }}</div>
          </div>
          <div class="form-group">
            <label>Описание *</label>
            <textarea
              v-model="newJob.description"
              class="form-control"
              :class="{ 'has-error': addJobErrors.description }"
              rows="4"
            ></textarea>
            <div class="error-message" v-if="addJobErrors.description">
              {{ addJobErrors.description }}
            </div>
          </div>
          <div class="form-group">
            <label>Зарплата *</label>
            <input
              type="text"
              v-model="newJob.salary"
              class="form-control"
              :class="{ 'has-error': addJobErrors.salary }"
              placeholder="Например: 1500 сом"
            />
            <div class="error-message" v-if="addJobErrors.salary">{{ addJobErrors.salary }}</div>
          </div>
          <div class="form-group">
            <label>Локация *</label>
            <input
              type="text"
              v-model="newJob.location"
              class="form-control"
              :class="{ 'has-error': addJobErrors.location }"
              placeholder="Например: Бишкек, центр"
            />
            <div class="error-message" v-if="addJobErrors.location">
              {{ addJobErrors.location }}
            </div>
          </div>
          <div class="form-group">
            <label>Телефон *</label>
            <input
              type="tel"
              v-model="newJob.phone"
              class="form-control"
              :class="{ 'has-error': addJobErrors.phone }"
              placeholder="+996 XXX XXXXXX"
            />
            <div class="error-message" v-if="addJobErrors.phone">{{ addJobErrors.phone }}</div>
          </div>
          <div class="form-group">
            <label>Категория *</label>
            <select
              v-model="newJob.category"
              class="form-control"
              :class="{ 'has-error': addJobErrors.category }"
            >
              <option
                v-for="category in categories.filter((c) => c !== 'Все')"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
            <div class="error-message" v-if="addJobErrors.category">
              {{ addJobErrors.category }}
            </div>
          </div>
          <div class="form-group">
            <label>Дата *</label>
            <input type="date" v-model="newJob.date" class="form-control" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Добавить</button>
            <button type="button" class="btn btn-outline" @click="closeAddJobModal">Отмена</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно редактирования вакансии -->
    <div v-if="showEditJobModal" class="modal-overlay">
      <div class="modal">
        <h2>Редактировать вакансию</h2>
        <form @submit.prevent="handleEditJob">
          <div class="form-group">
            <label>Название вакансии *</label>
            <input
              type="text"
              v-model="editJob.title"
              class="form-control"
              :class="{ 'has-error': editJobErrors.title }"
            />
            <div class="error-message" v-if="editJobErrors.title">{{ editJobErrors.title }}</div>
          </div>
          <div class="form-group">
            <label>Описание *</label>
            <textarea
              v-model="editJob.description"
              class="form-control"
              :class="{ 'has-error': editJobErrors.description }"
              rows="4"
            ></textarea>
            <div class="error-message" v-if="editJobErrors.description">
              {{ editJobErrors.description }}
            </div>
          </div>
          <div class="form-group">
            <label>Зарплата *</label>
            <input
              type="text"
              v-model="editJob.salary"
              class="form-control"
              :class="{ 'has-error': editJobErrors.salary }"
              placeholder="Например: 1500 сом"
            />
            <div class="error-message" v-if="editJobErrors.salary">{{ editJobErrors.salary }}</div>
          </div>
          <div class="form-group">
            <label>Локация *</label>
            <input
              type="text"
              v-model="editJob.location"
              class="form-control"
              :class="{ 'has-error': editJobErrors.location }"
              placeholder="Например: Бишкек, центр"
            />
            <div class="error-message" v-if="editJobErrors.location">
              {{ editJobErrors.location }}
            </div>
          </div>
          <div class="form-group">
            <label>Телефон *</label>
            <input
              type="tel"
              v-model="editJob.phone"
              class="form-control"
              :class="{ 'has-error': editJobErrors.phone }"
              placeholder="+996 XXX XXXXXX"
            />
            <div class="error-message" v-if="editJobErrors.phone">{{ editJobErrors.phone }}</div>
          </div>
          <div class="form-group">
            <label>Категория *</label>
            <select
              v-model="editJob.category"
              class="form-control"
              :class="{ 'has-error': editJobErrors.category }"
            >
              <option
                v-for="category in categories.filter((c) => c !== 'Все')"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
            <div class="error-message" v-if="editJobErrors.category">
              {{ editJobErrors.category }}
            </div>
          </div>
          <div class="form-group">
            <label>Дата *</label>
            <input type="date" v-model="editJob.date" class="form-control" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Сохранить</button>
            <button type="button" class="btn btn-outline" @click="closeEditJobModal">Отмена</button>
          </div>
        </form>
      </div>
    </div>
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

/* Обновленные стили поиска */
.search-container {
  max-width: 800px;
  margin: 0 auto var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.search-bar {
  flex-basis: 600px;
  flex-grow: 1;
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  font-size: 1rem;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 14px 24px 14px 48px;
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

.add-job-button {
  display: flex;
  justify-content: center;
}

.btn-add-job {
  background-color: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-add-job:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(62, 104, 255, 0.2);
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

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  padding: 32px 28px;
  max-width: 500px;
  width: 100%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: var(--primary-color);
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
}

.modal .form-group {
  margin-bottom: 18px;
}

.modal .form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-family: var(--font-family-body);
}

.modal .form-control.has-error {
  border-color: var(--danger-color);
}

.modal .error-message {
  color: var(--danger-color);
  font-size: 13px;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
}

.btn-outline {
  background-color: white;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: rgba(62, 104, 255, 0.05);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: stretch;
    margin-left: var(--spacing-md);
    margin-right: var(--spacing-md);
  }

  .search-bar {
    max-width: 100%;
  }

  .add-job-button {
    width: 100%;
  }

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

  .search-input {
    padding: 12px 20px 12px 40px;
  }

  .search-icon {
    left: 16px;
  }

  .modal {
    padding: 24px 20px;
    max-width: 90%;
  }
}

.search-section {
  margin: var(--spacing-lg) 0;
}

.search-container {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  display: flex;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-family: var(--font-family-body);
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(62, 104, 255, 0.15);
}

.search-button {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-color-light);
  font-size: 1.2rem;
  cursor: pointer;
}

.categories-section {
  margin: var(--spacing-lg) 0;
}

.categories-wrapper {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.category-btn {
  padding: 10px 20px;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-color);
  font-family: var(--font-family-body);
  font-size: 0.95rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(62, 104, 255, 0.2);
}

.category-btn:hover:not(.active) {
  background-color: var(--bg-light);
  transform: translateY(-2px);
}

.jobs-actions {
  margin: var(--spacing-lg) 0;
  text-align: center;
}

.add-job-btn {
  padding: 12px 24px;
  font-weight: var(--font-weight-medium);
}

.jobs-filter-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.jobs-count {
  font-size: 1rem;
  color: var(--text-color-light);
}

.active-filters {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-tag {
  background-color: var(--bg-light);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-filter {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--text-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-filter:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--danger-color);
}

.no-jobs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  background-color: var(--bg-light);
  border-radius: var(--radius-lg);
  margin: var(--spacing-xl) 0;
  text-align: center;
}

.no-jobs .job-icon {
  font-size: 3rem;
  color: var(--text-color-lighter);
  margin-bottom: var(--spacing-md);
}

.no-jobs h3 {
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.no-jobs p {
  color: var(--text-color-light);
}

.reset-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.reset-btn:hover {
  color: var(--primary-color-dark);
}

/* Стили для тестовой панели */
.test-panel {
  margin: 10px 0;
  padding: 10px;
  background-color: #ffe9e9;
  border-radius: 5px;
  border: 1px dashed #ff6b6b;
}

.test-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.test-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.3s;
}

.test-btn:hover {
  background-color: #ff5252;
}

.test-status {
  font-weight: bold;
  color: #333;
  font-size: 0.9rem;
}
</style>
