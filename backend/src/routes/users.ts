import { Router } from 'express'
import pool from '../db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

// Регистрация
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body
  try {
    const [users]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (users.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' })
    }
    const hash = await bcrypt.hash(password, 10)
    const [result]: any = await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hash, phone]
    )
    res.status(201).json({ id: result.insertId })
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при регистрации' })
  }
})

// Логин
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
      return res.status(400).json({ error: 'Неверный email или пароль' })
    }
    const user = users[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(400).json({ error: 'Неверный email или пароль' })
    }
    const secret = process.env.JWT_SECRET || 'supersecretjwtkey'
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, secret, { expiresIn: '7d' })
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
    })
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при входе' })
  }
})

export default router 