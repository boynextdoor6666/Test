import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// Получаем URL базы данных из переменных окружения
const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL

if (!databaseUrl) {
  console.error('❌ ОШИБКА: DATABASE_URL или MYSQL_URL не установлена!')
  console.error('Пожалуйста, установите переменную окружения для подключения к базе данных')
  process.exit(1)
}

console.log('🔗 Подключение к базе данных...')
console.log('🌐 Host:', databaseUrl.includes('railway') ? 'Railway MySQL' : 'Local/Custom MySQL')

// Парсим строку подключения
function parseDatabaseUrl(url: string) {
  const match = url.match(/^mysql:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*?)($|\?.*)/)
  if (!match) throw new Error('Неверный формат строки подключения MySQL')
  return {
    host: match[3],
    port: Number(match[4]),
    user: match[1],
    password: match[2],
    database: match[5]
  }
}

const pool = mysql.createPool({
  ...parseDatabaseUrl(databaseUrl),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Настройки для стабильного соединения с Railway
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined,
  timezone: '+00:00',
  charset: 'utf8mb4'
})

// Проверяем подключение при старте
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Успешное подключение к базе данных')
    
    // Проверяем версию MySQL
    const [rows] = await connection.query('SELECT VERSION() as version')
    console.log('📊 Версия MySQL:', (rows as any)[0].version)
    
    connection.release()
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error)
    console.error('🔍 Проверьте переменную DATABASE_URL/MYSQL_URL')
    
    // В продакшне не завершаем процесс сразу, даем возможность переподключиться
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1)
    }
  }
}

// Тестируем подключение при запуске
testConnection()

// Обработка закрытия приложения
process.on('SIGINT', async () => {
  console.log('🔄 Закрываем подключения к базе данных...')
  await pool.end()
  console.log('✅ Подключения закрыты')
  process.exit(0)
})

export default pool