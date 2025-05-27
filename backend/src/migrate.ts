import pool from './db'

async function migrate() {
  try {
    console.log('🚀 Начинаю миграции базы данных...')

    // Таблица пользователей (расширенная)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        phone VARCHAR(50),
        user_type ENUM('worker', 'employer') NOT NULL DEFAULT 'worker',
        photo TEXT,
        age INT DEFAULT 0,
        skills JSON,
        experience TEXT,
        has_other_jobs BOOLEAN DEFAULT FALSE,
        auth_provider VARCHAR(50) DEFAULT '',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_user_type (user_type),
        INDEX idx_auth_provider (auth_provider)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)
    console.log('✅ Таблица users создана/обновлена')

    // Таблица вакансий (расширенная)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        salary VARCHAR(100),
        salary_amount INT,
        location VARCHAR(255),
        phone VARCHAR(50),
        date DATE,
        category VARCHAR(100),
        requirements JSON,
        employer VARCHAR(255),
        urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
        employment_type ENUM('full-time', 'part-time', 'freelance', 'contract') DEFAULT 'full-time',
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category),
        INDEX idx_location (location),
        INDEX idx_urgency (urgency),
        INDEX idx_employment_type (employment_type),
        INDEX idx_salary_amount (salary_amount),
        INDEX idx_created_at (created_at),
        FULLTEXT idx_search (title, description, employer)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)
    console.log('✅ Таблица jobs создана/обновлена')

    // Таблица откликов (расширенная)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
        cover_letter TEXT,
        employer_comment TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_applied_at (applied_at),
        UNIQUE KEY unique_application (job_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)
    console.log('✅ Таблица applications создана/обновлена')

    // Таблица категорий (для будущего использования)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        parent_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_parent (parent_id),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)
    console.log('✅ Таблица categories создана/обновлена')

    // Вставляем базовые категории
    await pool.query(`
      INSERT IGNORE INTO categories (name, description, icon) VALUES
      ('Строительство', 'Работы в сфере строительства и ремонта', 'fas fa-hammer'),
      ('Уборка', 'Клининговые услуги и уборка помещений', 'fas fa-broom'),
      ('Доставка', 'Курьерские услуги и доставка товаров', 'fas fa-truck'),
      ('IT и технологии', 'Программирование, веб-разработка, техподдержка', 'fas fa-laptop-code'),
      ('Образование', 'Репетиторство, преподавание, тренинги', 'fas fa-graduation-cap'),
      ('Красота и здоровье', 'Салонные услуги, массаж, фитнес', 'fas fa-spa'),
      ('Торговля', 'Продажи, консультации, промоутерство', 'fas fa-shopping-cart'),
      ('Кулинария', 'Готовка, кейтеринг, помощь на кухне', 'fas fa-utensils'),
      ('Автомобили', 'Ремонт, мойка, техобслуживание авто', 'fas fa-car'),
      ('Дизайн', 'Графический дизайн, интерьер, творчество', 'fas fa-palette'),
      ('Переводы', 'Письменные и устные переводы', 'fas fa-language'),
      ('Фотография', 'Фотосъемка, видеосъемка, обработка', 'fas fa-camera'),
      ('Садоводство', 'Уход за растениями, ландшафтный дизайн', 'fas fa-seedling'),
      ('Животные', 'Уход за питомцами, ветеринарные услуги', 'fas fa-paw'),
      ('Другое', 'Прочие виды работ', 'fas fa-ellipsis-h')
    `)
    console.log('✅ Базовые категории добавлены')

    // Таблица для уведомлений (для будущего использования)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        related_type VARCHAR(50),
        related_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_unread (user_id, is_read),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)
    console.log('✅ Таблица notifications создана/обновлена')

    // Создаем демо-данные для разработки
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Создаю демо-данные для разработки...')
      
      // Демо пользователи
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('password123', 12)
      
      await pool.query(`
        INSERT IGNORE INTO users (name, email, password, phone, user_type, photo, age, skills, experience, has_other_jobs) VALUES
        ('Иван Работник', 'worker@example.com', ?, '+996 555 123456', 'worker', '', 28, '["Строительство", "Ремонт", "Электрика"]', 'Опыт работы в строительстве 5 лет', false),
        ('Алексей Работодатель', 'employer@example.com', ?, '+996 700 654321', 'employer', '', 35, '[]', 'Владелец строительной компании', false),
        ('Мария Дизайнер', 'maria@example.com', ?, '+996 777 111222', 'worker', '', 25, '["Дизайн", "Фотошоп", "Иллюстрация"]', 'Графический дизайнер с опытом 3 года', true),
        ('Сергей Предприниматель', 'sergey@example.com', ?, '+996 666 333444', 'employer', '', 40, '[]', 'Владелец IT-компании', false)
      `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword])

      // Получаем ID созданных пользователей
      const [users]: any = await pool.query('SELECT id, user_type FROM users WHERE email IN (?, ?, ?, ?)', 
        ['worker@example.com', 'employer@example.com', 'maria@example.com', 'sergey@example.com'])
      
      const employerIds = users.filter((u: any) => u.user_type === 'employer').map((u: any) => u.id)
      
      if (employerIds.length > 0) {
        // Демо вакансии
        await pool.query(`
          INSERT IGNORE INTO jobs (title, description, salary, salary_amount, location, phone, category, requirements, employer, urgency, employment_type, user_id) VALUES
          ('Мастер по ремонту квартир', 'Требуется опытный мастер для ремонта квартиры. Работы включают: поклейка обоев, покраска стен, установка плинтусов.', '25000-30000 сом', 25000, 'Бишкек, р-н Центр', '+996 700 123456', 'Строительство', '["Опыт ремонтных работ", "Наличие инструмента", "Аккуратность"]', 'Строительная компания "Ремонт+"', 'high', 'contract', ?),
          ('Уборщица в офис', 'Требуется уборщица для ежедневной уборки офисного помещения. График работы: пн-пт с 18:00 до 20:00', '15000 сом/месяц', 15000, 'Бишкек, проспект Чуй', '+996 555 987654', 'Уборка', '["Ответственность", "Пунктуальность"]', 'ООО "Клин Сервис"', 'medium', 'part-time', ?),
          ('Курьер на полный день', 'В связи с расширением ищем курьера на полный рабочий день. Доставка документов и небольших грузов по городу.', '20000-35000 сом', 20000, 'Бишкек', '+996 777 456789', 'Доставка', '["Наличие личного транспорта", "Знание города", "Ответственность"]', 'Логистическая компания', 'medium', 'full-time', ?),
          ('Веб-разработчик (удаленно)', 'Ищем frontend разработчика для работы над интернет-магазином. Возможна удаленная работа.', '40000-60000 сом', 40000, 'Удаленно', '+996 312 123456', 'IT и технологии', '["HTML/CSS", "JavaScript", "Vue.js или React", "Опыт от 1 года"]', 'IT Startup', 'low', 'freelance', ?)
        `, [employerIds[0], employerIds[0], employerIds[1] || employerIds[0], employerIds[1] || employerIds[0]])
        
        console.log('✅ Демо вакансии созданы')
      }
    }

    // Проверяем целостность данных
    const [jobsCount]: any = await pool.query('SELECT COUNT(*) as count FROM jobs')
    const [usersCount]: any = await pool.query('SELECT COUNT(*) as count FROM users')
    const [categoriesCount]: any = await pool.query('SELECT COUNT(*) as count FROM categories')

    console.log('📊 Статистика базы данных:')
    console.log(`   Пользователи: ${usersCount[0].count}`)
    console.log(`   Вакансии: ${jobsCount[0].count}`)
    console.log(`   Категории: ${categoriesCount[0].count}`)
    
    console.log('🎉 Миграции успешно применены!')
    process.exit(0)

  } catch (error) {
    console.error('❌ Ошибка при выполнении миграций:', error)
    process.exit(1)
  }
}

migrate()