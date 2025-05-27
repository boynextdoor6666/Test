// src/components/GoogleSignIn.vue - Обновленная версия
<template>
  <div class="google-login-container">
    <div 
      id="google-signin-button" 
      v-if="hasClientId && isGoogleLoaded"
      class="google-signin-button"
    ></div>
    
    <div v-else-if="!hasClientId" class="google-fallback">
      <div class="google-config-warning">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Google аутентификация не настроена</p>
        <small>Проверьте переменную VITE_GOOGLE_CLIENT_ID</small>
      </div>
    </div>

    <div v-else class="loading-indicator">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Загрузка Google Auth...</span>
    </div>
    
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
      <button @click="retryInit" class="retry-btn">Попробовать снова</button>
    </div>

    <!-- Индикатор режима работы -->
    <div v-if="showMode" class="auth-mode" :class="{ online: isOnlineMode }">
      <i :class="isOnlineMode ? 'fas fa-cloud' : 'fas fa-laptop'"></i>
      {{ isOnlineMode ? 'Онлайн' : 'Демо' }} режим
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/utils/api'

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
const isOnlineMode = ref(false)
const showMode = ref(false)
const retryCount = ref(0)
const maxRetries = 3

const buttonText = computed(() => props.isRegister ? 'signup_with' : 'continue_with')

// Проверяем доступность backend с таймаутом
const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 секунды таймаут
    
    const response = await fetch(import.meta.env.VITE_API_URL + '/health', {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response.ok
  } catch (e) {
    return false
  }
}

onMounted(async () => {
  // Проверяем доступность backend
  try {
    isOnlineMode.value = await checkBackendHealth()
    showMode.value = true
    
    setTimeout(() => {
      showMode.value = false
    }, 3000)
  } catch (e) {
    isOnlineMode.value = false
    showMode.value = true
  }
})

// Декодирование JWT токена с улучшенной обработкой ошибок
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) {
      throw new Error('Invalid token format')
    }
    
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

// Онлайн обработка через backend с улучшенной обработкой ошибок
async function handleOnlineGoogleAuth(response: GoogleCredentialResponse) {
  try {
    const result = await authAPI.googleAuth(
      response.credential, 
      props.isRegister ? 'worker' : undefined
    )

    if (!result || !result.user) {
      throw new Error('Неверный ответ от сервера')
    }

    // Сохраняем пользователя с токеном
    const userData = {
      ...result.user,
      token: result.token || 'fallback_token_' + Date.now(),
      authProvider: 'google'
    }
    
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Перенаправляем на dashboard после успешной авторизации
    await router.push('/dashboard')
    
  } catch (err: any) {
    console.error('Google auth error:', err)
    const errorMessage = err.response?.data?.error || err.message || 'Ошибка авторизации через Google'
    error.value = errorMessage
    
    // Если ошибка связана с сетью, переключаемся на демо режим
    if (err.code === 'NETWORK_ERROR' || err.message.includes('fetch')) {
      isOnlineMode.value = false
      handleDemoGoogleAuth(response)
    }
  }
}

// Демо обработка для оффлайн режима с улучшенной валидацией
function handleDemoGoogleAuth(response: GoogleCredentialResponse) {
  try {
    const userInfo = parseJwt(response.credential)
    if (!userInfo || !userInfo.email) {
      error.value = 'Ошибка при обработке данных Google'
      return
    }
    
    // Создаем демо пользователя
    const googleUser = {
      id: 'demo_' + Date.now(),
      name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 'Google User',
      email: userInfo.email,
      phone: '',
      userType: props.isRegister ? 'worker' : 'worker',
      photo: userInfo.picture || '',
      age: 0,
      hasOtherJobs: false,
      skills: [],
      experience: '',
      authProvider: 'google',
      token: 'demo_google_token_' + Date.now()
    }
    
    // Сохраняем в демо-хранилище
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]')
    const existingUserIndex = demoUsers.findIndex((u: any) => u.email === googleUser.email)
    
    if (existingUserIndex >= 0) {
      demoUsers[existingUserIndex] = googleUser
    } else {
      demoUsers.push(googleUser)
    }
    
    localStorage.setItem('demoUsers', JSON.stringify(demoUsers))
    localStorage.setItem('user', JSON.stringify(googleUser))
    
    router.push('/dashboard')
  } catch (err) {
    console.error('Demo Google login error:', err)
    error.value = 'Ошибка при входе через Google'
  }
}

// Основная обработка Google ответа
const handleGoogleResponse = async (response: GoogleCredentialResponse) => {
  error.value = ''
  
  if (!response || !response.credential) {
    error.value = 'Неверный ответ от Google'
    return
  }
  
  try {
    if (isOnlineMode.value) {
      await handleOnlineGoogleAuth(response)
    } else {
      handleDemoGoogleAuth(response)
    }
  } catch (err) {
    console.error('Google response handling error:', err)
    error.value = 'Произошла ошибка при авторизации'
  }
}

// Инициализация Google Sign-In с улучшенной обработкой ошибок
const initializeGoogleSignIn = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  
  if (!clientId) {
    console.warn('Google Client ID не настроен')
    error.value = 'Google Client ID не настроен'
    return false
  }

  if (!window.google?.accounts?.id) {
    error.value = 'Google API не загружен'
    return false
  }

  try {
    // Правильная настройка для Railway и других хостингов
    const currentOrigin = window.location.origin
    
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
      context: props.isRegister ? 'signup' : 'signin'
    })

    const buttonElement = document.getElementById('google-signin-button')
    if (!buttonElement) {
      error.value = 'Не найден элемент для кнопки Google'
      return false
    }

    window.google.accounts.id.renderButton(buttonElement, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: buttonText.value,
      shape: 'rectangular',
      logo_alignment: 'left'
    })
    
    isGoogleLoaded.value = true
    return true
  } catch (err) {
    console.error('Error initializing Google Sign-In:', err)
    error.value = 'Ошибка инициализации Google Auth'
    return false
  }
}

// Загрузка Google Script с retry логикой
const loadGoogleScript = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google)
      return
    }

    // Удаляем существующий скрипт если есть
    const existingScript = document.querySelector('script[src*="accounts.google.com"]')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    let timeoutId: number
    
    script.onload = () => {
      clearTimeout(timeoutId)
      // Даем время на инициализацию Google API
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          resolve(window.google)
        } else {
          reject(new Error('Google API не инициализирован после загрузки'))
        }
      }, 500)
    }
    
    script.onerror = () => {
      clearTimeout(timeoutId)
      reject(new Error('Не удалось загрузить Google Script'))
    }
    
    // Таймаут для загрузки скрипта
    timeoutId = setTimeout(() => {
      reject(new Error('Таймаут загрузки Google Script'))
    }, 10000)
    
    document.head.appendChild(script)
  })
}

// Функция повторной инициализации
const retryInit = async () => {
  if (retryCount.value >= maxRetries) {
    error.value = 'Превышено максимальное количество попыток. Попробуйте обновить страницу.'
    return
  }
  
  retryCount.value++
  error.value = ''
  isGoogleLoaded.value = false
  
  try {
    await loadGoogleScript()
    const success = initializeGoogleSignIn()
    if (!success) {
      throw new Error('Инициализация не удалась')
    }
  } catch (error) {
    console.error('Retry initialization failed:', error)
    error.value = `Попытка ${retryCount.value}/${maxRetries} не удалась`
  }
}

onMounted(async () => {
  if (!hasClientId.value) {
    return
  }
  
  try {
    await loadGoogleScript()
    initializeGoogleSignIn()
  } catch (err) {
    console.error('Failed to load Google Sign-In:', err)
    error.value = 'Не удалось загрузить Google Sign-In'
  }
})

// Очистка при размонтировании
onUnmounted(() => {
  if (window.handleGoogleLogin) {
    delete window.handleGoogleLogin
  }
})

// Глобальная функция для обратной совместимости
window.handleGoogleLogin = handleGoogleResponse
</script>

<style scoped>
.google-login-container {
  width: 100%;
  position: relative;
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

.auth-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: #f5f5f5;
  color: #666;
  transition: opacity 0.3s ease;
}

.auth-mode.online {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.auth-mode i {
  font-size: 12px;
}

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