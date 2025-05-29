// src/components/GoogleSignIn.vue - Обновленная версия
<template>
  <div class="google-login-container">
    <div 
      id="google-signin-button" 
      class="google-signin-button"
    ></div>
    
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
      <button @click="retryInit" class="retry-btn">{{ t('googleAuth.tryAgain') }}</button>
    </div>

    <div v-if="!clientId" class="config-error">
      <i class="fas fa-exclamation-triangle"></i>
      <span>VITE_GOOGLE_CLIENT_ID не настроен в .env файле</span>
    </div>
    
    <!-- Добавляем отладочную информацию -->
    <div v-if="showDebugInfo" class="debug-info">
      <p>Origin: {{ currentOrigin }}</p>
      <p>Client ID: {{ clientId ? (clientId.substring(0, 8) + '...') : 'Not set' }}</p>
      <button @click="testApiConnection" class="debug-btn">Test API Connection</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { logAuthDebugInfo, testGoogleAuthAPI } from '@/utils/debug-auth'

const props = defineProps({
  isRegister: {
    type: Boolean,
    default: false
  },
  debug: {
    type: Boolean,
    default: import.meta.env.DEV // Включено по умолчанию в режиме разработки
  }
})

const { t } = useI18n()
const isOnlineMode = ref(true)
const showMode = ref(false)
const clientId = ref('')
const showDebugInfo = ref(props.debug)
const currentOrigin = ref(window.location.origin || 'unknown')

// Типы для Google API
declare global {
  interface Window {
    google?: any
    handleGoogleLogin?: (response: any) => void
  }
}

const router = useRouter()
const error = ref('')
const retryCount = ref(0)
const maxRetries = 3

// Тестирование API соединения
async function testApiConnection() {
  try {
    const result = await testGoogleAuthAPI()
    alert(`API Connection Test: ${result ? 'Success' : 'Failed'}`)
  } catch (err) {
    alert(`API Connection Test Error: ${err.message}`)
  }
}

// Проверяем .env на корректность Client ID
onMounted(() => {
  clientId.value = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  if (!clientId.value) {
    console.error('VITE_GOOGLE_CLIENT_ID is not defined in .env file')
  } else {
    console.log('Using Google Client ID:', clientId.value.substring(0, 8) + '...')
  }
  
  // Выводим отладочную информацию
  if (showDebugInfo.value) {
    logAuthDebugInfo()
  }
})

// Обработка ответа от Google
async function handleCredentialResponse(response: any) {
  try {
    console.log('Получен ответ от Google авторизации');
    
    // Проверяем наличие токена в ответе
    if (!response || !response.credential) {
      console.error('Некорректный ответ от Google Auth:', response);
      error.value = t('googleAuth.authError');
      return;
    }
    
    try {
      // Пытаемся проверить доступность сервера
      const isOnline = await checkBackendHealth();
      
      if (isOnline) {
        // Если сервер доступен, отправляем запрос через API
        console.log('Сервер доступен, выполняем стандартную авторизацию');
        await handleOnlineGoogleAuth(response);
      } else {
        // Если сервер недоступен, используем демо режим
        console.log('Сервер недоступен, переключаемся в демо режим');
        handleDemoGoogleAuth(response);
      }
    } catch (err) {
      console.error('Ошибка при проверке доступности сервера:', err);
      // При любых ошибках используем демо режим
      console.log('Ошибка соединения, переключаемся в демо режим');
      handleDemoGoogleAuth(response);
    }
  } catch (e) {
    console.error('Критическая ошибка в обработчике Google Auth:', e);
    error.value = t('googleAuth.authError');
    return false;
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

// Онлайн обработка через backend с улучшенной обработкой ошибок
async function handleOnlineGoogleAuth(response: any) {
  try {
    // Импортируем authAPI динамически, чтобы избежать циклических зависимостей
    const { authAPI, setOfflineMode } = await import('@/utils/api')
    
    try {
      // Вызываем API для аутентификации через Google
      const result = await authAPI.googleAuth(
        response.credential, 
        props.isRegister ? 'worker' : undefined
      )

      if (!result || !result.data || !result.data.user) {
        throw new Error('Неверный ответ от сервера')
      }

      // Сохраняем пользователя с токеном
      const userData = {
        ...result.data.user,
        token: result.data.token,
        authProvider: 'google'
      };
      
      // Сохраняем пользователя
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Google auth successful, user saved:', userData);
      
      // Перенаправляем пользователя
      router.push('/');
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn('API endpoint for Google Auth not found (404). Switching to demo mode.');
        
        // Переключаемся в демо-режим
        setOfflineMode(true);
        handleDemoGoogleAuth(response);
        return;
      }
      
      throw err; // Re-throw для обработки в следующем catch блоке
    }
  } catch (err: any) {
    console.error('Google auth error:', err)
    const errorMessage = err.response?.data?.error || err.message || t('googleAuth.authError')
    error.value = errorMessage
    
    // Если ошибка связана с сетью, переключаемся на демо режим
    if (err.isNetworkError || err.code === 'NETWORK_ERROR' || err.message.includes('fetch')) {
      isOnlineMode.value = false
      handleDemoGoogleAuth(response)
    }
  }
}

// Декодирование JWT токена
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return null;
  }
}

// Инициализация Google Sign-In
function initializeGoogleSignIn() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    console.error('Google Client ID is missing or not configured properly');
    error.value = t('googleAuth.missingClientId');
    
    // Add a fallback message to help with configuration
    const fallbackMessage = document.createElement('div');
    fallbackMessage.className = 'google-fallback';
    fallbackMessage.innerHTML = `
      <div class="google-config-warning">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Google Authentication is not configured</p>
        <small>Check GOOGLE_AUTH_SETUP.md for instructions</small>
      </div>
    `;
    
    const buttonElement = document.getElementById('google-signin-button');
    if (buttonElement) {
      buttonElement.innerHTML = '';
      buttonElement.appendChild(fallbackMessage);
    }
    
    return false;
  }
  
  try {
    if (!window.google?.accounts?.id) {
      console.error("Google API not loaded correctly");
      return false;
    }
    
    const buttonElement = document.getElementById('google-signin-button');
    if (!buttonElement) {
      console.error("Button element not found");
      return false;
    }
    
    // Показываем текущий origin в консоли для отладки
    console.log('Current origin:', window.location.origin);
    
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });
    
    // Отображаем кнопку традиционным способом
    window.google.accounts.id.renderButton(buttonElement, {
      theme: 'outline',
      size: 'large',
      text: props.isRegister ? 'signup_with' : 'signin_with',
      width: 300, // Фиксированная ширина вместо процентной
      logo_alignment: 'center'
    });
    
    // Дополнительные проверки и логирование для отладки
    if (typeof window.location.origin !== 'string') {
      console.warn('window.location.origin is not available. Using fallback.');
    }
    
    return true;
  } catch (err) {
    console.error("Google initialization error:", err);
    error.value = t('googleAuth.initError');
    return false;
  }
}

// Загрузка Google Script
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    // Если скрипт уже загружен
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => setTimeout(() => resolve(window), 300);
    script.onerror = (e) => reject(e);
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

// Функция повторной инициализации
async function retryInit() {
  if (retryCount.value >= maxRetries) {
    error.value = t('googleAuth.maxRetriesExceeded');
    return;
  }
  
  retryCount.value++;
  error.value = t('googleAuth.retryAttempt', { current: retryCount.value, max: maxRetries });
  
  try {
    await loadGoogleScript();
    const success = initializeGoogleSignIn();
    
    if (!success && retryCount.value < maxRetries) {
      setTimeout(() => retryInit(), 1500);
    }
  } catch (err) {
    console.error('Retry initialization failed:', err)
    error.value = t('googleAuth.retryFailed', { current: retryCount.value, max: maxRetries })
  }
}

onMounted(async () => {
  try {
    await loadGoogleScript();
    const success = initializeGoogleSignIn();
    
    if (!success) {
      setTimeout(() => retryInit(), 1000);
    }
  } catch (err) {
    console.error('Failed to load Google Sign-In:', err)
    error.value = t('googleAuth.loadError')
  }
})

// Очистка при размонтировании
onUnmounted(() => {
  if (window.handleGoogleLogin) {
    delete window.handleGoogleLogin
  }
})

// Глобальная функция для обратной совместимости
window.handleGoogleLogin = handleCredentialResponse

async function checkBackendHealth() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(import.meta.env.VITE_API_URL + '/health', {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return res.ok
  } catch {
    return false
  }
}

// Демо-режим авторизации для случаев, когда сервер недоступен
async function handleDemoGoogleAuth(response: any) {
  try {
    console.log('Обработка авторизации в демо-режиме');
    
    // Декодируем JWT токен для получения данных пользователя
    const decodedToken = parseJwt(response.credential);
    
    if (!decodedToken) {
      throw new Error('Не удалось декодировать токен');
    }
    
    // Создаем демо-пользователя на основе данных из токена
    const demoUser = {
      id: `demo-${Date.now()}`,
      name: decodedToken.name || 'Demo User',
      email: decodedToken.email || 'demo@example.com',
      profilePicture: decodedToken.picture || null,
      role: props.isRegister ? 'worker' : 'employer',
      token: `demo-${Date.now()}`,
      authProvider: 'google'
    };
    
    // Сохраняем пользователя
    localStorage.setItem('user', JSON.stringify(demoUser));
    console.log('Демо-пользователь сохранен:', demoUser);
    
    // Перенаправляем на главную страницу
    router.push('/');
  } catch (err) {
    console.error('Ошибка демо-авторизации:', err);
    error.value = t('googleAuth.demoAuthError');
  }
}
</script>

<style scoped>
.google-login-container {
  width: 100%;
  position: relative;
  margin: 5px 0;
}

.google-signin-button {
  width: 100%;
  display: flex;
  justify-content: center;
  transform: scale(1);
  transition: transform 0.2s ease-in-out;
}

.google-signin-button:hover {
  transform: scale(1.02);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 6px;
}

.error-message i {
  font-size: 16px;
}

.config-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #f39c12;
  font-size: 13px;
  text-align: center;
  margin-top: 10px;
  padding: 8px;
  background-color: rgba(243, 156, 18, 0.1);
  border-radius: 6px;
}

.retry-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 12px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #c0392b;
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

/* Улучшенные стили для кнопки Google */
:deep(.g_id_signin) {
  width: 100% !important;
  display: block !important;
}

:deep(.g_id_signin > div) {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
}

:deep(.g_id_signin iframe) {
  width: 100% !important;
  max-width: 400px !important;
  margin: 0 auto !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
  transition: box-shadow 0.3s !important;
}

:deep(.g_id_signin iframe:hover) {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15) !important;
}

/* Адаптивные стили */
@media (max-width: 576px) {
  .google-signin-button {
    transform: none;
  }
  
  .error-message {
    flex-direction: column;
    font-size: 13px;
  }
  
  .retry-btn {
    margin-left: 0;
    margin-top: 8px;
  }
}

.debug-info {
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(243, 156, 18, 0.1);
  border-radius: 6px;
}

.debug-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.debug-btn:hover {
  background-color: #c0392b;
}
</style>