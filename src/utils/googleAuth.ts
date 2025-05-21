// Утилиты для работы с аутентификацией Google
import { ref } from 'vue'

// Глобальное состояние для хранения данных аутентифицированного пользователя
export const currentUser = ref<any>(null)

// Конфигурация Google OAuth
export const googleConfig = {
  clientId:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '655912811217-9dvofthoehrkkgp547dltgb9qb8tnckr.apps.googleusercontent.com', // Получаем ID из переменных окружения или используем предоставленный ID
  scope: 'email profile',
}

// Отладочная информация
console.log('Google Client ID:', googleConfig.clientId)
console.log('Environment VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)

// Загружаем скрипт Google API
export function loadGoogleScript(): Promise<void> {
  console.log('Загружаем Google API скрипт...')
  return new Promise((resolve, reject) => {
    // Проверяем, загружен ли уже скрипт Google API
    if (document.getElementById('google-api-script')) {
      console.log('Google API скрипт уже загружен')
      resolve()
      return
    }

    // Создаем скрипт для загрузки Google API
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.id = 'google-api-script'
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('Google API скрипт успешно загружен')
      resolve()
    }
    script.onerror = (error) => {
      console.error('Ошибка загрузки Google API скрипта:', error)
      reject(new Error(`Не удалось загрузить скрипт Google API: ${error}`))
    }

    document.head.appendChild(script)
    console.log('Google API скрипт добавлен в DOM')
  })
}

// Инициализируем Google Sign-In
export async function initGoogleAuth(): Promise<void> {
  console.log('Начинаем инициализацию Google Auth...')
  try {
    // Загружаем скрипт Google API
    await loadGoogleScript()
    console.log('Скрипт Google API загружен, проверяем наличие window.google:', !!window.google)
    console.log('Client ID для инициализации:', googleConfig.clientId)

    // Инициализируем Google Identity Services
    if (window.google && googleConfig.clientId) {
      console.log('Инициализация Google Identity Services...')

      try {
        // Инициализируем кнопку входа
        window.google.accounts.id.initialize({
          client_id: googleConfig.clientId,
          callback: handleCredentialResponse,
          auto_select: false, // Отключаем автоматический выбор учетной записи
          cancel_on_tap_outside: true, // Закрываем окно при нажатии вне его
        })

        // Отображаем кнопку Google, если она есть в DOM
        const googleBtnContainers = document.querySelectorAll('.g-signin-button')
        if (googleBtnContainers.length > 0) {
          console.log(`Найдено ${googleBtnContainers.length} контейнеров для кнопки Google`)

          // Определяем тип кнопки на основе текущего URL
          const isRegisterPage = window.location.pathname.includes('/register')
          const buttonText = isRegisterPage ? 'signup_with' : 'signin_with'

          googleBtnContainers.forEach((container, index) => {
            try {
              window.google.accounts.id.renderButton(container, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: buttonText,
                shape: 'rectangular',
                logo_alignment: 'center',
                locale: 'ru',
                width: 320, // Используем числовое значение вместо процентов
              })
              console.log(
                `Кнопка Google успешно отображена в контейнере #${index} с текстом "${buttonText}"`,
              )
            } catch (renderErr) {
              console.error(`Ошибка отображения кнопки Google в контейнере #${index}:`, renderErr)
            }
          })
        } else {
          console.log('Контейнеры для кнопки Google не найдены в DOM')
        }

        console.log('Google Identity Services успешно инициализирован')
      } catch (error) {
        console.error('Ошибка при инициализации Google Identity Services:', error)
      }
    } else {
      console.error(
        'Google API не загружен или clientId не указан. Google API загружен:',
        !!window.google,
        'Client ID указан:',
        !!googleConfig.clientId,
      )
    }
  } catch (error) {
    console.error('Ошибка при инициализации Google Auth:', error)
  }
}

// Обработчик ответа от Google
function handleCredentialResponse(response: any) {
  console.log('Получен ответ от Google:', response)

  // Обрабатываем JWT токен от Google
  if (response && response.credential) {
    try {
      // Декодируем JWT токен (простой вариант без библиотеки)
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      console.log('Декодированные данные пользователя:', payload)

      // Сохраняем пользователя
      const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        fullName: payload.name,
        picture: payload.picture,
        authProvider: 'google',
        userType: 'worker', // По умолчанию - работник
      }

      saveUserToLocalStorage(user)
      currentUser.value = user

      // Определяем, куда перенаправить пользователя после авторизации
      const redirectToUrl = getRedirectUrl()

      // Перенаправляем пользователя на нужную страницу
      window.location.href = redirectToUrl
    } catch (error) {
      console.error('Ошибка при обработке JWT токена:', error)
    }
  } else {
    console.error('Не получен credential от Google')
  }
}

// Функция для определения URL для перенаправления после авторизации
function getRedirectUrl(): string {
  // Проверяем, есть ли сохраненный редирект в query параметрах
  const urlParams = new URLSearchParams(window.location.search)
  const redirectParam = urlParams.get('redirect')

  // Если мы на странице регистрации или входа и есть параметр redirect, используем его
  if (redirectParam) {
    return redirectParam
  }

  // Если мы на странице регистрации или входа без redirect, направляем в dashboard
  if (
    window.location.pathname.includes('/register') ||
    window.location.pathname.includes('/login')
  ) {
    return '/dashboard'
  }

  // В остальных случаях остаемся на текущей странице
  return window.location.pathname
}

// Функция для запуска авторизации через Google - улучшенная реализация
export function signInWithGoogle(): void {
  console.log('Вызвана функция signInWithGoogle')

  try {
    if (!window.google?.accounts?.id) {
      console.warn('Google API не инициализирован при попытке входа, повторная инициализация...')
      // Пробуем инициализировать API Google снова
      initGoogleAuth()
        .then(() => {
          // Повторяем попытку входа после инициализации
          if (window.google?.accounts?.id) {
            console.log('Google API инициализирован, запускаем prompt...')
            window.google.accounts.id.prompt((notification: any) => {
              console.log('Отображение Google prompt после повторной инициализации:', notification)
            })
          } else {
            throw new Error('Google API не удалось инициализировать')
          }
        })
        .catch((err) => {
          console.error('Не удалось инициализировать Google API при попытке входа:', err)
          alert('Ошибка инициализации Google. Пожалуйста, обновите страницу и попробуйте снова.')
        })
      return
    }

    // Если API инициализирован, запускаем окно авторизации
    console.log('Запускаем Google prompt...')
    window.google.accounts.id.prompt((notification: any) => {
      console.log('Отображение Google prompt:', notification)

      // Если prompt был закрыт или произошла ошибка момента, попробуем еще раз
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn(
          'Google prompt не был отображен или был пропущен:',
          notification.getNotDisplayedReason() || notification.getSkippedReason(),
        )

        // Пробуем кликнуть по видимым кнопкам Google
        const visibleGoogleBtn = document.querySelector(
          '[role="button"][data-is-signin-button="true"]',
        )
        if (visibleGoogleBtn) {
          console.log('Найдена кнопка Google, инициируем клик')
          // @ts-ignore
          visibleGoogleBtn.click()
        }
      }
    })
  } catch (error) {
    console.error('Ошибка при вызове Google аутентификации:', error)
    alert(
      'Произошла ошибка при попытке авторизации через Google. Пожалуйста, попробуйте снова позже.',
    )
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
  window.location.reload()
}

// Объявление глобальных типов для TypeScript
declare global {
  interface Window {
    google?: any
  }
}
