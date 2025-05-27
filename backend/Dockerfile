# Multi-stage build для оптимизации размера образа
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем исходный код
COPY . .

# Компилируем TypeScript
RUN npm run build

# Производственный образ
FROM node:18-alpine AS production

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json для установки production зависимостей
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем скомпилированные файлы из builder
COPY --from=builder /app/dist ./dist

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app

# Переключаемся на непривилегированного пользователя
USER nodejs

# Открываем порт
EXPOSE 4000

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=4000

# Команда запуска
CMD ["node", "dist/server.js"]