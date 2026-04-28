import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' })
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'invalid token' })
  }
}
