import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// POST /api/entries — создать или обновить запись за дату (upsert)
router.post('/', requireAuth, async (req, res) => {
  const { date, emoji, moodLabel, text, symptoms, activity, diet } = req.body
  const userId = req.userId

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
