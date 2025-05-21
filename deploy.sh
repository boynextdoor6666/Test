#!/bin/bash

# Скрипт для подготовки проекта к деплою на хостинг

echo "🚀 Начинаю подготовку проекта Tez Jumush к деплою..."

# Проверяем наличие файла с переменными окружения
if [ -f "deploy.env" ]; then
  echo "🔐 Найден файл deploy.env, буду использовать его для настройки окружения"
  # Копируем в .env.production для использования при сборке
  cp deploy.env .env.production
  echo "✅ Файл .env.production создан из deploy.env"
else
  echo "⚠️ Файл deploy.env не найден!"
  echo "❓ Проверьте наличие VITE_GOOGLE_CLIENT_ID в вашем окружении или создайте файл deploy.env"
  
  # Проверяем, есть ли переменная в окружении
  if [ -z "$VITE_GOOGLE_CLIENT_ID" ]; then
    echo "❌ Переменная VITE_GOOGLE_CLIENT_ID не найдена в окружении"
    echo "❌ Настройте Google аутентификацию перед сборкой (см. GOOGLE_AUTH_SETUP.md)"
    exit 1
  else
    echo "✅ Переменная VITE_GOOGLE_CLIENT_ID найдена в окружении, продолжаю сборку"
  fi
fi

# Убедимся, что у нас последние зависимости
echo "📦 Устанавливаю зависимости..."
npm install

# Запускаем сборку продакшен-версии
echo "🔨 Запускаю сборку продакшен-версии..."
npm run build

# Проверяем успешность сборки
if [ -d "dist" ]; then
  echo "✅ Сборка успешно завершена! Файлы находятся в папке 'dist'."
  
  # Удаляем временные файлы окружения, если они были созданы
  if [ -f ".env.production" ]; then
    rm .env.production
    echo "🧹 Временный файл .env.production удален"
  fi
  
  # Копируем нужные файлы для хостинга
  echo "📄 Копирую файлы конфигурации для хостинга..."
  
  # Проверка наличия .htaccess
  if [ -f "public/.htaccess" ]; then
    echo "  - .htaccess скопирован"
  else
    echo "⚠️ .htaccess не найден в папке public!"
  fi
  
  # Проверка наличия web.config
  if [ -f "public/web.config" ]; then
    echo "  - web.config скопирован"
  else
    echo "⚠️ web.config не найден в папке public!"
  fi
  
  # Вывод инструкций
  echo ""
  echo "📋 Инструкция по деплою:"
  echo "1. Загрузите содержимое папки 'dist' на ваш хостинг через FTP или панель управления."
  echo "2. Убедитесь, что файлы .htaccess и web.config присутствуют в корневой папке на хостинге."
  echo "3. Более подробная инструкция доступна в файле DEPLOY.md"
  
  # Предлагаем запустить предпросмотр
  echo ""
  echo "👁️ Хотите проверить сборку локально перед загрузкой на хостинг?"
  echo "   Запустите: npm run serve-dist"
else
  echo "❌ Ошибка при сборке проекта. Проверьте наличие ошибок выше."
  
  # Удаляем временные файлы окружения в случае ошибки
  if [ -f ".env.production" ]; then
    rm .env.production
    echo "🧹 Временный файл .env.production удален"
  fi
fi 