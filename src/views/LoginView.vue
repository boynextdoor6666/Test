<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import GoogleLoginButton from '@/components/GoogleLoginButton.vue'

const router = useRouter()
const route = useRoute()

// Список предустановленных пользователей
const registeredUsers = [
  {
    email: 'worker@example.com',
    password: 'password123',
    userType: 'worker',
    name: 'Иван Рабочий',
    phone: '+996 555 123456',
  },
  {
    email: 'employer@example.com',
    password: 'password123',
    userType: 'employer',
    name: 'Алексей Работодатель',
    phone: '+996 700 654321',
  },
]

const loginForm = ref({
  email: '',
  password: '',
  userType: 'worker', // По умолчанию "работник"
})

const error = ref('')
const isLoading = ref(false)
const usersInitialized = ref(false)

// Инициализация демо-пользователей при первом запуске
onMounted(() => {
  if (!usersInitialized.value) {
    // Сначала проверим, есть ли уже пользователи в localStorage
    const existingUsers = localStorage.getItem('registeredUsers')
    if (!existingUsers) {
      // Если нет, создаем демо-пользователей
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
    }
    usersInitialized.value = true
  }
})

function handleLogin() {
  isLoading.value = true
  error.value = ''

  // Имитация запроса к API
  setTimeout(() => {
    isLoading.value = false

    if (!loginForm.value.email || !loginForm.value.password) {
      error.value = 'Пожалуйста, заполните все поля'
      return
    }

    // Получаем список зарегистрированных пользователей
    const usersData = localStorage.getItem('registeredUsers') || '[]'
    const users = JSON.parse(usersData)

    // Ищем пользователя по email и паролю
    const foundUser = users.find(
      (user: any) =>
        user.email === loginForm.value.email && user.password === loginForm.value.password,
    )

    if (foundUser) {
      // Если пользователь найден, создаем сессию
      const sessionUser = {
        email: foundUser.email,
        userType: foundUser.userType,
        name: foundUser.name,
        phone: foundUser.phone,
      }

      localStorage.setItem('user', JSON.stringify(sessionUser))

      // Перенаправляем пользователя
      const redirectPath = (route.query.redirect as string) || '/'
      router.push(redirectPath)
    } else {
      // Если пользователь не найден, показываем ошибку
      error.value = 'Неверный email или пароль'
    }
  }, 500)
}

function handleRegister() {
  // Переход в режим регистрации
  router.push('/register')
}
</script>

<template>
  <div class="login-view">
    <div class="container">
      <div class="login-container">
        <div class="login-header">
          <h1>Вход в систему</h1>
          <p>Войдите в систему, чтобы получить доступ к вакансиям</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="loginForm.email"
              class="form-control"
              placeholder="Введите ваш email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <input
              type="password"
              id="password"
              v-model="loginForm.password"
              class="form-control"
              placeholder="Введите ваш пароль"
              required
            />
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="login-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? 'Вход...' : 'Войти' }}
            </button>

            <button
              type="button"
              class="btn btn-outline"
              @click="handleRegister"
              :disabled="isLoading"
            >
              Регистрация
            </button>
          </div>

          <!-- Google auth button -->
          <div class="social-login">
            <div class="divider">
              <span>или</span>
            </div>
            <GoogleLoginButton />
          </div>

          <!-- Демо-аккаунты для тестирования -->
          <div class="demo-accounts">
            <div class="demo-accounts-title">Тестовые аккаунты:</div>
            <div class="demo-account">
              <div><strong>Работник:</strong> worker@example.com</div>
              <div><strong>Пароль:</strong> password123</div>
            </div>
            <div class="demo-account">
              <div><strong>Работодатель:</strong> employer@example.com</div>
              <div><strong>Пароль:</strong> password123</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.login-container {
  max-width: 500px;
  margin: 0 auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.login-header p {
  color: var(--text-color-light);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(62, 104, 255, 0.1);
}

.error-message {
  color: var(--danger-color);
  font-size: 14px;
  padding: 8px 12px;
  background-color: rgba(255, 0, 0, 0.05);
  border-radius: 4px;
  border-left: 3px solid var(--danger-color);
}

.login-actions {
  display: flex;
  gap: 16px;
  margin-top: 10px;
}

.login-actions button {
  flex: 1;
  padding: 12px;
}

.social-login {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 10px 0;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 15px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.divider span {
  padding: 0 10px;
  color: var(--text-color-light);
  font-size: 14px;
}

.demo-accounts {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed var(--border-color);
  font-size: 14px;
}

.demo-accounts-title {
  text-align: center;
  margin-bottom: 10px;
  font-weight: 500;
  color: var(--text-color-light);
}

.demo-account {
  background-color: rgba(0, 0, 0, 0.02);
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

@media (max-width: 600px) {
  .login-container {
    padding: 30px 20px;
    margin: 0 20px;
  }

  .login-actions {
    flex-direction: column;
  }
}
</style>
