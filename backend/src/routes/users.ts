import { Router } from 'express'
import pool from '../db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Типы для пользователя
interface UserRegistration {
  name: string
  email: string
  password: string
  phone?: string
  userType: 'worker' | 'employer'
  photo?: string
  age?: number
  skills?: string[]
  experience?: string
  hasOtherJobs?: boolean
}

interface UserLogin {
  email: string
  password: string
}

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      userType = 'worker',
      photo = '',
      age = 0,
      skills = [],
      experience = '',
      hasOtherJobs = false
    }: UserRegistration = req.body

    // Валидация
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Имя, email и пароль обязательны для заполнения' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Пароль должен содержать минимум 6 символов' 
      })
    }

    // Email валидация
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Некорректный формат email' 
      })
    }

    // Проверяем, существует ли пользователь
    const [existingUsers]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    )
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'Пользователь с таким email уже существует' 
      })
    }

    // Хешируем пароль
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Сохраняем пользователя
    const [result]: any = await pool.query(
      `INSERT INTO users 
       (name, email, password, phone, user_type, photo, age, skills, experience, has_other_jobs) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        email, 
        hashedPassword, 
        phone || null, 
        userType,
        photo,
        age,
        JSON.stringify(skills),
        experience,
        hasOtherJobs
      ]
    )

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email, 
        userType,
        name 
      },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        phone: phone || '',
        userType,
        photo,
        age,
        skills,
        experience,
        hasOtherJobs
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Ошибка при регистрации пользователя' })
  }
})

// Логин
router.post('/login', async (req, res) => {
  try {
    const { email, password }: UserLogin = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email и пароль обязательны для заполнения' 
      })
    }

    // Ищем пользователя
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      })
    }

    const user = users[0]

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      })
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        userType: user.user_type,
        name: user.name 
      },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '7d' }
    )

    // Обновляем время последнего входа
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    )

    res.json({
      message: 'Успешный вход в систему',
      token,
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
    console.error('Login error:', error)
    res.status(500).json({ error: 'Ошибка при входе в систему' })
  }
})

// Получить профиль текущего пользователя
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
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
        lastLogin: user.last_login
      }
    })

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Ошибка при получении профиля' })
  }
})

// Обновить профиль
router.put('/me', authMiddleware, async (req: AuthRequest, res) => {
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

    // Валидация
    if (name && name.trim().length === 0) {
      return res.status(400).json({ error: 'Имя не может быть пустым' })
    }

    if (phone && !/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Некорректный формат телефона' })
    }

    if (age && (age < 0 || age > 120)) {
      return res.status(400).json({ error: 'Некорректный возраст' })
    }

    // Обновляем профиль
    await pool.query(
      `UPDATE users SET 
       name = COALESCE(?, name),
       phone = COALESCE(?, phone),
       photo = COALESCE(?, photo),
       age = COALESCE(?, age),
       skills = COALESCE(?, skills),
       experience = COALESCE(?, experience),
       has_other_jobs = COALESCE(?, has_other_jobs),
       updated_at = NOW()
       WHERE id = ?`,
      [
        name || null,
        phone || null,
        photo || null,
        age || null,
        skills ? JSON.stringify(skills) : null,
        experience || null,
        hasOtherJobs !== undefined ? hasOtherJobs : null,
        userId
      ]
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

// Изменить пароль
router.put('/change-password', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Текущий пароль и новый пароль обязательны' 
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Новый пароль должен содержать минимум 6 символов' 
      })
    }

    // Получаем текущий пароль пользователя
    const [users]: any = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password)
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Неверный текущий пароль' })
    }

    // Хешируем новый пароль
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Обновляем пароль
    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, userId]
    )

    res.json({ message: 'Пароль успешно изменен' })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Ошибка при изменении пароля' })
  }
})

// Удалить аккаунт
router.delete('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ 
        error: 'Для удаления аккаунта необходимо подтвердить пароль' 
      })
    }

    // Получаем пользователя
    const [users]: any = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, users[0].password)
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный пароль' })
    }

    // Начинаем транзакцию для безопасного удаления
    await pool.query('START TRANSACTION')

    try {
      // Удаляем связанные данные
      await pool.query('DELETE FROM applications WHERE user_id = ?', [userId])
      await pool.query('DELETE FROM jobs WHERE user_id = ?', [userId])
      await pool.query('DELETE FROM users WHERE id = ?', [userId])

      await pool.query('COMMIT')

      res.json({ message: 'Аккаунт успешно удален' })

    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ error: 'Ошибка при удалении аккаунта' })
  }
})

export default router