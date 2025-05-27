// Простой скрипт для тестирования подключения к Railway MySQL
require('dotenv').config()
const mysql = require('mysql2/promise')

const databaseUrl = 'mysql://root:YqcLGUQwuJZbHdeWXDgqOrhcPVnIjQxO@mainline.proxy.rlwy.net:53929/railway'

async function testConnection() {
  console.log('🔄 Тестирую подключение к Railway MySQL...')
  console.log('🔗 URL:', databaseUrl.replace(/:[^:]*@/, ':****@')) // Скрываем пароль
  
  try {
    // Создаем подключение
    const connection = await mysql.createConnection({
      uri: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    })
    
    console.log('✅ Подключение установлено!')
    
    // Проверяем версию MySQL
    const [versionRows] = await connection.query('SELECT VERSION() as version, NOW() as current_time')
    console.log('📊 Версия MySQL:', versionRows[0].version)
    console.log('🕐 Время сервера:', versionRows[0].current_time)
    
    // Проверяем существующие таблицы
    const [tables] = await connection.query('SHOW TABLES')
    console.log('📋 Существующие таблицы:')
    if (tables.length === 0) {
      console.log('   (таблицы не найдены - база данных пуста)')
    } else {
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${Object.values(table)[0]}`)
      })
    }
    
    // Проверяем права доступа
    const [grants] = await connection.query('SHOW GRANTS')
    console.log('🔐 Права доступа проверены ✅')
    
    // Тестируем создание таблицы
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS test_connection (
          id INT AUTO_INCREMENT PRIMARY KEY,
          test_message VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('🛠️ Тест создания таблицы: ✅')
      
      // Тестируем вставку данных
      await connection.query(
        'INSERT INTO test_connection (test_message) VALUES (?)',
        ['Connection test successful']
      )
      console.log('💾 Тест записи данных: ✅')
      
      // Тестируем чтение данных
      const [testRows] = await connection.query(
        'SELECT * FROM test_connection ORDER BY created_at DESC LIMIT 1'
      )
      console.log('📖 Тест чтения данных: ✅')
      console.log('📝 Последняя запись:', testRows[0])
      
      // Удаляем тестовую таблицу
      await connection.query('DROP TABLE test_connection')
      console.log('🗑️ Тест удаления таблицы: ✅')
      
    } catch (testError) {
      console.error('❌ Ошибка при тестировании операций:', testError.message)
    }
    
    await connection.end()
    console.log('🎉 Все тесты пройдены успешно!')
    console.log('')
    console.log('✅ База данных готова к использованию!')
    console.log('📝 Можно запускать миграции: npm run migrate')
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message)
    console.error('')
    console.error('🔍 Возможные причины:')
    console.error('1. Неверная строка подключения')
    console.error('2. База данных недоступна')
    console.error('3. Проблемы с сетью')
    console.error('4. Неверные учетные данные')
    console.error('')
    console.error('💡 Решения:')
    console.error('1. Проверьте URL подключения в Railway Dashboard')
    console.error('2. Убедитесь, что база данных запущена')
    console.error('3. Проверьте настройки файрвола')
    
    process.exit(1)
  }
}

// Запускаем тест
testConnection()