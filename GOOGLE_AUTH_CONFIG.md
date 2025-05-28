# Настройка Google Authentication для Tez Jumush

Для корректной работы функций входа/регистрации через Google необходимо настроить Google Client ID.

## Решение проблемы "googleAuth.missingClientIdgoogleAuth.tryAgain"

Эта ошибка появляется, когда приложение не может найти настроенный Google Client ID в переменных окружения.

## Шаги для настройки:

1. **Создайте файл `.env.local` в корневой папке проекта**

   ```
   # .env.local
   VITE_GOOGLE_CLIENT_ID=ваш_client_id_от_google
   ```

2. **Получите Client ID от Google Cloud Console**

   Следуйте инструкциям в файле [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md) для получения Client ID.

3. **Перезапустите приложение**

   Закройте и снова запустите dev-сервер:

   ```
   npm run dev
   ```

## Использование демо-режима

Если вы хотите использовать приложение без настройки Google Authentication:

1. На странице входа выберите "Демо режим"
2. Используйте тестовые учетные записи:
   - Работодатель: `employer@example.com` / `password123`
   - Работник: `worker@example.com` / `password123`

## Временная отключение Google Authentication

Если вы хотите временно отключить кнопку Google Authentication, вы можете:

1. Откройте файл `src/components/GoogleSignIn.vue`
2. Закомментируйте или удалите компонент из страниц входа и регистрации

## Технические детали

- Google Authentication использует Google Identity Services API
- Компонент `GoogleSignIn.vue` отвечает за интеграцию с Google API
- Переменная окружения `VITE_GOOGLE_CLIENT_ID` должна содержать валидный Client ID
- В режиме разработки используется файл `.env.local` (его не следует коммитить в репозиторий)
- В продакшн-режиме Client ID должен быть настроен в переменных окружения сервера 