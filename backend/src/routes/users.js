import { Router } from 'express'
import { z } from 'zod'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const profileSchema = z.object({
  name: z.string().trim().min(1).max(50),
  age: z.number().int().min(0).max(120).nullish(),
  week: z.number().int().min(1).max(42),
  doctor: z.object({
    name:   z.string().trim().min(1).max(100),
    spec:   z.string().trim().max(100).optional(),
    phone:  z.string().trim().max(30).optional(),
    clinic: z.string().trim().max(100).optional(),
    addr:   z.string().trim().max(200).optional(),
  }).nullish(),
})

// POST /api/users/profile — заполнить анкету после регистрации
router.post('/profile', requireAuth, validate(profileSchema), async (req, res) => {
  const { name, age, week, doctor } = req.body
  const userId = req.userId
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      'UPDATE users SET name=$1, age=$2, week=$3, profile_complete=TRUE WHERE id=$4 RETURNING *',
      [name, age ?? null, week ?? 8, userId]
    )
    if (doctor?.name) {
      await client.query(
        `INSERT INTO doctors (user_id, name, spec, phone, clinic, addr) VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (user_id) DO UPDATE SET name=$2, spec=$3, phone=$4, clinic=$5, addr=$6`,
        [userId, doctor.name, doctor.spec, doctor.phone, doctor.clinic, doctor.addr]
      )
    }
    await client.query('COMMIT')
    res.json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})

// GET /api/users/me — профиль + врач + записи текущего пользователя
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.userId
  const [userRes, doctorRes, entriesRes] = await Promise.all([
    pool.query('SELECT * FROM users WHERE id = $1', [userId]),
    pool.query('SELECT * FROM doctors WHERE user_id = $1 LIMIT 1', [userId]),
    pool.query('SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY date DESC', [userId]),
  ])
  if (!userRes.rows.length) return res.status(404).json({ error: 'not found' })
  res.json({
    user:    userRes.rows[0],
    doctor:  doctorRes.rows[0] ?? null,
    entries: entriesRes.rows,
  })
})

export default router
