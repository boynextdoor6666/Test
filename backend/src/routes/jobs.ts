import { Router } from 'express'
import pool from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

interface JobData {
  title: string
  description: string
  salary?: string
  location?: string
  phone?: string
  date?: string
  category?: string
  requirements?: string[]
  employer?: string
  urgency?: 'low' | 'medium' | 'high'
  employment_type?: 'full-time' | 'part-time' | 'freelance' | 'contract'
}

// Получить все вакансии с фильтрацией и поиском
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      location,
      search,
      salary_min,
      salary_max,
      employment_type,
      urgency,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)
    
    // Базовый запрос
    let baseQuery = `
      SELECT j.*, u.name as employer_name, u.photo as employer_photo
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      WHERE 1=1
    `
    
    const queryParams: any[] = []

    // Фильтры
    if (category) {
      baseQuery += ' AND j.category = ?'
      queryParams.push(category)
    }

    if (location) {
      baseQuery += ' AND j.location LIKE ?'
      queryParams.push(`%${location}%`)
    }

    if (search) {
      baseQuery += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.employer LIKE ?)'
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (employment_type) {
      baseQuery += ' AND j.employment_type = ?'
      queryParams.push(employment_type)
    }

    if (urgency) {
      baseQuery += ' AND j.urgency = ?'
      queryParams.push(urgency)
    }

    // Фильтр по зарплате (если зарплата указана в числовом формате)
    if (salary_min) {
      baseQuery += ' AND j.salary_amount >= ?'
      queryParams.push(Number(salary_min))
    }

    if (salary_max) {
      baseQuery += ' AND j.salary_amount <= ?'
      queryParams.push(Number(salary_max))
    }

    // Сортировка
    const allowedSortFields = ['created_at', 'title', 'salary_amount', 'urgency']
    const allowedSortOrders = ['ASC', 'DESC']
    
    const sortField = allowedSortFields.includes(sort_by as string) ? sort_by : 'created_at'
    const sortOrderValue = allowedSortOrders.includes((sort_order as string).toUpperCase()) 
      ? (sort_order as string).toUpperCase() 
      : 'DESC'

    baseQuery += ` ORDER BY j.${sortField} ${sortOrderValue}`
    baseQuery += ` LIMIT ? OFFSET ?`
    queryParams.push(Number(limit), offset)

    // Выполняем запрос
    const [rows]: any = await pool.query(baseQuery, queryParams)

    // Получаем общее количество для пагинации
    let countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      WHERE 1=1
    `
    
    const countParams: any[] = []
    
    // Применяем те же фильтры для подсчета
    if (category) {
      countQuery += ' AND j.category = ?'
      countParams.push(category)
    }

    if (location) {
      countQuery += ' AND j.location LIKE ?'
      countParams.push(`%${location}%`)
    }

    if (search) {
      countQuery += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.employer LIKE ?)'
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (employment_type) {
      countQuery += ' AND j.employment_type = ?'
      countParams.push(employment_type)
    }

    if (urgency) {
      countQuery += ' AND j.urgency = ?'
      countParams.push(urgency)
    }

    if (salary_min) {
      countQuery += ' AND j.salary_amount >= ?'
      countParams.push(Number(salary_min))
    }

    if (salary_max) {
      countQuery += ' AND j.salary_amount <= ?'
      countParams.push(Number(salary_max))
    }

    const [countResult]: any = await pool.query(countQuery, countParams)
    const total = countResult[0].total

    // Форматируем результаты
    const formattedJobs = rows.map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      salary: job.salary || '',
      salary_amount: job.salary_amount || null,
      location: job.location || '',
      phone: job.phone || '',
      date: job.date,
      category: job.category || '',
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      employer: job.employer || job.employer_name || 'Не указано',
      employer_photo: job.employer_photo || '',
      urgency: job.urgency || 'medium',
      employment_type: job.employment_type || 'full-time',
      user_id: job.user_id,
      created_at: job.created_at,
      updated_at: job.updated_at
    }))

    res.json({
      jobs: formattedJobs,
      pagination: {
        current_page: Number(page),
        total_pages: Math.ceil(total / Number(limit)),
        total_items: total,
        items_per_page: Number(limit)
      }
    })

  } catch (error) {
    console.error('Get jobs error:', error)
    res.status(500).json({ error: 'Ошибка при получении вакансий' })
  }
})

// Получить вакансию по ID
router.get('/:id', async (req, res) => {
  try {
    const jobId = req.params.id

    const [rows]: any = await pool.query(
      `SELECT j.*, u.name as employer_name, u.photo as employer_photo, u.phone as employer_phone
       FROM jobs j
       LEFT JOIN users u ON j.user_id = u.id
       WHERE j.id = ?`,
      [jobId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Вакансия не найдена' })
    }

    const job = rows[0]

    // Получаем количество откликов
    const [applicationsCount]: any = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE job_id = ?',
      [jobId]
    )

    res.json({
      id: job.id,
      title: job.title,
      description: job.description,
      salary: job.salary || '',
      salary_amount: job.salary_amount || null,
      location: job.location || '',
      phone: job.phone || job.employer_phone || '',
      date: job.date,
      category: job.category || '',
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      employer: job.employer || job.employer_name || 'Не указано',
      employer_photo: job.employer_photo || '',
      urgency: job.urgency || 'medium',
      employment_type: job.employment_type || 'full-time',
      user_id: job.user_id,
      applications_count: applicationsCount[0].count,
      created_at: job.created_at,
      updated_at: job.updated_at
    })

  } catch (error) {
    console.error('Get job error:', error)
    res.status(500).json({ error: 'Ошибка при получении вакансии' })
  }
})

// Создать новую вакансию (только для авторизованных)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      title,
      description,
      salary,
      location,
      phone,
      date,
      category,
      requirements = [],
      employer,
      urgency = 'medium',
      employment_type = 'full-time'
    }: JobData = req.body

    const user_id = req.user.id

    // Валидация
    if (!title || !description) {
      return res.status(400).json({
        error: 'Название и описание вакансии обязательны'
      })
    }

    if (title.length > 255) {
      return res.status(400).json({
        error: 'Название вакансии не может быть длиннее 255 символов'
      })
    }

    // Проверяем, что пользователь - работодатель
    const [users]: any = await pool.query(
      'SELECT user_type FROM users WHERE id = ?',
      [user_id]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    if (users[0].user_type !== 'employer') {
      return res.status(403).json({
        error: 'Только работодатели могут создавать вакансии'
      })
    }

    // Парсим зарплату для числового поля
    let salary_amount = null
    if (salary) {
      const salaryNumbers = salary.match(/\d+/g)
      if (salaryNumbers && salaryNumbers.length > 0) {
        salary_amount = parseInt(salaryNumbers[0])
      }
    }

    const [result]: any = await pool.query(
      `INSERT INTO jobs 
       (title, description, salary, salary_amount, location, phone, date, category, requirements, employer, urgency, employment_type, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        salary || null,
        salary_amount,
        location || null,
        phone || null,
        date || null,
        category || null,
        JSON.stringify(requirements),
        employer || null,
        urgency,
        employment_type,
        user_id
      ]
    )

    res.status(201).json({
      message: 'Вакансия успешно создана',
      job: {
        id: result.insertId,
        title,
        description,
        salary: salary || '',
        salary_amount,
        location: location || '',
        phone: phone || '',
        date,
        category: category || '',
        requirements,
        employer: employer || '',
        urgency,
        employment_type,
        user_id
      }
    })

  } catch (error) {
    console.error('Create job error:', error)
    res.status(500).json({ error: 'Ошибка при создании вакансии' })
  }
})

// Обновить вакансию (только владелец)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const jobId = req.params.id
    const user_id = req.user.id
    const {
      title,
      description,
      salary,
      location,
      phone,
      date,
      category,
      requirements,
      employer,
      urgency,
      employment_type
    } = req.body

    // Проверяем владельца вакансии
    const [jobs]: any = await pool.query(
      'SELECT user_id FROM jobs WHERE id = ?',
      [jobId]
    )

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Вакансия не найдена' })
    }

    if (jobs[0].user_id !== user_id) {
      return res.status(403).json({
        error: 'Нет прав на редактирование этой вакансии'
      })
    }

    // Парсим зарплату для числового поля
    let salary_amount = null
    if (salary) {
      const salaryNumbers = salary.match(/\d+/g)
      if (salaryNumbers && salaryNumbers.length > 0) {
        salary_amount = parseInt(salaryNumbers[0])
      }
    }

    await pool.query(
      `UPDATE jobs SET 
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       salary = COALESCE(?, salary),
       salary_amount = COALESCE(?, salary_amount),
       location = COALESCE(?, location),
       phone = COALESCE(?, phone),
       date = COALESCE(?, date),
       category = COALESCE(?, category),
       requirements = COALESCE(?, requirements),
       employer = COALESCE(?, employer),
       urgency = COALESCE(?, urgency),
       employment_type = COALESCE(?, employment_type),
       updated_at = NOW()
       WHERE id = ?`,
      [
        title || null,
        description || null,
        salary || null,
        salary_amount,
        location || null,
        phone || null,
        date || null,
        category || null,
        requirements ? JSON.stringify(requirements) : null,
        employer || null,
        urgency || null,
        employment_type || null,
        jobId
      ]
    )

    res.json({ message: 'Вакансия успешно обновлена' })

  } catch (error) {
    console.error('Update job error:', error)
    res.status(500).json({ error: 'Ошибка при обновлении вакансии' })
  }
})

// Удалить вакансию (только владелец)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const jobId = req.params.id
    const user_id = req.user.id

    // Проверяем владельца вакансии
    const [jobs]: any = await pool.query(
      'SELECT user_id FROM jobs WHERE id = ?',
      [jobId]
    )

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Вакансия не найдена' })
    }

    if (jobs[0].user_id !== user_id) {
      return res.status(403).json({
        error: 'Нет прав на удаление этой вакансии'
      })
    }

    // Начинаем транзакцию
    await pool.query('START TRANSACTION')

    try {
      // Удаляем связанные отклики
      await pool.query('DELETE FROM applications WHERE job_id = ?', [jobId])
      
      // Удаляем вакансию
      await pool.query('DELETE FROM jobs WHERE id = ?', [jobId])

      await pool.query('COMMIT')

      res.json({ message: 'Вакансия успешно удалена' })

    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Delete job error:', error)
    res.status(500).json({ error: 'Ошибка при удалении вакансии' })
  }
})

// Получить мои вакансии (для работодателя)
router.get('/my/jobs', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user_id = req.user.id
    const { page = 1, limit = 20 } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    const [rows]: any = await pool.query(
      `SELECT j.*, 
       (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applications_count
       FROM jobs j
       WHERE j.user_id = ?
       ORDER BY j.created_at DESC
       LIMIT ? OFFSET ?`,
      [user_id, Number(limit), offset]
    )

    // Получаем общее количество
    const [countResult]: any = await pool.query(
      'SELECT COUNT(*) as total FROM jobs WHERE user_id = ?',
      [user_id]
    )

    const total = countResult[0].total

    const formattedJobs = rows.map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      salary: job.salary || '',
      location: job.location || '',
      category: job.category || '',
      urgency: job.urgency || 'medium',
      employment_type: job.employment_type || 'full-time',
      applications_count: job.applications_count,
      created_at: job.created_at,
      updated_at: job.updated_at
    }))

    res.json({
      jobs: formattedJobs,
      pagination: {
        current_page: Number(page),
        total_pages: Math.ceil(total / Number(limit)),
        total_items: total,
        items_per_page: Number(limit)
      }
    })

  } catch (error) {
    console.error('Get my jobs error:', error)
    res.status(500).json({ error: 'Ошибка при получении ваших вакансий' })
  }
})

// Получить статистику вакансий
router.get('/stats/overview', async (req, res) => {
  try {
    // Общее количество вакансий
    const [totalJobs]: any = await pool.query('SELECT COUNT(*) as count FROM jobs')
    
    // Количество вакансий по категориям
    const [categoriesStats]: any = await pool.query(
      `SELECT category, COUNT(*) as count 
       FROM jobs 
       WHERE category IS NOT NULL AND category != ''
       GROUP BY category 
       ORDER BY count DESC 
       LIMIT 10`
    )

    // Количество вакансий по срочности
    const [urgencyStats]: any = await pool.query(
      `SELECT urgency, COUNT(*) as count 
       FROM jobs 
       GROUP BY urgency`
    )

    // Количество новых вакансий за последние 7 дней
    const [newJobs]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM jobs 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    )

    res.json({
      total_jobs: totalJobs[0].count,
      new_jobs_week: newJobs[0].count,
      categories: categoriesStats,
      urgency_distribution: urgencyStats
    })

  } catch (error) {
    console.error('Get jobs stats error:', error)
    res.status(500).json({ error: 'Ошибка при получении статистики вакансий' })
  }
})

export default router