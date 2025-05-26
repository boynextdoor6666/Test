import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db'
import jobsRouter from './routes/jobs'
import usersRouter from './routes/users'
import applicationsRouter from './routes/applications'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1')
    res.json({ status: 'ok', db: true })
  } catch (e) {
    res.status(500).json({ status: 'error', db: false })
  }
})

app.use('/api/jobs', jobsRouter)
app.use('/api/users', usersRouter)
app.use('/api/applications', applicationsRouter)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 