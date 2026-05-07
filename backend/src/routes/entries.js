import { Router } from 'express'
import { z } from 'zod'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const MOOD_LABELS = ['отлично', 'хорошо', 'нейтрально', 'плохо', 'ужасно']
const SYMPTOM_KEYS = ['тошнота', 'усталость', 'головная боль', 'отёки', 'изжога', 'боль в спине', 'нарушение сна', 'тревога']

const entrySchema = z.object({
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  emoji:     z.string().max(8),
  moodLabel: z.enum(MOOD_LABELS),
  text:      z.string().max(2000).optional().default(''),
  symptoms:  z.array(z.enum(SYMPTOM_KEYS)).max(SYMPTOM_KEYS.length).optional().default([]),
  activity:  z.string().max(500).optional().default(''),
  diet:      z.string().max(500).optional().default(''),
})

// POST /api/entries — создать или обновить запись за дату (upsert)
router.post('/', requireAuth, validate(entrySchema), async (req, res) => {
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
