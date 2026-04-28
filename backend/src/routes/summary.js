import { Router } from 'express'

const router = Router()

const MOODS = [
  { label: 'отлично', score: 5 },
  { label: 'хорошо', score: 4 },
  { label: 'нейтрально', score: 3 },
  { label: 'плохо', score: 2 },
  { label: 'ужасно', score: 1 },
]
const ALERT_SYMPTOMS = ['головная боль', 'отёки', 'тревога', 'нарушение сна']

router.post('/', async (req, res) => {
  const { entries, week } = req.body

  if (!entries || entries.length === 0) {
    return res.json({
      summary: 'За эту неделю записей нет. Начните вести дневник — даже короткие заметки помогут отслеживать самочувствие. 🌸',
    })
  }

  const scores = entries.map(e => MOODS.find(m => m.label === e.moodLabel)?.score ?? 3)
  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)

  const symCounts = {}
  entries.flatMap(e => e.symptoms).forEach(s => { symCounts[s] = (symCounts[s] || 0) + 1 })
  const topSym = Object.entries(symCounts).sort((a, b) => b[1] - a[1])
  const alertFound = topSym.filter(([s]) => ALERT_SYMPTOMS.includes(s))

  const actDays = entries.filter(e => e.activity?.trim()).length
  const goodDays = entries.filter(e => ['отлично', 'хорошо'].includes(e.moodLabel)).length

  let t = `Проанализировала ${entries.length} записей на ${week} неделе беременности.\n\n`
  t += `📊 Средний балл: ${avg}/5 — ${goodDays} из ${entries.length} дней с хорошим настроением.\n\n`

  if (topSym.length > 0) {
    t += `🔍 Частые симптомы:\n`
    topSym.slice(0, 3).forEach(([s, c]) => { t += `— ${s}: ${c} раз${c > 1 ? 'а' : ''}\n` })
    t += '\n'
  }

  t += actDays > 0
    ? `🚶 Физическая активность: ${actDays} из ${entries.length} дней — отлично!\n\n`
    : `🚶 Физическая активность не зафиксирована. Лёгкие прогулки по 20–30 мин очень полезны.\n\n`

  t += `💡 Рекомендации:\n`
  if (alertFound.length > 0) t += `— ⚠️ ${alertFound.map(([s]) => s).join(', ')} — обсудите с врачом\n`
  t += `— Поддерживайте сон 8–9 часов\n— Пейте 1.5–2 л воды в день\n`
  t += `\n⚕️ Анализ носит информационный характер и не заменяет консультацию врача.`

  res.json({ summary: t })
})

export default router
