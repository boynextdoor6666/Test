@echo off
echo 🚀 Начинаю подготовку проекта Tez Jumush к деплою...

rem Убедимся, что у нас последние зависимости
echo 📦 Устанавливаю зависимости...
call npm install

rem Запускаем сборку продакшен-версии
echo 🔨 Запускаю сборку продакшен-версии...
call npm run build

rem Проверяем успешность сборки
if exist "dist" (
  echo ✅ Сборка успешно завершена! Файлы находятся в папке 'dist'.
  
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
)

pause 