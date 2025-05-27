import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db'
import jobsRouter from './routes/jobs'
import usersRouter from './routes/users'
import applicationsRouter from './routes/applications'
import profileRouter from './routes/profile'
import googleAuthRouter from './routes/googleAuth'

dotenv.config()

const app = express()

// CORS настройки для Railway и локальной разработки
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'https://*.railway.app',
    'https://*.up.railway.app',
    process.env.FRONTEND_URL
  ].filter((v): v is string => Boolean(v)),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' })) // Увеличиваем лимит для загрузки фото

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1')
    res.json({ 
      status: 'ok', 
      db: true,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  } catch (e) {
    console.error('Health check failed:', e)
    res.status(500).json({ 
      status: 'error', 
      db: false,
      error: 'Database connection failed'
    })
  }
})

// API Routes
app.use('/api/jobs', jobsRouter)
app.use('/api/users', usersRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/profile', profileRouter)
app.use('/api/auth/google', googleAuthRouter)

// Обработка 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// Глобальная обработка ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 API Documentation:`)
    console.log(`   Users: http://localhost:${PORT}/api/users`)
    console.log(`   Jobs: http://localhost:${PORT}/api/jobs`)
    console.log(`   Applications: http://localhost:${PORT}/api/applications`)
    console.log(`   Profile: http://localhost:${PORT}/api/profile`)
  }
})