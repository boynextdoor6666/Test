<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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

// Добавляем проверку на наличие ошибки redirect_uri_mismatch в URL
const urlParams = new URLSearchParams(window.location.search)
const hasRedirectError = urlParams.get('error') === 'redirect_uri_mismatch'
const showRedirectError = ref(hasRedirectError)

// Возвращаем origin для использования в шаблоне
const currentOrigin = computed(() => window.location.origin)

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
      // Если пользователь найден, создаем сессию с полными данными пользователя
      const sessionUser = {
        email: foundUser.email,
        userType: foundUser.userType,
        name: foundUser.name,
        fullName: foundUser.name,
        phone: foundUser.phone,
        age: foundUser.age || 0,
        photo: foundUser.photo || '',
        skills: foundUser.skills || [],
        experience: foundUser.experience || '',
        hasOtherJobs: foundUser.hasOtherJobs || false,
        authProvider: foundUser.authProvider || '',
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

// Функция для отображения инструкций по исправлению ошибки redirect_uri_mismatch
const showGoogleOAuthInstructions = () => {
  showRedirectError.value = true
}

// Функция для скрытия инструкций
const hideGoogleOAuthInstructions = () => {
  showRedirectError.value = false
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

          <!-- Ошибка "redirect_uri_mismatch" с инструкциями по исправлению -->
          <div v-if="showRedirectError" class="oauth-error-container">
            <div class="oauth-error-card">
              <div class="oauth-error-header">
                <h3>Ошибка настройки Google OAuth</h3>
                <button class="close-btn" @click="hideGoogleOAuthInstructions">&times;</button>
              </div>
              <div class="oauth-error-content">
                <p>
                  <strong>Проблема:</strong> Ошибка "redirect_uri_mismatch" возникает, когда URI
                  перенаправления не настроен корректно в Google Cloud Console.
                </p>

                <div class="error-details">
                  <p>
                    Текущий URI перенаправления: <code>{{ currentOrigin }}</code>
                  </p>
                </div>

                <h4>Шаги для исправления:</h4>
                <ol>
                  <li>
                    Откройте
                    <a href="https://console.cloud.google.com/apis/credentials" target="_blank"
                      >Google Cloud Console</a
                    >
                  </li>
                  <li>Найдите и выберите ваш проект</li>
                  <li>Перейдите в раздел "Credentials" (Учетные данные)</li>
                  <li>Найдите и отредактируйте ваш OAuth 2.0 Client ID</li>
                  <li>
                    В разделе "Authorized redirect URIs" добавьте следующие URI:
                    <ul>
                      <li>
                        <code>{{ currentOrigin }}</code>
                      </li>
                      <li>
                        <code>{{ currentOrigin }}/</code>
                      </li>
                      <li>
                        <code>{{ currentOrigin }}/login</code>
                      </li>
                      <li>
                        <code>{{ currentOrigin }}/register</code>
                      </li>
                      <li>
                        <code>{{ currentOrigin }}/dashboard</code>
                      </li>
                    </ul>
                  </li>
                  <li>Нажмите "Save" (Сохранить)</li>
                  <li>Изменения могут вступить в силу через несколько минут</li>
                </ol>

                <p class="note">
                  Примечание: Если вы используете локальную разработку, также добавьте URIs для
                  других портов (например, http://localhost:3000, http://localhost:5173 и т.д.)
                </p>

                <div class="oauth-error-actions">
                  <button class="btn btn-primary" @click="hideGoogleOAuthInstructions">
                    Понятно
                  </button>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    class="btn btn-outline"
                    >Открыть Google Cloud Console</a
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Ссылка для показа инструкций по настройке Google OAuth -->
          <div class="oauth-help">
            <button class="text-link" @click="showGoogleOAuthInstructions">
              Проблемы с входом через Google? Нажмите здесь
            </button>
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
  color: #333333;
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
  color: #333333;
}

.form-control {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
  color: #333333;
}

.form-control::placeholder {
  color: #777777;
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
  color: #555555;
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
  color: #333333;
}

.demo-account {
  background-color: rgba(0, 0, 0, 0.02);
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  color: #333333;
}

.demo-account strong {
  color: #222222;
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

/* Стили для ошибки OAuth */
.oauth-error-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.oauth-error-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.oauth-error-header {
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
}

.oauth-error-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #721c24;
  cursor: pointer;
}

.oauth-error-content {
  padding: 20px;
  color: #333333;
}

.error-details {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
  color: #333333;
}

.oauth-error-content h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #333333;
}

.oauth-error-content ol {
  padding-left: 20px;
  color: #333333;
}

.oauth-error-content ol li {
  margin-bottom: 8px;
}

.oauth-error-content ul {
  margin-top: 8px;
  color: #333333;
}

.oauth-error-content code {
  background-color: #f0f0f0;
  padding: 3px 6px;
  border-radius: 3px;
  font-family: monospace;
  word-break: break-all;
}

.note {
  font-style: italic;
  color: #6c757d;
  margin-top: 15px;
}

.oauth-error-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 20px;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: rgba(62, 104, 255, 0.1);
}

.oauth-help {
  text-align: center;
  margin-top: 15px;
}

.text-link {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
}

.text-link:hover {
  color: var(--primary-hover);
}

@media (max-width: 600px) {
  .login-card {
    margin: 20px;
    max-width: none;
  }

  .oauth-error-card {
    max-height: 85vh;
  }

  .oauth-error-actions {
    flex-direction: column;
  }
}
</style>
