// src/components/GoogleSignIn.vue - Обновленная версия
<template>
  <div class="google-login-container">
    <div 
      id="google-signin-button" 
      v-if="hasClientId"
      class="google-signin-button"
    ></div>
    
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

    <!-- Индикатор режима работы -->
    <div v-if="showMode" class="auth-mode" :class="{ online: isOnlineMode }">
      <i :class="isOnlineMode ? 'fas fa-cloud' : 'fas fa-laptop'"></i>
      {{ isOnlineMode ? 'Онлайн' : 'Демо' }} режим
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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

const buttonText = computed(() => props.isRegister ? 'signup_with' : 'continue_with')

// Проверяем доступность backend
onMounted(async () => {
  try {
    await fetch(import.meta.env.VITE_API_URL + '/health')
    isOnlineMode.value = true
    showMode.value = true
  } catch (e) {
    isOnlineMode.value = false
    showMode.value = true
  }
  
  setTimeout(() => {
    showMode.value = false
  }, 3000) // Скрываем индикатор через 3 секунды
})

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

// Онлайн обработка через backend
async function handleOnlineGoogleAuth(response: GoogleCredentialResponse) {
  try {
    const result = await authAPI.googleAuth(
      response.credential, 
      props.isRegister ? 'worker' : undefined
    )

    // Сохраняем пользователя с токеном
    const userData = {
      ...result.user,
      token: result.token
    }
    
    localStorage.setItem('user', JSON.stringify(userData))
    router.push('/')
    
  } catch (err: any) {
    console.error('Google auth error:', err)
    error.value = err.response?.data?.error || 'Ошибка авторизации через Google'
  }
}

// Демо обработка для оффлайн режима
function handleDemoGoogleAuth(response: GoogleCredentialResponse) {
  try {
    const userInfo = parseJwt(response.credential)
    if (!userInfo) {
      error.value = 'Ошибка при обработке данных Google'
      return
    }
    // Используем только демо-аккаунт worker
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]')
    let googleUser = demoUsers.find((u: any) => u.userType === 'worker')
    if (!googleUser) {
      googleUser = {
        name: userInfo.name || userInfo.given_name + ' ' + userInfo.family_name,
        email: userInfo.email,
        phone: '',
        userType: 'worker',
        photo: userInfo.picture || '',
        age: 0,
        hasOtherJobs: false,
        skills: [],
        experience: '',
        authProvider: 'google',
        token: 'demo_google_token_' + Date.now()
      }
      demoUsers.push(googleUser)
      localStorage.setItem('demoUsers', JSON.stringify(demoUsers))
    }
    localStorage.setItem('user', JSON.stringify(googleUser))
    router.push('/')
  } catch (err) {
    console.error('Demo Google login error:', err)
    error.value = 'Ошибка при входе через Google'
  }
}

// Основная обработка Google ответа
const handleGoogleResponse = async (response: GoogleCredentialResponse) => {
  error.value = ''
  
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