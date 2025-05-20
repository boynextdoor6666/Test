<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'

// Тип пользователя и данные пользователя (будут загружены из localStorage)
const userType = ref('worker')
const user = ref({
  fullName: '',
  phone: '',
  email: '',
  age: 0,
  hasOtherJobs: false,
  authProvider: '',
  skills: [], // Навыки работника
  experience: '', // Опыт работы
  avatar: '', // URL аватара
  photo: '', // Фото профиля (Base64)
})

// Состояние для редактирования профиля
const showEditProfileModal = ref(false)
const editProfileData = ref({
  fullName: '',
  phone: '',
  email: '',
  age: 0,
  hasOtherJobs: false,
  skills: '',
  experience: '',
})
const editProfileErrors = ref({
  fullName: '',
  phone: '',
  email: '',
  age: '',
})

// Добавляем параметры для обработки фото профиля
const profilePhoto = reactive({
  file: null as File | null,
  preview: '',
  error: '',
})

// Вакансии/задания (пример данных)
const defaultJobs = [
  {
    id: 1,
    title: 'Уборщица на 2 часа',
    description: 'Требуется уборщица для уборки квартиры, площадь 65 кв.м.',
    salary: '1000 сом',
    location: 'Бишкек, 10 мкр',
    phone: '+996 555 123456',
    date: '2023-06-01',
    status: 'new', // new, in-progress, completed
  },
  {
    id: 2,
    title: 'Разнорабочий на стройку',
    description: 'Требуется разнорабочий на стройку на 1 день.',
    salary: '1500 сом',
    location: 'Бишкек, ул. Киевская',
    phone: '+996 700 654321',
    date: '2023-06-02',
    status: 'in-progress',
  },
  {
    id: 3,
    title: 'Курьер на 3 часа',
    description: 'Требуется курьер для доставки документов по городу.',
    salary: '500 сом',
    location: 'Бишкек, центр',
    phone: '+996 777 987654',
    date: '2023-06-03',
    status: 'completed',
  },
]

const jobs = ref([])
// Мои принятые вакансии (для работников)
const myJobs = ref([])

// Загрузка данных пользователя и вакансий из localStorage
onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.userType) {
        userType.value = parsedUser.userType
      }
      user.value = {
        fullName: parsedUser.fullName || parsedUser.name || 'Пользователь',
        phone: parsedUser.phone || '',
        email: parsedUser.email || '',
        age: parsedUser.age || 0,
        hasOtherJobs: parsedUser.hasOtherJobs !== undefined ? parsedUser.hasOtherJobs : false,
        authProvider: parsedUser.authProvider || '',
        skills: parsedUser.skills || [],
        experience: parsedUser.experience || '',
        avatar: parsedUser.avatar || '',
        photo: parsedUser.photo || '',
      }
    } catch (e) {
      console.error('Ошибка при загрузке данных пользователя:', e)
    }
  }

  // Загрузка вакансий
  const jobsData = localStorage.getItem('jobs')
  if (jobsData) {
    try {
      const parsedJobs = JSON.parse(jobsData)
      // Добавляем статус, если его нет (для совместимости со страницей Найти работу)
      jobs.value = parsedJobs.map((job) => ({
        ...job,
        status: job.status || 'new',
      }))
    } catch (e) {
      console.error('Ошибка при загрузке вакансий:', e)
      jobs.value = defaultJobs
    }
  } else {
    jobs.value = defaultJobs
    localStorage.setItem('jobs', JSON.stringify(defaultJobs))
  }

  // Загрузка списка принятых вакансий для работника
  const myJobsData = localStorage.getItem('myJobs')
  if (myJobsData && userType.value === 'worker') {
    try {
      myJobs.value = JSON.parse(myJobsData)
    } catch (e) {
      console.error('Ошибка при загрузке принятых вакансий:', e)
      myJobs.value = []
    }
  }

  // Загружаем фото из пользовательских данных, если оно есть
  if (user.value.photo) {
    profilePhoto.preview = user.value.photo
  }
})

// Активная вкладка в личном кабинете
const activeTab = ref('profile')

// Фильтр статуса заданий
const statusFilter = ref('all')

// Фильтрованные задания
const filteredJobs = computed(() => {
  // Для работодателя - все его вакансии
  if (userType.value === 'employer') {
    if (statusFilter.value === 'all') {
      return jobs.value
    }
    return jobs.value.filter((job) => job.status === statusFilter.value)
  }
  // Для работника - только принятые им вакансии
  else {
    if (statusFilter.value === 'all') {
      return myJobs.value
    }
    return myJobs.value.filter((job) => job.status === statusFilter.value)
  }
})

// Доступные для принятия вакансии (для работника)
const availableJobs = computed(() => {
  if (userType.value !== 'worker') return []

  // Показываем вакансии, которые еще не приняты этим работником
  const myJobIds = myJobs.value.map((job) => job.id)

  return jobs.value.filter((job) => {
    // Базовая фильтрация - статус и не в моих откликах
    const basicFilter = job.status === 'new' && !myJobIds.includes(job.id)

    // Категория
    const categoryFilter =
      selectedCategoryAvailable.value === 'Все' || job.category === selectedCategoryAvailable.value

    // Поиск
    const searchFilter =
      !searchQueryAvailable.value ||
      job.title.toLowerCase().includes(searchQueryAvailable.value.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQueryAvailable.value.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQueryAvailable.value.toLowerCase())

    return basicFilter && categoryFilter && searchFilter
  })
})

// Фильтры для доступных вакансий
const selectedCategoryAvailable = ref('Все')
const searchQueryAvailable = ref('')
const categories = ref(['Все', 'Уборка', 'Строительство', 'Доставка', 'Ремонт', 'Няни', 'Разное'])

// Изменить категорию для доступных вакансий
const setAvailableCategory = (category) => {
  selectedCategoryAvailable.value = category
}

// Изменить активную вкладку
const setActiveTab = (tab) => {
  activeTab.value = tab
}

// Изменить фильтр статуса
const setStatusFilter = (status) => {
  statusFilter.value = status
}

// Форматирование статуса
const formatStatus = (status) => {
  const statusMap = {
    new: 'Новое',
    'in-progress': 'В работе',
    completed: 'Завершено',
  }
  return statusMap[status] || status
}

// Форматирование даты
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

// Иконка провайдера авторизации
const authProviderIcon = computed(() => {
  switch (user.value.authProvider) {
    case 'google':
      return 'fab fa-google'
    case 'telegram':
      return 'fab fa-telegram-plane'
    default:
      return 'fas fa-user'
  }
})

// Название провайдера авторизации
const authProviderName = computed(() => {
  switch (user.value.authProvider) {
    case 'google':
      return 'Google'
    case 'telegram':
      return 'Telegram'
    default:
      return 'Email и пароль'
  }
})

// Вычисляемые свойства для раздела заявок
const jobsWithApplications = computed(() => {
  if (userType.value !== 'employer') return []

  return jobs.value.filter((job) => job.applications && job.applications.length > 0)
})

const hasApplications = computed(() => {
  return jobsWithApplications.value.length > 0
})

// Форматирование статуса заявки
const formatApplicationStatus = (status) => {
  const statusMap = {
    new: 'Новая',
    accepted: 'Принята',
    rejected: 'Отклонена',
    completed: 'Завершена',
  }
  return statusMap[status] || status
}

// Форматирование даты и времени
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''

  const date = new Date(dateTimeString)

  // Форматируем дату
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  // Форматируем время
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${day}.${month}.${year} ${hours}:${minutes}`
}

// --- Функции для редактирования профиля ---
const openEditProfileModal = () => {
  showEditProfileModal.value = true

  // Заполняем форму текущими данными
  editProfileData.value = {
    fullName: user.value.fullName,
    phone: user.value.phone,
    email: user.value.email,
    age: user.value.age,
    hasOtherJobs: user.value.hasOtherJobs,
    skills: user.value.skills.join(', '),
    experience: user.value.experience,
  }

  // Инициализируем фото профиля
  if (user.value.photo) {
    profilePhoto.preview = user.value.photo
  } else {
    profilePhoto.preview = ''
  }
  profilePhoto.file = null
  profilePhoto.error = ''

  // Сбрасываем ошибки
  Object.keys(editProfileErrors.value).forEach((key) => (editProfileErrors.value[key] = ''))
}

const closeEditProfileModal = () => {
  showEditProfileModal.value = false
}

// Обработчик выбора фото
const handlePhotoChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) {
    return
  }

  const file = input.files[0]

  // Проверка на тип файла (только изображения)
  if (!file.type.match('image.*')) {
    profilePhoto.error = 'Пожалуйста, выберите изображение'
    profilePhoto.file = null
    profilePhoto.preview = ''
    return
  }

  // Проверка на размер файла (не более 5МБ)
  if (file.size > 5 * 1024 * 1024) {
    profilePhoto.error = 'Размер файла не должен превышать 5МБ'
    profilePhoto.file = null
    profilePhoto.preview = ''
    return
  }

  // Сохраняем файл и создаем превью
  profilePhoto.file = file
  profilePhoto.error = ''

  // Создаем URL для превью
  const reader = new FileReader()
  reader.onload = (e) => {
    profilePhoto.preview = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Убираем выбранное фото
const removePhoto = () => {
  profilePhoto.file = null
  profilePhoto.preview = ''
  profilePhoto.error = ''
}

// Обновляем функцию сохранения профиля, добавляя сохранение фото
const saveProfileChanges = () => {
  // Валидация
  let valid = true

  if (!editProfileData.value.fullName) {
    editProfileErrors.value.fullName = 'Введите ФИО'
    valid = false
  }

  if (!editProfileData.value.phone) {
    editProfileErrors.value.phone = 'Введите номер телефона'
    valid = false
  }

  if (!editProfileData.value.email) {
    editProfileErrors.value.email = 'Введите email'
    valid = false
  }

  if (!editProfileData.value.age) {
    editProfileErrors.value.age = 'Введите возраст'
    valid = false
  } else if (
    isNaN(Number(editProfileData.value.age)) ||
    Number(editProfileData.value.age) < 16 ||
    Number(editProfileData.value.age) > 100
  ) {
    editProfileErrors.value.age = 'Введите корректный возраст (от 16 до 100)'
    valid = false
  }

  if (!valid) return

  // Обновляем данные пользователя
  user.value = {
    ...user.value,
    fullName: editProfileData.value.fullName,
    phone: editProfileData.value.phone,
    email: editProfileData.value.email,
    age: Number(editProfileData.value.age),
    hasOtherJobs: editProfileData.value.hasOtherJobs,
    skills: editProfileData.value.skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s),
    experience: editProfileData.value.experience,
    photo: profilePhoto.preview || user.value.photo, // Сохраняем фото, если оно есть
  }

  // Сохраняем обновленные данные в localStorage
  const userData = localStorage.getItem('user')
  if (userData) {
    const parsedUser = JSON.parse(userData)
    const updatedUser = {
      ...parsedUser,
      fullName: user.value.fullName,
      phone: user.value.phone,
      email: user.value.email,
      age: user.value.age,
      hasOtherJobs: user.value.hasOtherJobs,
      skills: user.value.skills,
      experience: user.value.experience,
      photo: user.value.photo, // Сохраняем фото в localStorage
    }
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  // Закрываем модальное окно
  showEditProfileModal.value = false
}

// --- Функции для принятия вакансий (для работника) ---
const applyForJob = (job) => {
  // Проверяем, не откликался ли уже пользователь на эту вакансию
  const alreadyApplied = myJobs.value.some((myJob) => myJob.id === job.id)
  if (alreadyApplied) {
    alert(`Вы уже откликнулись на вакансию "${job.title}"`)
    return
  }

  // Клонируем объект вакансии, чтобы не менять оригинал
  const jobCopy = {
    ...job,
    appliedAt: new Date().toISOString(),
    status: 'new',
    applicantData: {
      id: Date.now(),
      fullName: user.value.fullName,
      phone: user.value.phone,
      email: user.value.email,
      skills: user.value.skills,
      experience: user.value.experience,
    },
  }

  // Добавляем в список принятых вакансий
  myJobs.value.push(jobCopy)

  // Сохраняем в localStorage
  localStorage.setItem('myJobs', JSON.stringify(myJobs.value))

  // Обновляем статус вакансии в общем списке
  const jobIndex = jobs.value.findIndex((j) => j.id === job.id)
  if (jobIndex !== -1) {
    // Добавляем информацию о том, что есть заявка
    if (!jobs.value[jobIndex].applications) {
      jobs.value[jobIndex].applications = []
    }
    jobs.value[jobIndex].applications.push({
      applicantId: Date.now(),
      applicantName: user.value.fullName,
      appliedAt: new Date().toISOString(),
      status: 'new',
    })
    localStorage.setItem('jobs', JSON.stringify(jobs.value))
  }

  // Показываем уведомление
  alert(`Вы успешно откликнулись на вакансию "${job.title}"`)
}

// Добавим функции для управления статусом заявок для работодателя
const updateApplicationStatus = (jobId, applicantId, newStatus) => {
  // Обновляем статус заявки в общем списке вакансий
  const jobIndex = jobs.value.findIndex((job) => job.id === jobId)

  if (jobIndex !== -1 && jobs.value[jobIndex].applications) {
    const appIndex = jobs.value[jobIndex].applications.findIndex(
      (app) => app.applicantId === applicantId,
    )

    if (appIndex !== -1) {
      jobs.value[jobIndex].applications[appIndex].status = newStatus
      localStorage.setItem('jobs', JSON.stringify(jobs.value))

      // Если статус "принято", обновляем статус самой вакансии
      if (newStatus === 'accepted') {
        jobs.value[jobIndex].status = 'in-progress'
        localStorage.setItem('jobs', JSON.stringify(jobs.value))
      }
    }
  }
}

// Функция для отмены отклика на вакансию (для работника)
const cancelApplication = (jobId) => {
  if (confirm('Вы уверены, что хотите отменить отклик на эту вакансию?')) {
    // Удаляем из списка принятых вакансий
    const jobIndex = myJobs.value.findIndex((job) => job.id === jobId)
    if (jobIndex !== -1) {
      myJobs.value.splice(jobIndex, 1)
      localStorage.setItem('myJobs', JSON.stringify(myJobs.value))

      // Удаляем заявку из общего списка вакансий
      const allJobIndex = jobs.value.findIndex((job) => job.id === jobId)
      if (allJobIndex !== -1 && jobs.value[allJobIndex].applications) {
        const appIndex = jobs.value[allJobIndex].applications.findIndex(
          (app) => app.applicantName === user.value.fullName,
        )
        if (appIndex !== -1) {
          jobs.value[allJobIndex].applications.splice(appIndex, 1)
          localStorage.setItem('jobs', JSON.stringify(jobs.value))
        }
      }
    }
  }
}

// --- Функции для изменения статуса вакансии ---
const changeJobStatus = (jobId, newStatus) => {
  // Обновляем статус в списке всех вакансий
  const jobIndex = jobs.value.findIndex((job) => job.id === jobId)
  if (jobIndex !== -1) {
    jobs.value[jobIndex].status = newStatus
    localStorage.setItem('jobs', JSON.stringify(jobs.value))
  }

  // Если это принятая вакансия работника, обновляем и там
  if (userType.value === 'worker') {
    const myJobIndex = myJobs.value.findIndex((job) => job.id === jobId)
    if (myJobIndex !== -1) {
      myJobs.value[myJobIndex].status = newStatus
      localStorage.setItem('myJobs', JSON.stringify(myJobs.value))
    }
  }
}

// --- Добавление вакансии ---
const showAddJobModal = ref(false)
const showEditJobModal = ref(false)
const currentJobId = ref(null)
const newJob = ref({
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  date: '',
})
const editJob = ref({
  // Для редактирования существующей вакансии
  id: null,
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  date: '',
  status: 'new',
  category: 'Разное',
})
const addJobErrors = ref({
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  date: '',
})
const editJobErrors = ref({
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  date: '',
})

const openAddJobModal = () => {
  showAddJobModal.value = true
  showEditJobModal.value = false
  Object.keys(newJob.value).forEach((key) => (newJob.value[key] = ''))
  Object.keys(addJobErrors.value).forEach((key) => (addJobErrors.value[key] = ''))

  // Предзаполняем данные
  newJob.value.date = new Date().toISOString().split('T')[0]
  if (user.value.phone) {
    newJob.value.phone = user.value.phone
  }
}

const closeAddJobModal = () => {
  showAddJobModal.value = false
}

// --- Редактирование вакансии ---
const openEditJobModal = (job) => {
  showAddJobModal.value = false
  showEditJobModal.value = true

  // Очистка ошибок
  Object.keys(editJobErrors.value).forEach((key) => (editJobErrors.value[key] = ''))

  // Копируем данные редактируемой вакансии
  editJob.value = { ...job }

  currentJobId.value = job.id
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
  if (!editJob.value.date) {
    editJobErrors.value.date = 'Выберите дату'
    valid = false
  }

  if (!valid) return

  // Обновление вакансии в массиве
  const index = jobs.value.findIndex((job) => job.id === currentJobId.value)
  if (index !== -1) {
    jobs.value[index] = { ...editJob.value }
    localStorage.setItem('jobs', JSON.stringify(jobs.value))
    showEditJobModal.value = false
    currentJobId.value = null
  }
}

// --- Удаление вакансии ---
const handleDeleteJob = (jobId) => {
  if (confirm('Вы уверены, что хотите удалить эту вакансию?')) {
    const index = jobs.value.findIndex((job) => job.id === jobId)
    if (index !== -1) {
      jobs.value.splice(index, 1)
      localStorage.setItem('jobs', JSON.stringify(jobs.value))
    }
  }
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
  if (!newJob.value.date) {
    addJobErrors.value.date = 'Выберите дату'
    valid = false
  }
  if (!valid) return

  // Добавление вакансии
  const job = {
    id: Date.now(),
    title: newJob.value.title,
    description: newJob.value.description,
    salary: newJob.value.salary,
    location: newJob.value.location,
    phone: newJob.value.phone,
    date: newJob.value.date,
    status: 'new',
    category: 'Разное', // Добавляем категорию для совместимости с JobsView
  }
  jobs.value.unshift(job)
  localStorage.setItem('jobs', JSON.stringify(jobs.value))
  showAddJobModal.value = false
}
</script>

<template>
  <div class="dashboard">
    <div class="container">
      <h1 class="text-center">Личный кабинет</h1>

      <div class="dashboard-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'profile' }"
          @click="setActiveTab('profile')"
        >
          Профиль
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'jobs' }"
          @click="setActiveTab('jobs')"
        >
          {{ userType === 'worker' ? 'Мои задания' : 'Мои вакансии' }}
        </button>
        <button
          v-if="userType === 'worker'"
          class="tab-btn"
          :class="{ active: activeTab === 'available-jobs' }"
          @click="setActiveTab('available-jobs')"
        >
          Доступные вакансии
        </button>
        <button
          v-if="userType === 'employer'"
          class="tab-btn"
          :class="{ active: activeTab === 'applications' }"
          @click="setActiveTab('applications')"
        >
          Заявки
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'notifications' }"
          @click="setActiveTab('notifications')"
        >
          Уведомления
        </button>
      </div>

      <!-- Профиль пользователя -->
      <div class="tab-content" v-if="activeTab === 'profile'">
        <div class="profile-card">
          <div class="profile-header">
            <h2>Личные данные</h2>
            <button @click="openEditProfileModal" class="btn btn-primary">
              <i class="fas fa-edit"></i> Редактировать профиль
            </button>
          </div>

          <!-- Обновляем блок отображения аватара профиля пользователя, чтобы показывать загруженное фото -->
          <div class="profile-avatar" v-if="user.photo">
            <img :src="user.photo" alt="Фото пользователя" class="avatar-img" />
          </div>
          <div class="profile-avatar" v-else-if="user.avatar">
            <img :src="user.avatar" alt="Аватар пользователя" class="avatar-img" />
          </div>
          <div class="profile-avatar" v-else>
            <div class="avatar-placeholder">
              <i class="fas fa-user-circle"></i>
            </div>
          </div>

          <div class="profile-info">
            <div class="profile-field">
              <span class="field-label">ФИО:</span>
              <span class="field-value">{{ user.fullName }}</span>
            </div>

            <div class="profile-field">
              <span class="field-label">Телефон:</span>
              <span class="field-value">{{ user.phone }}</span>
            </div>

            <div class="profile-field">
              <span class="field-label">Email:</span>
              <span class="field-value">{{ user.email }}</span>
            </div>

            <div class="profile-field">
              <span class="field-label">Возраст:</span>
              <span class="field-value">{{ user.age }} лет</span>
            </div>

            <div class="profile-field" v-if="userType === 'worker'">
              <span class="field-label">Наличие другой работы:</span>
              <span class="field-value">{{ user.hasOtherJobs ? 'Да' : 'Нет' }}</span>
            </div>

            <div
              class="profile-field"
              v-if="userType === 'worker' && user.skills && user.skills.length > 0"
            >
              <span class="field-label">Навыки:</span>
              <span class="field-value">
                <span v-for="(skill, index) in user.skills" :key="index" class="skill-tag">
                  {{ skill }}
                </span>
              </span>
            </div>

            <div class="profile-field" v-if="userType === 'worker' && user.experience">
              <span class="field-label">Опыт работы:</span>
              <span class="field-value">{{ user.experience }}</span>
            </div>

            <div class="profile-field">
              <span class="field-label">Тип аккаунта:</span>
              <span class="field-value">{{
                userType === 'worker' ? 'Работник' : 'Работодатель'
              }}</span>
            </div>

            <div class="profile-field" v-if="user.authProvider">
              <span class="field-label">Способ входа:</span>
              <span class="field-value auth-provider">
                <i :class="authProviderIcon" class="auth-icon"></i>
                {{ authProviderName }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Работы/Задания -->
      <div class="tab-content" v-else-if="activeTab === 'jobs'">
        <div class="jobs-filters">
          <h2>{{ userType === 'worker' ? 'Мои задания' : 'Мои вакансии' }}</h2>

          <div class="status-filter">
            <button
              class="filter-btn"
              :class="{ active: statusFilter === 'all' }"
              @click="setStatusFilter('all')"
            >
              Все
            </button>
            <button
              class="filter-btn"
              :class="{ active: statusFilter === 'new' }"
              @click="setStatusFilter('new')"
            >
              Новые
            </button>
            <button
              class="filter-btn"
              :class="{ active: statusFilter === 'in-progress' }"
              @click="setStatusFilter('in-progress')"
            >
              В работе
            </button>
            <button
              class="filter-btn"
              :class="{ active: statusFilter === 'completed' }"
              @click="setStatusFilter('completed')"
            >
              Завершенные
            </button>
          </div>

          <div v-if="userType === 'employer'" class="mt-3">
            <button class="btn btn-primary" @click="openAddJobModal">
              <i class="fas fa-plus"></i> Создать новую вакансию
            </button>
          </div>
        </div>

        <div class="jobs-list mt-4">
          <div v-if="filteredJobs.length === 0" class="no-jobs">
            <p>Нет заданий, соответствующих выбранному фильтру</p>
          </div>

          <div v-else class="job-items">
            <div v-for="job in filteredJobs" :key="job.id" class="job-item">
              <div class="job-header">
                <h3>{{ job.title }}</h3>
                <div class="job-status" :class="job.status">
                  {{ formatStatus(job.status) }}
                </div>
              </div>

              <div class="job-body">
                <p>{{ job.description }}</p>

                <div class="job-details">
                  <div class="job-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ job.location }}</span>
                  </div>
                  <div class="job-detail">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>{{ job.salary }}</span>
                  </div>
                  <div class="job-detail">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ formatDate(job.date) }}</span>
                  </div>
                  <div class="job-detail" v-if="job.category">
                    <i class="fas fa-tag"></i>
                    <span>{{ job.category }}</span>
                  </div>
                  <div class="job-detail" v-if="userType === 'worker' && job.appliedAt">
                    <i class="fas fa-clock"></i>
                    <span>Отклик: {{ formatDateTime(job.appliedAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="job-actions">
                <button class="btn btn-primary">Подробнее</button>
                <button
                  class="btn btn-outline"
                  v-if="job.status === 'new' && userType === 'employer'"
                  @click="openEditJobModal(job)"
                >
                  <i class="fas fa-edit"></i> Редактировать
                </button>
                <button
                  class="btn btn-danger"
                  v-if="job.status === 'new' && userType === 'employer'"
                  @click="handleDeleteJob(job.id)"
                >
                  <i class="fas fa-trash-alt"></i> Удалить
                </button>
                <button
                  class="btn btn-outline"
                  v-if="job.status === 'new' && userType === 'worker'"
                >
                  Откликнуться
                </button>
                <button class="btn btn-success" v-if="job.status === 'in-progress'">
                  Завершить
                </button>
                <button
                  class="btn btn-danger"
                  v-if="userType === 'worker' && job.status === 'new'"
                  @click="cancelApplication(job.id)"
                >
                  <i class="fas fa-times"></i> Отменить отклик
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Доступные вакансии (для работника) -->
      <div class="tab-content" v-else-if="activeTab === 'available-jobs' && userType === 'worker'">
        <div class="jobs-filters">
          <h2>Доступные вакансии</h2>

          <div class="filter-options">
            <div class="search-container">
              <input
                type="text"
                v-model="searchQueryAvailable"
                placeholder="Поиск по названию, описанию или локации..."
                class="search-input"
              />
              <i class="fas fa-search search-icon"></i>
            </div>

            <div class="category-filter">
              <div class="categories-wrapper">
                <button
                  v-for="category in categories"
                  :key="category"
                  class="category-btn"
                  :class="{ active: selectedCategoryAvailable === category }"
                  @click="setAvailableCategory(category)"
                >
                  {{ category }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="jobs-list mt-4">
          <div v-if="availableJobs.length === 0" class="no-jobs">
            <p>Нет доступных вакансий в данный момент</p>
          </div>

          <div v-else class="job-items">
            <div v-for="job in availableJobs" :key="job.id" class="job-item">
              <div class="job-header">
                <h3>{{ job.title }}</h3>
                <div class="job-status new">Новая</div>
              </div>

              <div class="job-body">
                <p>{{ job.description }}</p>

                <div class="job-details">
                  <div class="job-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ job.location }}</span>
                  </div>
                  <div class="job-detail">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>{{ job.salary }}</span>
                  </div>
                  <div class="job-detail">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ formatDate(job.date) }}</span>
                  </div>
                  <div class="job-detail" v-if="job.category">
                    <i class="fas fa-tag"></i>
                    <span>{{ job.category }}</span>
                  </div>
                </div>
              </div>

              <div class="job-actions">
                <button class="btn btn-primary" @click="applyForJob(job)">
                  <i class="fas fa-check"></i> Откликнуться
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Заявки на вакансии (для работодателя) -->
      <div class="tab-content" v-else-if="activeTab === 'applications' && userType === 'employer'">
        <div class="applications-header">
          <h2>Заявки на ваши вакансии</h2>
        </div>

        <div class="applications-container">
          <div v-if="hasApplications" class="application-list">
            <div v-for="job in jobsWithApplications" :key="job.id" class="application-job-card">
              <div class="application-job-header">
                <h3>{{ job.title }}</h3>
                <div class="job-status" :class="job.status">
                  {{ formatStatus(job.status) }}
                </div>
              </div>

              <p class="application-job-description">{{ job.description }}</p>

              <div class="application-details">
                <div class="application-detail">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ job.location }}</span>
                </div>
                <div class="application-detail">
                  <i class="fas fa-money-bill-wave"></i>
                  <span>{{ job.salary }}</span>
                </div>
                <div class="application-detail">
                  <i class="fas fa-calendar-alt"></i>
                  <span>{{ formatDate(job.date) }}</span>
                </div>
              </div>

              <div class="applications-count">
                <span>Всего заявок: {{ job.applications.length }}</span>
              </div>

              <div class="applicants-list">
                <h4>Соискатели:</h4>
                <div v-for="app in job.applications" :key="app.applicantId" class="applicant-card">
                  <div class="applicant-header">
                    <h5>{{ app.applicantName }}</h5>
                    <div class="applicant-status" :class="app.status">
                      {{ formatApplicationStatus(app.status) }}
                    </div>
                  </div>

                  <div class="applicant-details">
                    <div class="applicant-applied-date">
                      <i class="fas fa-clock"></i>
                      <span>Откликнулся: {{ formatDateTime(app.appliedAt) }}</span>
                    </div>
                  </div>

                  <div class="applicant-actions" v-if="app.status === 'new'">
                    <button
                      class="btn btn-primary"
                      @click="updateApplicationStatus(job.id, app.applicantId, 'accepted')"
                    >
                      <i class="fas fa-check"></i> Принять
                    </button>
                    <button
                      class="btn btn-danger"
                      @click="updateApplicationStatus(job.id, app.applicantId, 'rejected')"
                    >
                      <i class="fas fa-times"></i> Отклонить
                    </button>
                  </div>

                  <div class="applicant-actions" v-else-if="app.status === 'accepted'">
                    <button class="btn btn-success" @click="changeJobStatus(job.id, 'completed')">
                      <i class="fas fa-check-double"></i> Завершить работу
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-applications">
            <p>На ваши вакансии еще нет откликов</p>
            <button class="btn btn-primary" @click="setActiveTab('jobs')">
              <i class="fas fa-briefcase"></i> Перейти к моим вакансиям
            </button>
          </div>
        </div>
      </div>

      <!-- Уведомления -->
      <div class="tab-content" v-else-if="activeTab === 'notifications'">
        <div class="notifications-card">
          <h2>Уведомления</h2>

          <div class="notifications-list">
            <div class="notification-item">
              <div class="notification-icon notification-info">
                <i class="icon-info"></i>
              </div>
              <div class="notification-content">
                <div class="notification-text">
                  Новая вакансия соответствует вашему профилю: "Сборка мебели"
                </div>
                <div class="notification-date">15.06.2023</div>
              </div>
            </div>

            <div class="notification-item">
              <div class="notification-icon notification-success">
                <i class="icon-success"></i>
              </div>
              <div class="notification-content">
                <div class="notification-text">
                  Ваша заявка на вакансию "Курьер на 3 часа" принята
                </div>
                <div class="notification-date">10.06.2023</div>
              </div>
            </div>

            <div class="notification-item">
              <div class="notification-icon notification-warning">
                <i class="icon-warning"></i>
              </div>
              <div class="notification-content">
                <div class="notification-text">
                  Напоминание: завтра у вас задание "Уборщица на 2 часа"
                </div>
                <div class="notification-date">05.06.2023</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования профиля -->
    <div v-if="showEditProfileModal" class="modal-overlay">
      <div class="modal">
        <h2>Редактирование профиля</h2>
        <form @submit.prevent="saveProfileChanges">
          <!-- Добавляем блок для загрузки фото профиля -->
          <div class="form-group profile-photo-upload">
            <label>Фото профиля</label>
            <div class="photo-upload-container">
              <div class="photo-preview" :class="{ 'has-photo': profilePhoto.preview }">
                <img
                  v-if="profilePhoto.preview"
                  :src="profilePhoto.preview"
                  alt="Profile Preview"
                />
                <div v-else class="photo-placeholder">
                  <i class="fas fa-user"></i>
                </div>

                <button
                  v-if="profilePhoto.preview"
                  type="button"
                  class="remove-photo"
                  @click="removePhoto"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="photo-upload-controls">
                <label for="photo-upload-edit" class="upload-btn">
                  <i class="fas fa-camera"></i>
                  {{ profilePhoto.preview ? 'Изменить фото' : 'Загрузить фото' }}
                </label>
                <input
                  type="file"
                  id="photo-upload-edit"
                  accept="image/*"
                  @change="handlePhotoChange"
                  class="photo-input"
                />
                <p class="photo-hint">JPG, PNG, GIF. Макс. размер 5МБ</p>
                <div v-if="profilePhoto.error" class="photo-error">
                  {{ profilePhoto.error }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="fullName">ФИО *</label>
            <input
              type="text"
              id="fullName"
              v-model="editProfileData.fullName"
              class="form-control"
              :class="{ 'has-error': editProfileErrors.fullName }"
            />
            <div class="error-message" v-if="editProfileErrors.fullName">
              {{ editProfileErrors.fullName }}
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Телефон *</label>
            <input
              type="tel"
              id="phone"
              v-model="editProfileData.phone"
              class="form-control"
              :class="{ 'has-error': editProfileErrors.phone }"
            />
            <div class="error-message" v-if="editProfileErrors.phone">
              {{ editProfileErrors.phone }}
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              type="email"
              id="email"
              v-model="editProfileData.email"
              class="form-control"
              :class="{ 'has-error': editProfileErrors.email }"
            />
            <div class="error-message" v-if="editProfileErrors.email">
              {{ editProfileErrors.email }}
            </div>
          </div>

          <div class="form-group">
            <label for="age">Возраст *</label>
            <input
              type="number"
              id="age"
              v-model="editProfileData.age"
              class="form-control"
              :class="{ 'has-error': editProfileErrors.age }"
            />
            <div class="error-message" v-if="editProfileErrors.age">
              {{ editProfileErrors.age }}
            </div>
          </div>

          <div class="form-group" v-if="userType === 'worker'">
            <label class="checkbox-label">
              <input type="checkbox" v-model="editProfileData.hasOtherJobs" />
              <span>У меня есть другая работа</span>
            </label>
          </div>

          <div class="form-group" v-if="userType === 'worker'">
            <label for="skills">Навыки (через запятую)</label>
            <input
              type="text"
              id="skills"
              v-model="editProfileData.skills"
              class="form-control"
              placeholder="Например: уборка, готовка, ремонт"
            />
          </div>

          <div class="form-group" v-if="userType === 'worker'">
            <label for="experience">Опыт работы</label>
            <textarea
              id="experience"
              v-model="editProfileData.experience"
              class="form-control"
              rows="3"
              placeholder="Расскажите о вашем опыте"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Сохранить изменения</button>
            <button type="button" class="btn btn-outline" @click="closeEditProfileModal">
              Отмена
            </button>
          </div>
        </form>
      </div>
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
            />
            <div class="error-message" v-if="addJobErrors.phone">{{ addJobErrors.phone }}</div>
          </div>
          <div class="form-group">
            <label>Дата *</label>
            <input
              type="date"
              v-model="newJob.date"
              class="form-control"
              :class="{ 'has-error': addJobErrors.date }"
            />
            <div class="error-message" v-if="addJobErrors.date">{{ addJobErrors.date }}</div>
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
            <label for="editTitle">Название вакансии *</label>
            <input
              type="text"
              id="editTitle"
              v-model="editJob.title"
              class="form-control"
              :class="{ 'has-error': editJobErrors.title }"
            />
            <div class="error-message" v-if="editJobErrors.title">{{ editJobErrors.title }}</div>
          </div>

          <div class="form-group">
            <label for="editDescription">Описание *</label>
            <textarea
              id="editDescription"
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
            <label for="editSalary">Зарплата *</label>
            <input
              type="text"
              id="editSalary"
              v-model="editJob.salary"
              class="form-control"
              :class="{ 'has-error': editJobErrors.salary }"
            />
            <div class="error-message" v-if="editJobErrors.salary">{{ editJobErrors.salary }}</div>
          </div>

          <div class="form-group">
            <label for="editLocation">Локация *</label>
            <input
              type="text"
              id="editLocation"
              v-model="editJob.location"
              class="form-control"
              :class="{ 'has-error': editJobErrors.location }"
            />
            <div class="error-message" v-if="editJobErrors.location">
              {{ editJobErrors.location }}
            </div>
          </div>

          <div class="form-group">
            <label for="editPhone">Телефон *</label>
            <input
              type="tel"
              id="editPhone"
              v-model="editJob.phone"
              class="form-control"
              :class="{ 'has-error': editJobErrors.phone }"
            />
            <div class="error-message" v-if="editJobErrors.phone">{{ editJobErrors.phone }}</div>
          </div>

          <div class="form-group">
            <label for="editCategory">Категория</label>
            <select id="editCategory" v-model="editJob.category" class="form-control">
              <option value="Уборка">Уборка</option>
              <option value="Строительство">Строительство</option>
              <option value="Доставка">Доставка</option>
              <option value="Ремонт">Ремонт</option>
              <option value="Няни">Няни</option>
              <option value="Разное">Разное</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editDate">Дата *</label>
            <input
              type="date"
              id="editDate"
              v-model="editJob.date"
              class="form-control"
              :class="{ 'has-error': editJobErrors.date }"
            />
            <div class="error-message" v-if="editJobErrors.date">{{ editJobErrors.date }}</div>
          </div>

          <div class="form-group">
            <label for="editStatus">Статус</label>
            <select id="editStatus" v-model="editJob.status" class="form-control">
              <option value="new">Новая</option>
              <option value="in-progress">В работе</option>
              <option value="completed">Завершена</option>
            </select>
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
.dashboard {
  padding: var(--spacing-xl) 0;
}

.dashboard-tabs {
  display: flex;
  justify-content: center;
  margin: var(--spacing-xl) 0;
  gap: var(--spacing-md);
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background-color: white;
  color: var(--text-color);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-body);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.tab-btn.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(62, 104, 255, 0.25);
}

.tab-content {
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: var(--spacing-xl);
}

/* Профиль */
.profile-card h2,
.jobs-filters h2,
.notifications-card h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  color: var(--primary-color);
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.profile-avatar {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
}

.avatar-placeholder {
  width: a20px;
  height: 120px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: #ccc;
}

.profile-info {
  margin-bottom: var(--spacing-lg);
}

.profile-field {
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.field-label {
  font-weight: var(--font-weight-medium);
  margin-right: var(--spacing-lg);
  color: var(--text-secondary);
  min-width: 180px;
}

.field-value {
  font-weight: var(--font-weight-medium);
  color: var(--text-color);
}

.auth-provider {
  display: flex;
  align-items: center;
}

.auth-icon {
  margin-right: 8px;
  font-size: 1.1rem;
}

.auth-icon.fa-google {
  color: #4285f4;
}

.auth-icon.fa-telegram-plane {
  color: #0088cc;
}

/* Задания */
.status-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.filter-btn {
  padding: 8px 18px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: white;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 3px 8px rgba(62, 104, 255, 0.2);
}

.job-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.job-item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  background-color: white;
}

.job-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--card-shadow);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.job-header h3 {
  margin: 0;
  color: var(--primary-color);
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
}

.job-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-body);
}

.job-status.new {
  background-color: #e6f7ff;
  color: #1890ff;
}

.job-status.in-progress {
  background-color: #fff7e6;
  color: #fa8c16;
}

.job-status.completed {
  background-color: #f6ffed;
  color: var(--success-color);
}

.job-body {
  margin-bottom: var(--spacing-lg);
}

.job-body p {
  font-family: var(--font-family-body);
  color: var(--text-color);
  line-height: 1.6;
}

.job-details {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

.job-detail {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-family: var(--font-family-body);
}

.job-actions {
  display: flex;
  gap: var(--spacing-md);
}

.btn-outline {
  background-color: white;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-weight: var(--font-weight-medium);
}

.btn-outline:hover {
  background-color: rgba(62, 104, 255, 0.05);
}

.btn-success {
  background-color: var(--success-color);
  color: white;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-weight: var(--font-weight-medium);
}

.btn-success:hover {
  background-color: #05b98a;
}

.icon-location::before,
.icon-money::before,
.icon-calendar::before {
  margin-right: 5px;
}

.icon-location::before {
  content: '📍';
}

.icon-money::before {
  content: '💰';
}

.icon-calendar::before {
  content: '📅';
}

/* Уведомления */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: white;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-lg);
  flex-shrink: 0;
}

.notification-info {
  background-color: #e6f7ff;
  color: #1890ff;
}

.notification-success {
  background-color: #f6ffed;
  color: var(--success-color);
}

.notification-warning {
  background-color: #fff7e6;
  color: var(--warning-color);
}

.notification-content {
  flex: 1;
}

.notification-text {
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-regular);
  color: var(--text-color);
}

.notification-date {
  font-size: 0.85rem;
  color: var(--text-light);
  font-family: var(--font-family-body);
}

.icon-info::before {
  content: 'ℹ️';
}

.icon-success::before {
  content: '✅';
}

.icon-warning::before {
  content: '⚠️';
}

.no-jobs {
  text-align: center;
  padding: var(--spacing-xl);
  background-color: #f9f9fa;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-regular);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  padding: 32px 28px;
  max-width: 420px;
  width: 100%;
  position: relative;
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
  margin-top: 18px;
}

.btn-danger {
  background-color: #f44336;
  color: white;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-weight: var(--font-weight-medium);
  border: none;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.icon-category::before {
  content: '🏷️';
}

.skill-tag {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 3px 8px;
  border-radius: 15px;
  font-size: 0.85rem;
  margin-right: 5px;
  margin-bottom: 5px;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

/* Стили для раздела заявок */
.applications-container {
  margin-top: var(--spacing-md);
}

.applications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.application-job-card {
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  transition: all 0.3s;
}

.application-job-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.application-job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.application-job-header h3 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.25rem;
}

.application-job-description {
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
}

.application-details {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.application-detail {
  display: flex;
  align-items: center;
  color: var(--text-color-light);
  font-size: 0.9rem;
}

.application-detail i {
  margin-right: var(--spacing-xs);
  width: 16px;
  color: var(--primary-color);
}

.applications-count {
  background-color: var(--bg-light);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  display: inline-block;
  margin-bottom: var(--spacing-md);
  font-weight: var(--font-weight-medium);
}

.applicants-list {
  margin-top: var(--spacing-md);
}

.applicants-list h4 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
  font-size: 1.1rem;
}

.applicant-card {
  background-color: var(--bg-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.applicant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.applicant-header h5 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color);
}

.applicant-status {
  font-size: 0.8rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  background-color: var(--bg-light);
  color: white;
}

.applicant-status.new {
  background-color: var(--primary-color);
}

.applicant-status.accepted {
  background-color: var(--success-color);
}

.applicant-status.rejected {
  background-color: var(--danger-color);
}

.applicant-status.completed {
  background-color: var(--info-color);
}

.applicant-details {
  margin-bottom: var(--spacing-sm);
}

.applicant-applied-date {
  display: flex;
  align-items: center;
  color: var(--text-color-light);
  font-size: 0.9rem;
}

.applicant-applied-date i {
  margin-right: var(--spacing-xs);
  width: 14px;
}

.applicant-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.no-applications {
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--bg-light);
  border-radius: var(--radius-lg);
}

.no-applications p {
  margin-bottom: var(--spacing-md);
  color: var(--text-color-light);
}

/* Фильтры для вакансий */
.filter-options {
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.search-container {
  position: relative;
  max-width: 600px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: var(--font-family-body);
  font-size: 1rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(62, 104, 255, 0.1);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-light);
}

.category-filter {
  margin-top: var(--spacing-sm);
}

.categories-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.category-btn {
  padding: 8px 16px;
  background-color: var(--bg-light);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-color);
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn.active {
  background-color: var(--primary-color);
  color: white;
}

.category-btn:hover:not(.active) {
  background-color: rgba(62, 104, 255, 0.1);
}

@media (max-width: 768px) {
  .dashboard {
    padding: var(--spacing-lg) 0;
  }

  .dashboard-tabs {
    flex-direction: column;
    margin: var(--spacing-lg) 0;
  }

  .tab-content {
    padding: var(--spacing-lg);
  }

  .job-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .job-status {
    margin-top: var(--spacing-sm);
  }

  .job-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
}

/* Стили для загрузки фото профиля */
.profile-photo-upload {
  margin-bottom: 20px;
}

.photo-upload-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.photo-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: 1px solid var(--border-color);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  font-size: 40px;
  color: #ccc;
}

.remove-photo {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.remove-photo:hover {
  background: rgba(255, 0, 0, 0.9);
}

.photo-upload-controls {
  flex: 1;
}

.upload-btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.upload-btn i {
  margin-right: 6px;
}

.upload-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
}

.photo-input {
  display: none;
}

.photo-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-color-light);
}

.photo-error {
  color: var(--danger-color);
  font-size: 14px;
  margin-top: 8px;
}

@media (max-width: 600px) {
  .photo-upload-container {
    flex-direction: column;
    align-items: center;
  }

  .photo-upload-controls {
    text-align: center;
    width: 100%;
    margin-top: 10px;
  }
}
</style>
