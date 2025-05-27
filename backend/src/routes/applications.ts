import { Router } from 'express'
import pool from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Откликнуться на вакансию (только авторизованный работник)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { job_id, cover_letter = '' } = req.body
    const user_id = req.user.id

    if (!job_id) {
      return res.status(400).json({ error: 'ID вакансии обязателен' })
    }

    // Проверяем, что пользователь - работник
    const [users]: any = await pool.query(
      'SELECT user_type FROM users WHERE id = ?',
      [user_id]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    if (users[0].user_type !== 'worker') {
      return res.status(403).json({ 
        error: 'Только работники могут откликаться на вакансии' 
      })
    }

    // Проверяем, существует ли вакансия
    const [jobs]: any = await pool.query(
      'SELECT id, user_id, title FROM jobs WHERE id = ?',
      [job_id]
    )

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Вакансия не найдена' })
    }

    // Проверяем, что пользователь не откликается на свою же вакансию
    if (jobs[0].user_id === user_id) {
      return res.status(400).json({ 
        error: 'Нельзя откликнуться на собственную вакансию' 
      })
    }

    // Проверяем на дублирующий отклик
    const [existingApplications]: any = await pool.query(
      'SELECT id FROM applications WHERE job_id = ? AND user_id = ?',
      [job_id, user_id]
    )

    if (existingApplications.length > 0) {
      return res.status(400).json({ 
        error: 'Вы уже откликались на эту вакансию' 
      })
    }

    // Создаем отклик
    const [result]: any = await pool.query(
      'INSERT INTO applications (job_id, user_id, cover_letter, status) VALUES (?, ?, ?, ?)',
      [job_id, user_id, cover_letter, 'pending']
    )

    res.status(201).json({
      message: 'Отклик успешно отправлен',
      application: {
        id: result.insertId,
        job_id,
        user_id,
        cover_letter,
        status: 'pending',
        job_title: jobs[0].title
      }
    })

  } catch (error) {
    console.error('Create application error:', error)
    res.status(500).json({ error: 'Ошибка при отправке отклика' })
  }
})

// Получить все отклики пользователя
router.get('/user/:user_id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const requestedUserId = req.params.user_id
    const currentUserId = req.user.id

    // Проверяем права доступа (пользователь может смотреть только свои отклики)
    if (parseInt(requestedUserId) !== currentUserId) {
      return res.status(403).json({ 
        error: 'Нет прав для просмотра откликов другого пользователя' 
      })
    }

    const { page = 1, limit = 20, status } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let whereClause = 'WHERE a.user_id = ?'
    const queryParams = [requestedUserId]

    // Фильтр по статусу
    if (status) {
      whereClause += ' AND a.status = ?'
      queryParams.push(String(status))
    }

    const [rows]: any = await pool.query(
      `SELECT a.*, j.title, j.employer, j.location, j.salary, j.category, j.urgency,
       u.name as employer_name, u.photo as employer_photo
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       LEFT JOIN users u ON j.user_id = u.id
       ${whereClause}
       ORDER BY a.applied_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, Number(limit), offset]
    )

    // Получаем общее количество
    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM applications a ${whereClause}`,
      queryParams
    )

    const total = countResult[0].total

    const formattedApplications = rows.map((app: any) => ({
      id: app.id,
      job_id: app.job_id,
      status: app.status,
      cover_letter: app.cover_letter || '',
      applied_at: app.applied_at,
      updated_at: app.updated_at,
      job: {
        title: app.title,
        employer: app.employer || app.employer_name || 'Не указано',
        employer_photo: app.employer_photo || '',
        location: app.location || '',
        salary: app.salary || '',
        category: app.category || '',
        urgency: app.urgency || 'medium'
      }
    }))

    res.json({
      applications: formattedApplications,
      pagination: {
        current_page: Number(page),
        total_pages: Math.ceil(total / Number(limit)),
        total_items: total,
        items_per_page: Number(limit)
      }
    })

  } catch (error) {
    console.error('Get user applications error:', error)
    res.status(500).json({ error: 'Ошибка при получении откликов пользователя' })
  }
})

// Получить все отклики на вакансию (только владелец вакансии)
router.get('/job/:job_id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const jobId = req.params.job_id
    const userId = req.user.id

    // Проверяем, что пользователь - владелец вакансии
    const [jobs]: any = await pool.query(
      'SELECT user_id FROM jobs WHERE id = ?',
      [jobId]
    )

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Вакансия не найдена' })
    }

    if (jobs[0].user_id !== userId) {
      return res.status(403).json({ 
        error: 'Нет прав для просмотра откликов на эту вакансию' 
      })
    }

    const { page = 1, limit = 20, status } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let whereClause = 'WHERE a.job_id = ?'
    const queryParams = [jobId]

    // Фильтр по статусу
    if (status) {
      whereClause += ' AND a.status = ?'
      queryParams.push(String(status))
    }

    const [rows]: any = await pool.query(
      `SELECT a.*, u.name, u.email, u.phone, u.photo, u.age, u.skills, u.experience
       FROM applications a 
       JOIN users u ON a.user_id = u.id
       ${whereClause}
       ORDER BY a.applied_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, Number(limit), offset]
    )

    // Получаем общее количество
    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM applications a ${whereClause}`,
      queryParams
    )

    const total = countResult[0].total

    const formattedApplications = rows.map((app: any) => ({
      id: app.id,
      job_id: app.job_id,
      status: app.status,
      cover_letter: app.cover_letter || '',
      applied_at: app.applied_at,
      updated_at: app.updated_at,
      applicant: {
        id: app.user_id,
        name: app.name,
        email: app.email,
        phone: app.phone || '',
        photo: app.photo || '',
        age: app.age || 0,
        skills: app.skills ? JSON.parse(app.skills) : [],
        experience: app.experience || ''
      }
    }))

    res.json({
      applications: formattedApplications,
      pagination: {
        current_page: Number(page),
        total_pages: Math.ceil(total / Number(limit)),
        total_items: total,
        items_per_page: Number(limit)
      }
    })

  } catch (error) {
    console.error('Get job applications error:', error)
    res.status(500).json({ error: 'Ошибка при получении откликов на вакансию' })
  }
})

// Обновить статус отклика (только владелец вакансии)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const applicationId = req.params.id
    const userId = req.user.id
    const { status, employer_comment = '' } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Статус обязателен' })
    }

    // Проверяем допустимые статусы
    const allowedStatuses = ['pending', 'reviewed', 'accepted', 'rejected']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Недопустимый статус. Разрешены: ' + allowedStatuses.join(', ') 
      })
    }

    // Получаем информацию об отклике и проверяем права
    const [applications]: any = await pool.query(
      `SELECT a.job_id, j.user_id as job_owner_id, a.user_id as applicant_id
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [applicationId]
    )

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Отклик не найден' })
    }

    const application = applications[0]

    // Проверяем, что пользователь - владелец вакансии
    if (application.job_owner_id !== userId) {
      return res.status(403).json({ 
        error: 'Нет прав на изменение статуса этого отклика' 
      })
    }

    // Обновляем статус отклика
    await pool.query(
      'UPDATE applications SET status = ?, employer_comment = ?, updated_at = NOW() WHERE id = ?',
      [status, employer_comment, applicationId]
    )

    // Если статус "принят", отклоняем все остальные отклики на эту вакансию
    if (status === 'accepted') {
      await pool.query(
        `UPDATE applications 
         SET status = 'rejected', 
             employer_comment = 'Вакансия закрыта - выбран другой кандидат',
             updated_at = NOW()
         WHERE job_id = ? AND id != ? AND status IN ('pending', 'reviewed')`,
        [application.job_id, applicationId]
      )
    }

    res.json({ 
      message: 'Статус отклика успешно обновлен',
      application: {
        id: applicationId,
        status,
        employer_comment
      }
    })

  } catch (error) {
    console.error('Update application status error:', error)
    res.status(500).json({ error: 'Ошибка при обновлении статуса отклика' })
  }
})

// Отозвать отклик (только автор отклика)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const applicationId = req.params.id
    const userId = req.user.id

    // Проверяем, что отклик принадлежит пользователю
    const [applications]: any = await pool.query(
      'SELECT user_id, status FROM applications WHERE id = ?',
      [applicationId]
    )

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Отклик не найден' })
    }

    const application = applications[0]

    if (application.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Нет прав на удаление этого отклика' 
      })
    }

    // Нельзя отозвать принятый отклик
    if (application.status === 'accepted') {
      return res.status(400).json({ 
        error: 'Нельзя отозвать принятый отклик' 
      })
    }

    // Удаляем отклик
    await pool.query('DELETE FROM applications WHERE id = ?', [applicationId])

    res.json({ message: 'Отклик успешно отозван' })

  } catch (error) {
    console.error('Delete application error:', error)
    res.status(500).json({ error: 'Ошибка при отзыве отклика' })
  }
})

// Получить статистику откликов для работодателя
router.get('/stats/employer', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id

    // Общее количество откликов на все вакансии пользователя
    const [totalApplications]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.user_id = ?`,
      [userId]
    )

    // Количество откликов по статусам
    const [statusStats]: any = await pool.query(
      `SELECT a.status, COUNT(*) as count
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.user_id = ?
       GROUP BY a.status`,
      [userId]
    )

    // Новые отклики за последние 7 дней
    const [newApplications]: any = await pool.query(
      `SELECT COUNT(*) as count
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.user_id = ? AND a.applied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    )

    // Топ вакансий по количеству откликов
    const [topJobs]: any = await pool.query(
      `SELECT j.title, j.id, COUNT(a.id) as applications_count
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.user_id = ?
       GROUP BY j.id, j.title
       ORDER BY applications_count DESC
       LIMIT 5`,
      [userId]
    )

    res.json({
      total_applications: totalApplications[0].count,
      new_applications_week: newApplications[0].count,
      status_distribution: statusStats,
      top_jobs_by_applications: topJobs
    })

  } catch (error) {
    console.error('Get employer stats error:', error)
    res.status(500).json({ error: 'Ошибка при получении статистики работодателя' })
  }
})

// Получить статистику откликов для работника
router.get('/stats/worker', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id

    // Общее количество откликов пользователя
    const [totalApplications]: any = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE user_id = ?',
      [userId]
    )

    // Количество откликов по статусам
    const [statusStats]: any = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM applications
       WHERE user_id = ?
       GROUP BY status`,
      [userId]
    )

    // Отклики за последние 30 дней
    const [recentApplications]: any = await pool.query(
      `SELECT COUNT(*) as count
       FROM applications
       WHERE user_id = ? AND applied_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [userId]
    )

    // Процент успешности (принятые/общее количество)
    const [acceptedApplications]: any = await pool.query(
      `SELECT COUNT(*) as count
       FROM applications
       WHERE user_id = ? AND status = 'accepted'`,
      [userId]
    )

    const successRate = totalApplications[0].count > 0 
      ? (acceptedApplications[0].count / totalApplications[0].count * 100).toFixed(1)
      : '0.0'

    res.json({
      total_applications: totalApplications[0].count,
      recent_applications_month: recentApplications[0].count,
      accepted_applications: acceptedApplications[0].count,
      success_rate: `${successRate}%`,
      status_distribution: statusStats
    })

  } catch (error) {
    console.error('Get worker stats error:', error)
    res.status(500).json({ error: 'Ошибка при получении статистики работника' })
  }
})

export default router