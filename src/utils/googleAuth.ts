// Утилиты для работы с аутентификацией Google
import { ref } from 'vue'

// Глобальное состояние для хранения данных аутентифицированного пользователя
export const currentUser = ref<any>(null)

// Конфигурация Google OAuth
export const googleConfig = {
  clientId: '', // Вы должны заполнить это значение из Google Cloud Console
  scope: 'email profile',
  prompt: 'select_account',
}

// Загружаем скрипт Google API
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Проверяем, загружен ли уже скрипт Google API
    if (document.getElementById('google-api-script')) {
      resolve()
      return
    }

    // Создаем скрипт для загрузки Google API
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.id = 'google-api-script'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = (error) =>
      reject(new Error(`Не удалось загрузить скрипт Google API: ${error}`))

    document.head.appendChild(script)
  })
}

// Инициализируем Google Sign-In
export async function initGoogleAuth(): Promise<void> {
  try {
    // Загружаем скрипт Google API
    await loadGoogleScript()

    // Инициализируем клиент Google OAuth
    if (window.google && googleConfig.clientId) {
      console.log('Инициализация Google Auth...')

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: googleConfig.clientId,
        scope: googleConfig.scope,
        prompt: googleConfig.prompt,
        callback: handleGoogleAuth,
      })

      // Сохраняем клиент в глобальной области для дальнейшего использования
      window.googleAuthClient = client
    } else {
      console.error('Google API не загружен или clientId не указан')
    }
  } catch (error) {
    console.error('Ошибка при инициализации Google Auth:', error)
  }
}

// Обработчик аутентификации через Google
async function handleGoogleAuth(response: any): Promise<void> {
  try {
    if (response.access_token) {
      // Получаем информацию о пользователе
      const userInfo = await fetchGoogleUserInfo(response.access_token)

      // Сохраняем информацию о пользователе
      if (userInfo) {
        saveUserToLocalStorage({
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          fullName: userInfo.name,
          picture: userInfo.picture,
          authProvider: 'google',
          userType: 'worker', // По умолчанию - работник, можно изменить потом
        })

        // Обновляем глобальное состояние
        currentUser.value = userInfo

        // Перезагружаем страницу для применения изменений
        // Это можно заменить на более элегантное решение в реальном приложении
        window.location.reload()
      }
    } else {
      console.error('Токен доступа не получен')
    }
  } catch (error) {
    console.error('Ошибка при обработке аутентификации Google:', error)
  }
}

// Получаем информацию о пользователе Google
async function fetchGoogleUserInfo(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Ошибка при получении информации о пользователе Google:', error)
    return null
  }
}

// Сохраняем пользователя в localStorage
export function saveUserToLocalStorage(user: any): void {
  localStorage.setItem('user', JSON.stringify(user))
}

// Получаем пользователя из localStorage
export function getUserFromLocalStorage(): any {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      return JSON.parse(userData)
    } catch (error) {
      console.error('Ошибка при парсинге данных пользователя:', error)
    }
  }
  return null
}

// Выход из аккаунта
export function logoutUser(): void {
  localStorage.removeItem('user')
  currentUser.value = null
  // Перезагружаем страницу для применения изменений
  // Это можно заменить на более элегантное решение в реальном приложении
  window.location.reload()
}

// Функция для запуска аутентификации Google
export function signInWithGoogle(): void {
  if (window.googleAuthClient) {
    window.googleAuthClient.requestAccessToken()
  } else {
    console.error('Google Auth клиент не инициализирован')
    // Пробуем инициализировать клиент снова
    initGoogleAuth().then(() => {
      if (window.googleAuthClient) {
        window.googleAuthClient.requestAccessToken()
      } else {
        console.error('Не удалось инициализировать Google Auth клиент')
      }
    })
  }
}

// Объявление глобальных типов для TypeScript
declare global {
  interface Window {
    google: any
    googleAuthClient: any
  }
}
