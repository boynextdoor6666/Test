import { Router } from 'express'
import pool from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Получить все вакансии
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC')
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при получении вакансий' })
  }
})

// Получить вакансию по id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id])
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0])
    } else {
      res.status(404).json({ error: 'Вакансия не найдена' })
    }
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при получении вакансии' })
  }
})

// Создать вакансию (только авторизованный)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, description, salary, location, phone, date, category, requirements, employer } = req.body
    const user_id = req.user.id
    const [result]: any = await pool.query(
      'INSERT INTO jobs (title, description, salary, location, phone, date, category, requirements, employer, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, salary, location, phone, date, category, JSON.stringify(requirements), employer, user_id]
    )
    res.status(201).json({ id: result.insertId })
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при создании вакансии' })
  }
})

// Обновить вакансию (только владелец)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, description, salary, location, phone, date, category, requirements, employer } = req.body
    const user_id = req.user.id
    // Проверка владельца
    const [jobs]: any = await pool.query('SELECT user_id FROM jobs WHERE id = ?', [req.params.id])
    if (!jobs.length || jobs[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Нет прав на редактирование' })
    }
    await pool.query(
      'UPDATE jobs SET title=?, description=?, salary=?, location=?, phone=?, date=?, category=?, requirements=?, employer=? WHERE id=?',
      [title, description, salary, location, phone, date, category, JSON.stringify(requirements), employer, req.params.id]
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при обновлении вакансии' })
  }
})

// Удалить вакансию (только владелец)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user_id = req.user.id
    // Проверка владельца
    const [jobs]: any = await pool.query('SELECT user_id FROM jobs WHERE id = ?', [req.params.id])
    if (!jobs.length || jobs[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Нет прав на удаление' })
    }
    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при удалении вакансии' })
  }
})

export default router 