import { Router } from 'express'
import pool from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Получить расширенный профиль пользователя
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id

    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const user = users[0]

    // Получаем дополнительную статистику в зависимости от типа пользователя
    let additionalStats = {}

    if (user.user_type === 'employer') {
      // Статистика для работодателя
      const [jobsCount]: any = await pool.query(
        'SELECT COUNT(*) as count FROM jobs WHERE user_id = ?',
        [userId]
      )

      const [applicationsCount]: any = await pool.query(
        `SELECT COUNT(*) as count 
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE j.user_id = ?`,
        [userId]
      )

      additionalStats = {
        total_jobs_posted: jobsCount[0].count,
        total_applications_received: applicationsCount[0].count
      }

    } else if (user.user_type === 'worker') {
      // Статистика для работника
      const [applicationsCount]: any = await pool.query(
        'SELECT COUNT(*) as count FROM applications WHERE user_id = ?',
        [userId]
      )

      const [acceptedApplications]: any = await pool.query(
        'SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND status = ?',
        [userId, 'accepted']
      )

      additionalStats = {
        total_applications_sent: applicationsCount[0].count,
        total_applications_accepted: acceptedApplications[0].count
      }
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        userType: user.user_type,
        photo: user.photo || '',
        age: user.age || 0,
        skills: user.skills ? JSON.parse(user.skills) : [],
        experience: user.experience || '',
        hasOtherJobs: user.has_other_jobs || false,
        authProvider: user.auth_provider || '',
        createdAt: user.created_at,
        lastLogin: user.last_login,
        updatedAt: user.updated_at,
        ...additionalStats
      }
    })

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Ошибка при получении профиля' })
  }
})

// Обновить профиль с валидацией
router.put('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id
    const {
      name,
      phone,
      photo,
      age,
      skills,
      experience,
      hasOtherJobs
    } = req.body

    // Расширенная валидация
    const errors: string[] = []

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Имя не может быть пустым')
      } else if (name.length > 255) {
        errors.push('Имя не может быть длиннее 255 символов')
      }
    }

    if (phone !== undefined && phone !== '') {
      const phoneRegex = /^\+?\d{10,15}$/
      if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.push('Некорректный формат телефона')
      }
    }

    if (age !== undefined) {
      if (!Number.isInteger(age) || age < 14 || age > 120) {
        errors.push('Возраст должен быть числом от 14 до 120 лет')
      }
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        errors.push('Навыки должны быть массивом')
      } else if (skills.length > 50) {
        errors.push('Слишком много навыков (максимум 50)')
      }
    }

    if (experience !== undefined && typeof experience !== 'string') {
      errors.push('Опыт работы должен быть строкой')
    }

    if (hasOtherJobs !== undefined && typeof hasOtherJobs !== 'boolean') {
      errors.push('hasOtherJobs должно быть булевым значением')
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    // Обновляем профиль
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (name !== undefined) {
      updateFields.push('name = ?')
      updateValues.push(name.trim())
    }

    if (phone !== undefined) {
      updateFields.push('phone = ?')
      updateValues.push(phone || null)
    }

    if (photo !== undefined) {
      updateFields.push('photo = ?')
      updateValues.push(photo || null)
    }

    if (age !== undefined) {
      updateFields.push('age = ?')
      updateValues.push(age)
    }

    if (skills !== undefined) {
      updateFields.push('skills = ?')
      updateValues.push(JSON.stringify(skills))
    }

    if (experience !== undefined) {
      updateFields.push('experience = ?')
      updateValues.push(experience)
    }

    if (hasOtherJobs !== undefined) {
      updateFields.push('has_other_jobs = ?')
      updateValues.push(hasOtherJobs)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' })
    }

    updateFields.push('updated_at = NOW()')
    updateValues.push(userId)

    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    // Получаем обновленные данные
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    )

    const user = users[0]

    res.json({
      message: 'Профиль успешно обновлен',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        userType: user.user_type,
        photo: user.photo || '',
        age: user.age || 0,
        skills: user.skills ? JSON.parse(user.skills) : [],
        experience: user.experience || '',
        hasOtherJobs: user.has_other_jobs || false,
        authProvider: user.auth_provider || ''
      }
    })

  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Ошибка при обновлении профиля' })
  }
})

// Загрузить фото профиля (Base64)
router.post('/photo', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id
    const { photo } = req.body

    if (!photo) {
      return res.status(400).json({ error: 'Фото обязательно' })
    }

    // Проверяем формат Base64
    if (!photo.startsWith('data:image/')) {
      return res.status(400).json({ 
        error: 'Неверный формат изображения. Ожидается Base64' 
      })
    }

    // Проверяем размер (примерно 5MB в Base64)
    if (photo.length > 7000000) {
      return res.status(400).json({ 
        error: 'Изображение слишком большое. Максимум 5MB' 
      })
    }

    // Обновляем фото
    await pool.query(
      'UPDATE users SET photo = ?, updated_at = NOW() WHERE id = ?',
      [photo, userId]
    )

    res.json({ 
      message: 'Фото профиля успешно обновлено',
      photo
    })

  } catch (error) {
    console.error('Upload photo error:', error)
    res.status(500).json({ error: 'Ошибка при загрузке фото' })
  }
})

// Удалить фото профиля
router.delete('/photo', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id

    await pool.query(
      'UPDATE users SET photo = NULL, updated_at = NOW() WHERE id = ?',
      [userId]
    )

    res.json({ message: 'Фото профиля успешно удалено' })

  } catch (error) {
    console.error('Delete photo error:', error)
    res.status(500).json({ error: 'Ошибка при удалении фото' })
  }
})

// Получить публичный профиль пользователя
router.get('/public/:id', async (req, res) => {
  try {
    const userId = req.params.id

    const [users]: any = await pool.query(
      'SELECT id, name, photo, age, skills, experience, user_type, created_at FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const user = users[0]

    // Публичная информация (без чувствительных данных)
    const publicProfile: any = {
      id: user.id,
      name: user.name,
      photo: user.photo || '',
      age: user.age || 0,
      skills: user.skills ? JSON.parse(user.skills) : [],
      experience: user.experience || '',
      userType: user.user_type,
      memberSince: user.created_at
    }

    // Добавляем статистику в зависимости от типа пользователя
    if (user.user_type === 'employer') {
      const [jobsCount]: any = await pool.query(
        'SELECT COUNT(*) as count FROM jobs WHERE user_id = ?',
        [userId]
      )

      publicProfile.totalJobsPosted = jobsCount[0].count

    } else if (user.user_type === 'worker') {
      const [acceptedApplications]: any = await pool.query(
        'SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND status = ?',
        [userId, 'accepted']
      )

      publicProfile.successfulApplications = acceptedApplications[0].count
    }

    res.json({ profile: publicProfile })

  } catch (error) {
    console.error('Get public profile error:', error)
    res.status(500).json({ error: 'Ошибка при получении публичного профиля' })
  }
})

// Получить настройки профиля
router.get('/settings', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id

    // В будущем здесь можно добавить таблицу настроек
    // Пока возвращаем базовые настройки
    const defaultSettings = {
      emailNotifications: true,
      smsNotifications: false,
      profileVisibility: 'public', // public, private, contacts
      jobAlerts: true,
      language: 'ru'
    }

    res.json({ settings: defaultSettings })

  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ error: 'Ошибка при получении настроек' })
  }
})

// Обновить настройки профиля
router.put('/settings', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id
    const {
      emailNotifications,
      smsNotifications,
      profileVisibility,
      jobAlerts,
      language
    } = req.body

    // Валидация настроек
    const allowedVisibility = ['public', 'private', 'contacts']
    const allowedLanguages = ['ru', 'en', 'ky']

    if (profileVisibility && !allowedVisibility.includes(profileVisibility)) {
      return res.status(400).json({ 
        error: 'Недопустимое значение видимости профиля' 
      })
    }

    if (language && !allowedLanguages.includes(language)) {
      return res.status(400).json({ 
        error: 'Неподдерживаемый язык' 
      })
    }

    // В будущем здесь будет сохранение в таблицу настроек
    // Пока просто возвращаем обновленные настройки
    const updatedSettings = {
      emailNotifications: emailNotifications ?? true,
      smsNotifications: smsNotifications ?? false,
      profileVisibility: profileVisibility ?? 'public',
      jobAlerts: jobAlerts ?? true,
      language: language ?? 'ru'
    }

    res.json({ 
      message: 'Настройки успешно обновлены',
      settings: updatedSettings 
    })

  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ error: 'Ошибка при обновлении настроек' })
  }
})

export default router