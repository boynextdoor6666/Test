<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Данные формы
const formData = ref({
  phone: '',
  password: '',
})

// Валидация
const errors = ref({
  phone: '',
  password: '',
})

// Обработка отправки формы
const handleSubmit = () => {
  // Сбросить ошибки
  errors.value.phone = ''
  errors.value.password = ''

  // Валидация полей
  let isValid = true

  if (!formData.value.phone) {
    errors.value.phone = 'Пожалуйста, введите номер телефона'
    isValid = false
  }

  if (!formData.value.password) {
    errors.value.password = 'Пожалуйста, введите пароль'
    isValid = false
  }

  if (isValid) {
    // Имитация успешного входа (в реальном приложении здесь будет запрос к API)
    const user = {
      phone: formData.value.phone,
      name: 'Тестовый пользователь',
      userType: 'worker', // или 'employer'
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
    userType: 'worker',
  }

  // Сохраняем данные пользователя в localStorage
  localStorage.setItem('user', JSON.stringify(user))

  // Перенаправляем в личный кабинет
  router.push('/dashboard')
}
</script>

<template>
  <div class="login">
    <div class="container">
      <h1 class="text-center">Вход в аккаунт</h1>

      <div class="login-form">
        <form @submit.prevent="handleSubmit">
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

          <div class="oauth-options">
            <button type="button" class="btn btn-telegram" @click="loginWithTelegram">
              <i class="icon-telegram"></i> Войти через Telegram
            </button>
          </div>

          <div class="form-group">
            <button type="submit" class="btn btn-primary btn-block">Войти</button>
          </div>

          <div class="register-link">
            Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  padding: 40px 0;
}

.login-form {
  max-width: 400px;
  margin: 30px auto 0;
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-control.has-error {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 5px;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-top: 15px;
}

.register-link {
  text-align: center;
  margin-top: 15px;
}

.oauth-options {
  margin: 15px 0;
}

.btn-telegram {
  width: 100%;
  background-color: #0088cc;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

.icon-telegram::before {
  content: '✈️';
}
</style>
