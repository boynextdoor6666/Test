import { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../db'
import { OAuth2Client } from 'google-auth-library'

// Инициализируем Google OAuth клиент
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const router = Router()

interface GoogleUser {
  email: string
  name: string
  picture?: string
  given_name?: string
  family_name?: string
  email_verified?: boolean
}

// Декодирование и верификация Google JWT токена
// Оставляем для обратной совместимости, но рекомендуем использовать OAuth2Client напрямую
async function verifyGoogleToken(token: string): Promise<GoogleUser | null> {
  try {
    // Используем официальную библиотеку Google Auth
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) return null;
    
    // Базовая валидация
    if (!payload.email || !payload.name) {
      return null;
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
      email_verified: payload.email_verified
    };
  } catch (error) {
    console.error('Error verifying Google token:', error)
    return null
  }
}

// Аутентификация через Google
router.post('/verify', async (req, res) => {
  try {
    const { credential, userType = 'worker' } = req.body

    if (!credential) {
      return res.status(400).json({ 
        error: 'Google credential token обязателен' 
      })
    }

    // Верифицируем Google токен с помощью официальной библиотеки
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    // Получаем данные пользователя из токена
    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ 
        error: 'Неверный Google credential token' 
      })
    }

    const googleUser = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified
    }

    if (!googleUser.email_verified) {
      return res.status(400).json({ 
        error: 'Email не подтвержден в Google аккаунте' 
      })
    }

    // Проверяем, существует ли пользователь с таким email
    const [existingUsers]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [googleUser.email]
    )

    let user
    let isNewUser = false

    if (existingUsers.length > 0) {
      // Пользователь существует - обновляем данные из Google
      user = existingUsers[0]
      
      await pool.query(
        `UPDATE users SET 
         name = ?, 
         photo = ?, 
         auth_provider = 'google',
         last_login = NOW(),
         updated_at = NOW()
         WHERE id = ?`,
        [googleUser.name, googleUser.picture || '', user.id]
      )

      // Получаем обновленные данные
      const [updatedUsers]: any = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [user.id]
      )
      user = updatedUsers[0]

    } else {
      // Новый пользователь - создаем аккаунт
      isNewUser = true
      
      const [result]: any = await pool.query(
        `INSERT INTO users 
         (name, email, photo, user_type, auth_provider, age, skills, experience, has_other_jobs) 
         VALUES (?, ?, ?, ?, 'google', 0, '[]', '', false)`,
        [
          googleUser.name,
          googleUser.email,
          googleUser.picture || '',
          userType
        ]
      )

      // Получаем созданного пользователя
      const [newUsers]: any = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      )
      user = newUsers[0]
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

    res.json({
      success: true,
      message: isNewUser ? 'Аккаунт успешно создан через Google' : 'Успешный вход через Google',
      data: {
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
          authProvider: 'google'
        }
      },
      isNewUser
    })

  } catch (error) {
    console.error('Google auth error:', error)
    res.status(401).json({
      success: false,
      message: 'Ошибка аутентификации Google',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    })
  }
})

// Связать Google аккаунт с существующим пользователем
router.post('/link', async (req, res) => {
  try {
    const { credential, email, password } = req.body

    if (!credential || !email || !password) {
      return res.status(400).json({ 
        error: 'Google credential, email и пароль обязательны' 
      })
    }

    // Верифицируем Google токен
    const googleUser = await verifyGoogleToken(credential)
    
    if (!googleUser) {
      return res.status(400).json({ 
        error: 'Неверный Google credential token' 
      })
    }

    // Проверяем существующего пользователя
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const user = users[0]

    // Проверяем пароль
    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный пароль' })
    }

    // Проверяем, не связан ли уже Google аккаунт
    if (user.auth_provider === 'google') {
      return res.status(400).json({ 
        error: 'Google аккаунт уже связан с этим пользователем' 
      })
    }

    // Связываем Google аккаунт
    await pool.query(
      `UPDATE users SET 
       auth_provider = 'google',
       photo = COALESCE(?, photo),
       updated_at = NOW()
       WHERE id = ?`,
      [googleUser.picture || '', user.id]
    )

    res.json({ 
      message: 'Google аккаунт успешно связан',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        authProvider: 'google'
      }
    })

  } catch (error) {
    console.error('Google link error:', error)
    res.status(500).json({ error: 'Ошибка при связывании Google аккаунта' })
  }
})

// Отвязать Google аккаунт
router.post('/unlink', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email и пароль обязательны' 
      })
    }

    // Проверяем пользователя
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const user = users[0]

    // Проверяем пароль
    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный пароль' })
    }

    // Проверяем, связан ли Google аккаунт
    if (user.auth_provider !== 'google') {
      return res.status(400).json({ 
        error: 'Google аккаунт не связан с этим пользователем' 
      })
    }

    // Отвязываем Google аккаунт
    await pool.query(
      `UPDATE users SET 
       auth_provider = '',
       updated_at = NOW()
       WHERE id = ?`,
      [user.id]
    )

    res.json({ message: 'Google аккаунт успешно отвязан' })

  } catch (error) {
    console.error('Google unlink error:', error)
    res.status(500).json({ error: 'Ошибка при отвязывании Google аккаунта' })
  }
})

export default router