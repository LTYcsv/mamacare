import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod'
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000

function makeTokens(userId) {
  const access  = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '1h' })
  const refresh = jwt.sign({ sub: userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' })
  return { access, refresh }
}

function setRefreshCookie(res, token) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: REFRESH_TTL_MS,
    path: '/api/auth/refresh',
  })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' })
  if (password.length < 6) return res.status(400).json({ error: 'Пароль минимум 6 символов' })

  const hash = await bcrypt.hash(password, 10)
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, profile_complete',
      [email.toLowerCase().trim(), hash]
    )
    const user = rows[0]
    const { access, refresh } = makeTokens(user.id)
    setRefreshCookie(res, refresh)
    res.json({ access_token: access, user })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email уже зарегистрирован' })
    throw err
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' })

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()])
  const user = rows[0]
  if (!user) return res.status(401).json({ error: 'Неверный email или пароль' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Неверный email или пароль' })

  const { access, refresh } = makeTokens(user.id)
  setRefreshCookie(res, refresh)
  res.json({
    access_token: access,
    user: { id: user.id, email: user.email, profile_complete: user.profile_complete, name: user.name, week: user.week },
  })
})

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refresh_token
  if (!token) return res.status(401).json({ error: 'no refresh token' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.type !== 'refresh') return res.status(401).json({ error: 'invalid token type' })
    const access = jwt.sign({ sub: payload.sub }, JWT_SECRET, { expiresIn: '1h' })
    res.json({ access_token: access })
  } catch {
    res.status(401).json({ error: 'invalid refresh token' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' })
  res.json({ ok: true })
})

export default router
