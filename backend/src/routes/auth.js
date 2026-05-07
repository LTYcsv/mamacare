import { Router } from 'express'
import { randomUUID } from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import pool from '../db.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(6).max(128),
})
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required')
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000
const IS_PROD = process.env.NODE_ENV === 'production'
const REFRESH_COOKIE = IS_PROD ? '__Host-refresh_token' : 'refresh_token'
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: IS_PROD,
  path: '/',
}

async function issueRefreshToken(userId) {
  const jti = randomUUID()
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS)
  await pool.query(
    'INSERT INTO refresh_tokens (jti, user_id, expires_at) VALUES ($1, $2, $3)',
    [jti, userId, expiresAt]
  )
  return jwt.sign({ sub: userId, jti, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' })
}

function issueAccessToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '1h' })
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, { ...COOKIE_OPTS, maxAge: REFRESH_TTL_MS })
}

// POST /api/auth/register
router.post('/register', validate(credentialsSchema), async (req, res) => {
  const { email, password } = req.body

  const hash = await bcrypt.hash(password, 12)
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, profile_complete',
      [email, hash]
    )
    const user = rows[0]
    setRefreshCookie(res, await issueRefreshToken(user.id))
    res.json({ access_token: issueAccessToken(user.id), user })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email уже зарегистрирован' })
    throw err
  }
})

// POST /api/auth/login
router.post('/login', validate(credentialsSchema), async (req, res) => {
  const { email, password } = req.body

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  const user = rows[0]
  if (!user) return res.status(401).json({ error: 'Неверный email или пароль' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Неверный email или пароль' })

  setRefreshCookie(res, await issueRefreshToken(user.id))
  res.json({
    access_token: issueAccessToken(user.id),
    user: { id: user.id, email: user.email, profile_complete: user.profile_complete, name: user.name, week: user.week },
  })
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE]
  if (!token) return res.status(401).json({ error: 'no refresh token' })

  let payload
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch {
    return res.status(401).json({ error: 'invalid refresh token' })
  }
  if (payload.type !== 'refresh' || !payload.jti) {
    return res.status(401).json({ error: 'invalid token type' })
  }

  // Атомарно отзываем именно этот jti — выигрывает только один параллельный запрос
  const { rows: revoked } = await pool.query(
    `UPDATE refresh_tokens
        SET revoked_at = NOW()
      WHERE jti = $1 AND revoked_at IS NULL AND expires_at > NOW()
      RETURNING user_id`,
    [payload.jti]
  )

  if (revoked.length === 0) {
    // Токен либо неизвестен, либо уже отозван, либо истёк.
    // Если он СУЩЕСТВУЕТ в таблице, но был отозван — это re-use (украденный токен).
    const { rows: existing } = await pool.query(
      'SELECT user_id, revoked_at FROM refresh_tokens WHERE jti = $1',
      [payload.jti]
    )
    if (existing.length > 0 && existing[0].revoked_at) {
      // Реакция на компрометацию: выкидываем все активные сессии этого пользователя
      await pool.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
        [existing[0].user_id]
      )
      console.warn(`[auth] refresh token reuse detected, user_id=${existing[0].user_id}`)
    }
    res.clearCookie(REFRESH_COOKIE, COOKIE_OPTS)
    return res.status(401).json({ error: 'invalid refresh token' })
  }

  const userId = revoked[0].user_id
  setRefreshCookie(res, await issueRefreshToken(userId))
  res.json({ access_token: issueAccessToken(userId) })
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE]
  if (token) {
    try {
      const { jti } = jwt.verify(token, JWT_SECRET)
      if (jti) {
        await pool.query(
          'UPDATE refresh_tokens SET revoked_at = NOW() WHERE jti = $1 AND revoked_at IS NULL',
          [jti]
        )
      }
    } catch { /* token уже невалиден — просто чистим cookie */ }
  }
  res.clearCookie(REFRESH_COOKIE, COOKIE_OPTS)
  res.json({ ok: true })
})

export default router
