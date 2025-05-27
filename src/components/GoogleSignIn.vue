<template>
  <div class="google-login-container">
    <div 
      id="google-signin-button" 
      v-if="hasClientId"
      class="google-signin-button"
    ></div>
    
    <!-- Fallback кнопка если Google SDK не загружен -->
    <div v-else-if="!isGoogleLoaded" class="google-fallback">
      <div class="google-config-warning">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Google аутентификация не настроена</p>
        <small>Проверьте переменную VITE_GOOGLE_CLIENT_ID</small>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  isRegister: {
    type: Boolean,
    default: false
  }
})

interface GoogleCredentialResponse {
  credential: string
  select_by: string
}

declare global {
  interface Window {
    google: any
    handleGoogleLogin: (response: GoogleCredentialResponse) => void
  }
}

const router = useRouter()
const isGoogleLoaded = ref(false)
const error = ref('')
const hasClientId = ref(!!import.meta.env.VITE_GOOGLE_CLIENT_ID)

// Вычисляем текст кнопки в зависимости от страницы
const buttonText = computed(() => props.isRegister ? 'signup_with' : 'continue_with')

// Декодирование JWT токена
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Error parsing JWT:', e)
    return null
  }
}

// Обработка успешного входа через Google
const handleGoogleResponse = async (response: GoogleCredentialResponse) => {
  try {
    const userInfo = parseJwt(response.credential)
    
    if (!userInfo) {
      error.value = 'Ошибка при обработке данных Google'
      return
    }

    // Создаем пользователя из данных Google
    const googleUser = {
      name: userInfo.name || userInfo.given_name + ' ' + userInfo.family_name,
      fullName: userInfo.name || userInfo.given_name + ' ' + userInfo.family_name,
      email: userInfo.email,
      phone: '', // Телефон не предоставляется Google
      userType: 'worker', // По умолчанию работник, можно будет изменить в профиле
      photo: userInfo.picture || '',
      age: 0,
      hasOtherJobs: false,
      skills: [],
      experience: '',
      authProvider: 'google'
    }

    // Проверяем, существует ли уже пользователь с таким email
    const usersData = localStorage.getItem('registeredUsers') || '[]'
    const users = JSON.parse(usersData)
    
    let existingUser = users.find((user: any) => user.email === googleUser.email)
    
    if (!existingUser) {
      // Если пользователь новый, добавляем его в список
      users.push(googleUser)
      localStorage.setItem('registeredUsers', JSON.stringify(users))
      existingUser = googleUser
    } else {
      // Обновляем фото и имя из Google (если они изменились)
      existingUser.photo = googleUser.photo
      existingUser.name = googleUser.name
      existingUser.fullName = googleUser.fullName
      existingUser.authProvider = 'google'
      localStorage.setItem('registeredUsers', JSON.stringify(users))
    }

    // Создаем сессию
    localStorage.setItem('user', JSON.stringify(existingUser))

    // Перенаправляем пользователя
    router.push('/')
    
  } catch (error) {
    console.error('Google login error:', error)
    error.value = 'Ошибка при входе через Google'
  }
}

// Инициализация Google Sign-In
const initializeGoogleSignIn = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  
  if (!clientId) {
    console.warn('Google Client ID не настроен')
    return
  }

  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    })

    // Рендерим кнопку
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: buttonText.value,
        shape: 'rectangular'
      }
    )
    
    isGoogleLoaded.value = true
  }
}

// Загрузка Google Script
const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(window.google)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      // Небольшая задержка, чтобы убедиться что Google API загружен
      setTimeout(() => {
        resolve(window.google)
      }, 100)
    }
    
    script.onerror = reject
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  try {
    await loadGoogleScript()
    initializeGoogleSignIn()
  } catch (error) {
    console.error('Failed to load Google Sign-In:', error)
  }
})

// Глобальная функция для обработки ответа (на случай если callback не сработает)
window.handleGoogleLogin = handleGoogleResponse
</script>

<style scoped>
.google-login-container {
  width: 100%;
}

.google-signin-button {
  width: 100%;
  display: flex;
  justify-content: center;
}

.google-fallback {
  width: 100%;
  padding: 12px;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  background-color: rgba(255, 193, 7, 0.1);
}

.google-config-warning {
  text-align: center;
  color: #856404;
}

.google-config-warning i {
  font-size: 20px;
  margin-bottom: 8px;
  display: block;
}

.google-config-warning p {
  margin: 5px 0;
  font-weight: 500;
}

.google-config-warning small {
  font-size: 12px;
  opacity: 0.8;
}

.error-message {
  color: var(--danger-color);
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
  padding: 8px;
  background-color: rgba(255, 0, 0, 0.05);
  border-radius: 4px;
}

/* Стили для адаптации Google кнопки под наш дизайн */
:deep(.g_id_signin) {
  width: 100% !important;
}

:deep(.g_id_signin > div) {
  width: 100% !important;
}

:deep(.g_id_signin iframe) {
  width: 100% !important;
}
</style> 