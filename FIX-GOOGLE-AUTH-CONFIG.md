# Настройка полноценной Google аутентификации

Для правильной работы Google аутентификации в режиме разработки необходимо выполнить следующие шаги:

## 1. Исправить файл .env

Откройте файл `.env` в корне проекта и убедитесь, что он содержит правильный формат:

```
# API Configuration
VITE_GOOGLE_CLIENT_ID=655912811217-9dvofthoehrkkgp547dltgb9qb8tnckr.apps.googleusercontent.com
VITE_API_URL=http://localhost:3001/API
```

Убедитесь, что нет никаких лишних символов или переносов строк.

## 2. Настройте Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект 
3. Перейдите в "APIs & Services" > "Credentials"
4. Найдите ваш OAuth 2.0 Client ID и нажмите на него для редактирования
5. В разделе "Authorized JavaScript origins" добавьте все URL, которые вы используете для разработки:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - `http://localhost:3000` (если используете этот порт)
   - Любые другие URL, которые вы используете
6. Нажмите "Save"

## 3. Перезапустите сервер разработки

```bash
npm run dev
```

## 4. Очистите кеш браузера

Если вы всё ещё видите ошибки:
1. Откройте DevTools (F12)
2. Перейдите во вкладку Application > Storage
3. Нажмите "Clear site data"
4. Перезагрузите страницу

## Примечание по ошибке

Ошибка "The given origin is not allowed for the given client ID" возникает, когда домен, с которого вы пытаетесь аутентифицироваться, не добавлен в список разрешенных в Google Cloud Console. После добавления домена в список разрешенных, ошибка должна исчезнуть.

Также убедитесь, что ваш Client ID в .env файле точно соответствует тому, что настроен в Google Cloud Console. 