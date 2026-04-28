import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET /api/entries?userId=1 — все записи пользователя
router.get('/', async (req, res) => {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'userId required' })

  const { rows } = await pool.query(
    'SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY date DESC',
    [userId]
  )
  res.json(rows)
})

// POST /api/entries — создать или обновить запись за дату (upsert)
router.post('/', async (req, res) => {
  const { userId, date, emoji, moodLabel, text, symptoms, activity, diet } = req.body

  const { rows } = await pool.query(
    `INSERT INTO diary_entries (user_id, date, emoji, mood_label, text, symptoms, activity, diet)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id, date)
     DO UPDATE SET
       emoji      = EXCLUDED.emoji,
       mood_label = EXCLUDED.mood_label,
       text       = EXCLUDED.text,
       symptoms   = EXCLUDED.symptoms,
       activity   = EXCLUDED.activity,
       diet       = EXCLUDED.diet
     RETURNING *`,
    [userId, date, emoji, moodLabel, text ?? '', symptoms ?? [], activity ?? '', diet ?? '']
  )
  res.json(rows[0])
})

export default router
