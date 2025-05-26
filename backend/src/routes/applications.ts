import { Router } from 'express'
import pool from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Откликнуться на вакансию (только авторизованный)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { job_id } = req.body
  const user_id = req.user.id
  try {
    // Проверка на дублирующий отклик
    const [exists]: any = await pool.query('SELECT id FROM applications WHERE job_id = ? AND user_id = ?', [job_id, user_id])
    if (exists.length > 0) {
      return res.status(400).json({ error: 'Вы уже откликались на эту вакансию' })
    }
    const [result]: any = await pool.query(
      'INSERT INTO applications (job_id, user_id) VALUES (?, ?)',
      [job_id, user_id]
    )
    res.status(201).json({ id: result.insertId })
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при отклике' })
  }
})

// Получить все отклики пользователя
router.get('/user/:user_id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, j.title, j.employer FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.user_id = ? ORDER BY a.applied_at DESC',
      [req.params.user_id]
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при получении откликов пользователя' })
  }
})

// Получить все отклики на вакансию
router.get('/job/:job_id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, u.name, u.email FROM applications a JOIN users u ON a.user_id = u.id WHERE a.job_id = ? ORDER BY a.applied_at DESC',
      [req.params.job_id]
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при получении откликов на вакансию' })
  }
})

// Обновить статус отклика (только владелец вакансии)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { status } = req.body
  const user_id = req.user.id
  try {
    // Получаем job_id отклика
    const [apps]: any = await pool.query('SELECT job_id FROM applications WHERE id = ?', [req.params.id])
    if (!apps.length) return res.status(404).json({ error: 'Отклик не найден' })
    const job_id = apps[0].job_id
    // Проверяем владельца вакансии
    const [jobs]: any = await pool.query('SELECT user_id FROM jobs WHERE id = ?', [job_id])
    if (!jobs.length || jobs[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Нет прав на изменение статуса' })
    }
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Ошибка при обновлении статуса отклика' })
  }
})

export default router 