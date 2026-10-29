import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export function signToken({ adminId, email, role }) {
  return jwt.sign(
    { sub: adminId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  )
}

export function verifyToken(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing token' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = { id: payload.sub, email: payload.email, role: payload.role }
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

