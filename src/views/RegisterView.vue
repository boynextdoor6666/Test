<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Тип пользователя: работник или работодатель
const userType = ref('worker') // по умолчанию - работник

// Данные формы
const formData = ref({
  fullName: '',
  age: '',
  phone: '',
  hasOtherJobs: false,
  password: '',
  confirmPassword: '',
})

// Типы ошибок валидации
interface ValidationErrors {
  fullName: string
  age: string
  phone: string
  password: string
  confirmPassword: string
}

// Валидация
const errors = ref<ValidationErrors>({
  fullName: '',
  age: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

// Обработка отправки формы
const handleSubmit = () => {
  // Сбросить ошибки
  Object.keys(errors.value).forEach((key) => {
    const field = key as keyof ValidationErrors
    errors.value[field] = ''
  })

  // Валидация полей
  let isValid = true

  if (!formData.value.fullName) {
    errors.value.fullName = 'Пожалуйста, введите ФИО'
    isValid = false
  }

  if (!formData.value.age) {
    errors.value.age = 'Пожалуйста, введите возраст'
    isValid = false
  } else if (
    isNaN(Number(formData.value.age)) ||
    Number(formData.value.age) < 16 ||
    Number(formData.value.age) > 100
  ) {
    errors.value.age = 'Пожалуйста, введите корректный возраст (от 16 до 100)'
    isValid = false
  }

  if (!formData.value.phone) {
    errors.value.phone = 'Пожалуйста, введите номер телефона'
    isValid = false
  } else if (!/^\+?\d{10,13}$/.test(formData.value.phone.replace(/\s/g, ''))) {
    errors.value.phone = 'Пожалуйста, введите корректный номер телефона'
    isValid = false
  }

  if (!formData.value.password) {
    errors.value.password = 'Пожалуйста, введите пароль'
    isValid = false
  } else if (formData.value.password.length < 6) {
    errors.value.password = 'Пароль должен содержать минимум 6 символов'
    isValid = false
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Пароли не совпадают'
    isValid = false
  }

  if (isValid) {
    // Имитация успешной регистрации (в реальном приложении здесь будет запрос к API)
    const user = {
      fullName: formData.value.fullName,
      age: formData.value.age,
      phone: formData.value.phone,
      hasOtherJobs: formData.value.hasOtherJobs,
      userType: userType.value,
    }

    // Сохраняем данные пользователя в localStorage
    localStorage.setItem('user', JSON.stringify(user))

    // Перенаправляем в личный кабинет
    router.push('/dashboard')
  }
}

// Вход через Telegram (имитация)
const loginWithTelegram = () => {
  // Имитация входа через Telegram (в реальном приложении здесь будет интеграция с Telegram API)
  const user = {
    phone: '+996777000000',
    name: 'Telegram User',
    userType: userType.value,
    authProvider: 'telegram',
  }

  // Сохраняем данные пользователя в localStorage
  localStorage.setItem('user', JSON.stringify(user))

  // Перенаправляем в личный кабинет
  router.push('/dashboard')
}

// Вход через Google (имитация)
const registerWithGoogle = () => {
  // Имитация регистрации через Google (в реальном приложении здесь будет интеграция с Google API)
  const user = {
    email: 'google.user@gmail.com',
    name: 'Google User',
    userType: userType.value,
    authProvider: 'google',
  }

  // Сохраняем данные пользователя в localStorage
  localStorage.setItem('user', JSON.stringify(user))

  // Перенаправляем в личный кабинет
  router.push('/dashboard')
}

// Переключение между типами пользователей
const setUserType = (type: string) => {
  userType.value = type
}
</script>

<template>
  <div class="register">
    <div class="container">
      <h1 class="text-center">Регистрация</h1>

      <div class="user-type-selector">
        <button
          class="user-type-btn"
          :class="{ active: userType === 'worker' }"
          @click="setUserType('worker')"
        >
          Я ищу работу
        </button>
        <button
          class="user-type-btn"
          :class="{ active: userType === 'employer' }"
          @click="setUserType('employer')"
        >
          Я ищу работников
        </button>
      </div>

      <div class="register-form">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="fullName">ФИО *</label>
            <input
              type="text"
              id="fullName"
              v-model="formData.fullName"
              class="form-control"
              :class="{ 'has-error': errors.fullName }"
            />
            <div class="error-message" v-if="errors.fullName">{{ errors.fullName }}</div>
          </div>

          <div class="form-group">
            <label for="age">Возраст *</label>
            <input
              type="number"
              id="age"
              v-model="formData.age"
              class="form-control"
              :class="{ 'has-error': errors.age }"
            />
            <div class="error-message" v-if="errors.age">{{ errors.age }}</div>
          </div>

          <div class="form-group">
            <label for="phone">Номер телефона *</label>
            <input
              type="tel"
              id="phone"
              v-model="formData.phone"
              class="form-control"
              :class="{ 'has-error': errors.phone }"
              placeholder="+996 XXX XXXXXX"
            />
            <div class="error-message" v-if="errors.phone">{{ errors.phone }}</div>
          </div>

          <div class="form-group" v-if="userType === 'worker'">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.hasOtherJobs" />
              <span>У меня есть другая работа</span>
            </label>
          </div>

          <div class="form-group">
            <label for="password">Пароль *</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              class="form-control"
              :class="{ 'has-error': errors.password }"
            />
            <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Подтверждение пароля *</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="formData.confirmPassword"
              class="form-control"
              :class="{ 'has-error': errors.confirmPassword }"
            />
            <div class="error-message" v-if="errors.confirmPassword">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <div class="form-group">
            <button type="submit" class="btn btn-primary btn-block">Зарегистрироваться</button>
          </div>

          <div class="oauth-separator">или зарегистрируйтесь через</div>

          <div class="oauth-options">
            <button type="button" class="btn btn-telegram" @click="loginWithTelegram">
              <i class="fab fa-telegram-plane"></i> Войти через Telegram
            </button>
            <button type="button" class="btn btn-google" @click="registerWithGoogle">
              <i class="fab fa-google"></i> Войти через Google
            </button>
          </div>

          <div class="login-link">
            Уже есть аккаунт? <router-link to="/login">Войти</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register {
  padding: var(--spacing-xl) 0;
}

h1 {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  margin-bottom: var(--spacing-lg);
}

.user-type-selector {
  display: flex;
  justify-content: center;
  margin: var(--spacing-lg) 0 var(--spacing-xl);
  gap: var(--spacing-md);
}

.user-type-btn {
  padding: 14px 24px;
  border: 2px solid var(--primary-color);
  background-color: white;
  color: var(--primary-color);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-body);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.user-type-btn.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(62, 104, 255, 0.25);
}

.register-form {
  max-width: 500px;
  margin: 0 auto;
  background-color: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  font-family: var(--font-family-body);
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-family: var(--font-family-body);
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(62, 104, 255, 0.1);
}

.form-control.has-error {
  border-color: var(--danger-color);
}

.form-control.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 71, 111, 0.1);
}

.error-message {
  color: var(--danger-color);
  font-size: 14px;
  margin-top: var(--spacing-xs);
  font-family: var(--font-family-body);
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-regular);
  cursor: pointer;
}

.checkbox-label span {
  margin-left: var(--spacing-sm);
}

input[type='checkbox'] {
  width: 18px;
  height: 18px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.btn-block {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  margin-top: var(--spacing-md);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(62, 104, 255, 0.2);
}

.oauth-options {
  margin: var(--spacing-md) 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.oauth-separator {
  text-align: center;
  margin: var(--spacing-md) 0;
  position: relative;
  color: var(--text-light);
  font-size: 14px;
}

.oauth-separator::before,
.oauth-separator::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 150px);
  height: 1px;
  background-color: var(--border-color);
}

.oauth-separator::before {
  left: 0;
}

.oauth-separator::after {
  right: 0;
}

.btn-telegram {
  width: 100%;
  background-color: #0088cc;
  color: white;
  border: none;
  padding: 12px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 136, 204, 0.2);
}

.btn-telegram:hover {
  background-color: #0077b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
}

.btn-telegram i {
  font-size: 1.25rem;
}

.btn-google {
  width: 100%;
  background-color: white;
  color: #757575;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-google:hover {
  background-color: #f8f8f8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-google i {
  font-size: 1.25rem;
  color: #4285f4;
}

.login-link {
  text-align: center;
  margin-top: var(--spacing-md);
  font-family: var(--font-family-body);
  color: var(--text-secondary);
}

.login-link a {
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .user-type-selector {
    flex-direction: column;
    margin: var(--spacing-md) 0 var(--spacing-lg);
    padding: 0 var(--spacing-md);
  }

  .user-type-btn {
    width: 100%;
    text-align: center;
  }

  .register-form {
    padding: var(--spacing-lg);
    margin-left: var(--spacing-md);
    margin-right: var(--spacing-md);
  }
}
</style>
