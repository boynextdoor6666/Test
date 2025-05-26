# Tez Jumush Backend

## Описание

Бэкенд для сервиса поиска подработки. Реализован на Node.js + Express + TypeScript + MySQL.

## Запуск

1. Создай файл `.env` в папке backend:
   ```
   MYSQL_URL="mysql://root:...@.../railway"
   JWT_SECRET="supersecretjwtkey"
   PORT=4000
   ```
2. Установи зависимости:
   ```
   npm install
   ```
3. Прогони миграции:
   ```
   npm run migrate
   ```
4. Запусти сервер:
   ```
   npm run dev
   ```

## Основные эндпоинты

### Пользователи
- `POST /api/users/register` — регистрация
- `POST /api/users/login` — вход

### Вакансии
- `GET /api/jobs` — список вакансий
- `GET /api/jobs/:id` — вакансия по id
- `POST /api/jobs` — создать вакансию
- `PUT /api/jobs/:id` — обновить вакансию
- `DELETE /api/jobs/:id` — удалить вакансию

### Отклики
- `POST /api/applications` — откликнуться на вакансию
- `GET /api/applications/user/:user_id` — отклики пользователя
- `GET /api/applications/job/:job_id` — отклики на вакансию
- `PUT /api/applications/:id` — обновить статус отклика

## Пример запроса: регистрация пользователя
```json
POST /api/users/register
{
  "name": "Иван",
  "email": "ivan@example.com",
  "password": "123456",
  "phone": "+996 555 123456"
}
``` 