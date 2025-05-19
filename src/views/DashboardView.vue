<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Тип пользователя и данные пользователя (будут загружены из localStorage)
const userType = ref('worker')
const user = ref({
  fullName: '',
  phone: '',
  email: '',
  age: 0,
  hasOtherJobs: false,
  authProvider: '',
})

// Загрузка данных пользователя из localStorage
onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    const parsedUser = JSON.parse(userData)
    // Обновляем тип пользователя, если он есть в данных
    if (parsedUser.userType) {
      userType.value = parsedUser.userType
    }

    // Обновляем данные пользователя
    user.value = {
      fullName: parsedUser.fullName || parsedUser.name || 'Пользователь',
      phone: parsedUser.phone || '',
      email: parsedUser.email || '',
      age: parsedUser.age || 0,
      hasOtherJobs: parsedUser.hasOtherJobs !== undefined ? parsedUser.hasOtherJobs : false,
      authProvider: parsedUser.authProvider || '',
    }
  }
})

// Активная вкладка в личном кабинете
const activeTab = ref('profile')

// Вакансии/задания (пример данных)
const jobs = ref([
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
])

// Фильтр статуса заданий
const statusFilter = ref('all')

// Фильтрованные задания
const filteredJobs = computed(() => {
  if (statusFilter.value === 'all') {
    return jobs.value
  }
  return jobs.value.filter((job) => job.status === statusFilter.value)
})

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
          <h2>Личные данные</h2>

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

          <button class="btn btn-primary mt-3">Редактировать профиль</button>
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
            <a href="https://t.me/tezJumush" target="_blank" class="btn btn-primary">
              Создать новую вакансию
            </a>
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
                    <i class="icon-location"></i>
                    <span>{{ job.location }}</span>
                  </div>
                  <div class="job-detail">
                    <i class="icon-money"></i>
                    <span>{{ job.salary }}</span>
                  </div>
                  <div class="job-detail">
                    <i class="icon-calendar"></i>
                    <span>{{ formatDate(job.date) }}</span>
                  </div>
                </div>
              </div>

              <div class="job-actions">
                <button class="btn btn-primary">Подробнее</button>
                <button class="btn btn-outline" v-if="job.status === 'new'">
                  {{ userType === 'worker' ? 'Откликнуться' : 'Редактировать' }}
                </button>
                <button class="btn btn-success" v-if="job.status === 'in-progress'">
                  Завершить
                </button>
              </div>
            </div>
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
</style>
