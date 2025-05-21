@echo off
echo 🚀 Начинаю подготовку проекта Tez Jumush к деплою...

rem Проверяем наличие файла deploy.env
if exist "deploy.env" (
  echo 🔐 Найден файл deploy.env, буду использовать его для настройки окружения
  rem Копируем в .env.production для использования при сборке
  copy deploy.env .env.production > nul
  echo ✅ Файл .env.production создан из deploy.env
) else (
  echo ⚠️ Файл deploy.env не найден!
  echo ❓ Проверьте наличие VITE_GOOGLE_CLIENT_ID в вашем окружении или создайте файл deploy.env
  echo ❗ Продолжаю сборку, но Google авторизация может не работать
)

rem Убедимся, что у нас последние зависимости
echo 📦 Устанавливаю зависимости...
call npm install

rem Запускаем сборку продакшен-версии
echo 🔨 Запускаю сборку продакшен-версии...
call npm run build

rem Проверяем успешность сборки
if exist "dist" (
  echo ✅ Сборка успешно завершена! Файлы находятся в папке 'dist'.
  
  rem Удаляем временные файлы окружения, если они были созданы
  if exist ".env.production" (
    del .env.production > nul
    echo 🧹 Временный файл .env.production удален
  )
  
  rem Проверка наличия .htaccess
  if exist "public\.htaccess" (
    echo   - .htaccess скопирован
  ) else (
    echo ⚠️ .htaccess не найден в папке public!
  )
  
  rem Проверка наличия web.config
  if exist "public\web.config" (
    echo   - web.config скопирован
  ) else (
    echo ⚠️ web.config не найден в папке public!
  )
  
  rem Вывод инструкций
  echo.
  echo 📋 Инструкция по деплою:
  echo 1. Загрузите содержимое папки 'dist' на ваш хостинг через FTP или панель управления.
  echo 2. Убедитесь, что файлы .htaccess и web.config присутствуют в корневой папке на хостинге.
  echo 3. Более подробная инструкция доступна в файле DEPLOY.md
  
  rem Предлагаем запустить предпросмотр
  echo.
  echo 👁️ Хотите проверить сборку локально перед загрузкой на хостинг?
  echo    Запустите: npm run serve-dist
) else (
  echo ❌ Ошибка при сборке проекта. Проверьте наличие ошибок выше.
  
  rem Удаляем временные файлы окружения в случае ошибки
  if exist ".env.production" (
    del .env.production > nul
    echo 🧹 Временный файл .env.production удален
  )
)

pause 