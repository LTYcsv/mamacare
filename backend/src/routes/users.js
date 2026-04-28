import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// POST /api/users — создать пользователя (+ опционально врача)
router.post('/', async (req, res) => {
  const { name, age, week, doctor } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(
      'INSERT INTO users (name, age, week) VALUES ($1, $2, $3) RETURNING *',
      [name, age ?? null, week ?? 8]
    )
    const user = rows[0]

    if (doctor?.name) {
      await client.query(
        'INSERT INTO doctors (user_id, name, spec, phone, clinic, addr) VALUES ($1,$2,$3,$4,$5,$6)',
        [user.id, doctor.name, doctor.spec, doctor.phone, doctor.clinic, doctor.addr]
      )
    }

    await client.query('COMMIT')
    res.json(user)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})

// GET /api/users/:id — профиль + врач + записи
router.get('/:id', async (req, res) => {
  const { id } = req.params

  const [userRes, doctorRes, entriesRes] = await Promise.all([
    pool.query('SELECT * FROM users WHERE id = $1', [id]),
    pool.query('SELECT * FROM doctors WHERE user_id = $1 LIMIT 1', [id]),
    pool.query(
      'SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY date DESC',
      [id]
    ),
  ])

  if (!userRes.rows.length) return res.status(404).json({ error: 'not found' })

  res.json({
    user:    userRes.rows[0],
    doctor:  doctorRes.rows[0] ?? null,
    entries: entriesRes.rows,
  })
})

// PATCH /api/users/:id — обновить неделю
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { week } = req.body
  const { rows } = await pool.query(
    'UPDATE users SET week = $1 WHERE id = $2 RETURNING *',
    [week, id]
  )
  res.json(rows[0])
})

export default router
