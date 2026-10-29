import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'

import { pool } from './db.js'
import { generateOtp6, hashOtp } from './otp.js'
import { signToken, verifyToken } from './auth.js'

dotenv.config()

const app = express()
app.use(express.json())

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
)

app.get('/health', (_req, res) => res.json({ ok: true }))

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.OTP_MAX_PER_HOUR || 10),
})

async function getAdminByEmail(email) {
  const [rows] = await pool.query('SELECT id, email, role, is_active, password_hash FROM admins WHERE email = ? LIMIT 1', [email])
  return rows[0] || null
}

async function getAdminById(id) {
  const [rows] = await pool.query('SELECT id, email, role, is_active FROM admins WHERE id = ? LIMIT 1', [id])
  return rows[0] || null
}

async function logActivity(adminId, action, details = '') {
  try {
    await pool.query('INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)', [adminId, action, details])
  } catch { /* ignore */ }
}

app.post('/api/auth/otp/request', otpLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const admin = await getAdminByEmail(email)
    if (!admin || !admin.is_active) return res.status(401).json({ error: 'Invalid credentials' })

    const match = bcrypt.compareSync(password, admin.password_hash)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const otpCode = generateOtp6()
    const otpHash = hashOtp(otpCode)
    const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRES_IN_SECONDS || 300) * 1000)

    await pool.query(
      'INSERT INTO otp_codes (admin_id, otp_hash, expires_at) VALUES (?, ?, ?)',
      [admin.id, otpHash, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
    )

    return res.json({ ok: true, message: 'OTP generated', otp: otpCode })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/auth/otp/verify', async (req, res) => {
  try {
    const { email, otp } = req.body || {}
    if (!email || !otp) return res.status(400).json({ error: 'Email and otp required' })

    const otpHash = hashOtp(otp)

    const [rows] = await pool.query(
      `SELECT a.id AS admin_id, a.email, a.role
       FROM admins a
       JOIN otp_codes o ON o.admin_id = a.id
       WHERE a.email = ?
         AND o.otp_hash = ?
         AND o.expires_at > NOW()
         AND o.used_at IS NULL
       ORDER BY o.created_at DESC
       LIMIT 1`,
      [email, otpHash]
    )

    const match = rows[0]
    if (!match) return res.status(401).json({ error: 'Invalid or expired OTP' })

    await pool.query(
      'UPDATE otp_codes SET used_at = NOW() WHERE admin_id = ? AND otp_hash = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [match.admin_id, otpHash]
    )

    await logActivity(match.admin_id, 'login', `Admin logged in from ${req.ip}`)

    const token = signToken({ adminId: match.admin_id, email: match.email, role: match.role })
    return res.json({ token, role: match.role })
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/admin/me', verifyToken, async (req, res) => {
  try {
    const admin = await getAdminById(req.admin.id)
    if (!admin) return res.status(404).json({ error: 'Admin not found' })
    return res.json({ id: admin.id, email: admin.email, role: admin.role, is_active: admin.is_active })
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/admins', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })

    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const [exists] = await pool.query('SELECT id FROM admins WHERE email = ? LIMIT 1', [email])
    if (exists.length) return res.status(409).json({ error: 'Admin already exists' })

    const password_hash = bcrypt.hashSync(password, 10)
    await pool.query('INSERT INTO admins (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)', [email, password_hash, 'admin', 1])
    await logActivity(req.admin.id, 'create_admin', `Created admin: ${email}`)

    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/admins', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })

    const [rows] = await pool.query('SELECT id, email, role, is_active, created_at FROM admins ORDER BY created_at DESC')
    return res.json(rows)
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/admins/:id', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })

    const targetId = Number(req.params.id)
    if (targetId === actor.id) return res.status(400).json({ error: 'Cannot modify yourself' })

    const target = await getAdminById(targetId)
    if (!target) return res.status(404).json({ error: 'Admin not found' })

    const { is_active, role } = req.body || {}
    const updates = []
    const values = []

    if (typeof is_active === 'boolean') {
      updates.push('is_active = ?')
      values.push(is_active ? 1 : 0)
    }
    if (role && ['owner', 'admin'].includes(role)) {
      updates.push('role = ?')
      values.push(role)
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' })

    values.push(targetId)
    await pool.query(`UPDATE admins SET ${updates.join(', ')} WHERE id = ?`, values)

    const updated = await getAdminById(targetId)
    return res.json(updated)
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/admins/:id', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })

    const targetId = Number(req.params.id)
    if (targetId === actor.id) return res.status(400).json({ error: 'Cannot delete yourself' })

    const target = await getAdminById(targetId)
    if (!target) return res.status(404).json({ error: 'Admin not found' })

    await pool.query('DELETE FROM admins WHERE id = ?', [targetId])
    return res.json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
})

// Article endpoints
app.get('/api/articles', verifyToken, async (req, res) => {
  try {
    const { search, category, featured, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    let where = []
    const params = []

    if (search) {
      where.push('(title LIKE ? OR content LIKE ? OR author LIKE ?)')
      const like = `%${search}%`
      params.push(like, like, like)
    }
    if (category) {
      where.push('category = ?')
      params.push(category)
    }
    if (featured === 'true') {
      where.push('featured = 1')
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT * FROM articles ${whereSql} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    )

    const [count] = await pool.query(
      `SELECT COUNT(*) AS total FROM articles ${whereSql}`,
      params
    )

    return res.json({ articles: rows, total: count[0].total, page: Number(page), limit: Number(limit) })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/articles/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ? LIMIT 1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Article not found' })
    return res.json(rows[0])
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/articles', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })

    const { title, content, image, category, author, excerpt, featured } = req.body || {}
    if (!title || !content || !author) {
      return res.status(400).json({ error: 'Title, content, and author are required' })
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const result = await pool.query(
      'INSERT INTO articles (title, slug, excerpt, content, image, category, author, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, excerpt || '', content, image || '', category || 'tech', author, featured ? 1 : 0]
    )

    const [newArticle] = await pool.query('SELECT * FROM articles WHERE id = ? LIMIT 1', [result.insertId])
    await logActivity(req.admin.id, 'create_article', `Created article: ${title}`)
    return res.status(201).json(newArticle)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.put('/api/articles/:id', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })

    const { title, content, image, category, author, excerpt, featured } = req.body || {}

    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined

    const updates = []
    const values = []

    if (title !== undefined) { updates.push('title = ?'); values.push(title) }
    if (slug !== undefined) { updates.push('slug = ?'); values.push(slug) }
    if (excerpt !== undefined) { updates.push('excerpt = ?'); values.push(excerpt) }
    if (content !== undefined) { updates.push('content = ?'); values.push(content) }
    if (image !== undefined) { updates.push('image = ?'); values.push(image) }
    if (category !== undefined) { updates.push('category = ?'); values.push(category) }
    if (author !== undefined) { updates.push('author = ?'); values.push(author) }
    if (featured !== undefined) { updates.push('featured = ?'); values.push(featured ? 1 : 0) }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' })

    values.push(req.params.id)
    await pool.query(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`, values)

    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ? LIMIT 1', [req.params.id])
    await logActivity(req.admin.id, 'update_article', `Updated article ID ${req.params.id}`)
    return res.json(rows[0])
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/articles/:id', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })

    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ? LIMIT 1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Article not found' })

    await pool.query('DELETE FROM articles WHERE id = ?', [req.params.id])
    await logActivity(req.admin.id, 'delete_article', `Deleted article ID ${req.params.id}`)
    return res.json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/articles/:id/featured', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })

    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ? LIMIT 1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Article not found' })

    const newFeatured = rows[0].featured === 1 ? 0 : 1
    await pool.query('UPDATE articles SET featured = ? WHERE id = ?', [newFeatured, req.params.id])

    const [updated] = await pool.query('SELECT * FROM articles WHERE id = ? LIMIT 1', [req.params.id])
    await logActivity(req.admin.id, 'toggle_featured', `Toggled featured for article ID ${req.params.id}`)
    return res.json(updated)
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/admin/actions/consume', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'No limits configured' })
    if (actor.role === 'owner') {
      return res.json({ remainingUses: 999, maxUses: 999 })
    }

    const adminId = req.admin.id
    const [rows] = await pool.query(
      'SELECT remaining_uses, max_uses FROM admin_limits WHERE admin_id = ? LIMIT 1',
      [adminId]
    )
    const limit = rows[0]
    if (!limit) return res.status(403).json({ error: 'No limits configured' })

    if (limit.remaining_uses <= 0) {
      return res.status(403).json({ error: 'No uses left' })
    }

    await pool.query(
      'UPDATE admin_limits SET remaining_uses = remaining_uses - 1 WHERE admin_id = ?',
      [adminId]
    )

    const [after] = await pool.query(
      'SELECT remaining_uses, max_uses FROM admin_limits WHERE admin_id = ? LIMIT 1',
      [adminId]
    )

    return res.json({ remainingUses: after[0].remaining_uses, maxUses: after[0].max_uses })
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
})

// Stats endpoint for dashboard
app.get('/api/stats', verifyToken, async (req, res) => {
  try {
    const [articleCount] = await pool.query('SELECT COUNT(*) AS total FROM articles')
    const [featuredCount] = await pool.query('SELECT COUNT(*) AS total FROM articles WHERE featured = 1')
    const [todayCount] = await pool.query('SELECT COUNT(*) AS total FROM articles WHERE DATE(date) = CURDATE()')
    const [adminCount] = await pool.query('SELECT COUNT(*) AS total FROM admins')
    const [activeAdmins] = await pool.query('SELECT COUNT(*) AS total FROM admins WHERE is_active = 1')
    const [topCategory] = await pool.query('SELECT category, COUNT(*) AS cnt FROM articles GROUP BY category ORDER BY cnt DESC LIMIT 1')
    const [recentArticles] = await pool.query('SELECT * FROM articles ORDER BY date DESC LIMIT 5')
    const [categories] = await pool.query('SELECT category, COUNT(*) AS cnt FROM articles GROUP BY category')

    return res.json({
      totalArticles: articleCount[0].total,
      featuredCount: featuredCount[0].total,
      todayArticles: todayCount[0].total,
      totalAdmins: adminCount[0].total,
      activeAdmins: activeAdmins[0].total,
      topCategory: topCategory[0] || null,
      categoryBreakdown: categories[0],
      recentArticles: recentArticles,
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/activity-logs', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit
    const [rows] = await pool.query(
      `SELECT al.*, a.email AS admin_email FROM activity_logs al LEFT JOIN admins a ON a.id = al.admin_id ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    )
    const [count] = await pool.query('SELECT COUNT(*) AS total FROM activity_logs')
    return res.json({ logs: rows, total: count[0].total, page: Number(page), limit: Number(limit) })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/admin/profile', verifyToken, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {}
    const adminId = req.admin.id
    const [rows] = await pool.query('SELECT password_hash FROM admins WHERE id = ? LIMIT 1', [adminId])
    if (!rows[0]) return res.status(404).json({ error: 'Admin not found' })
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password required' })
      if (!bcrypt.compareSync(currentPassword, rows[0].password_hash)) return res.status(401).json({ error: 'Current password incorrect' })
      const newHash = bcrypt.hashSync(newPassword, 10)
      await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, adminId])
    }
    if (email && email !== req.admin.email) {
      const [exists] = await pool.query('SELECT id FROM admins WHERE email = ? LIMIT 1', [email])
      if (exists.length) return res.status(409).json({ error: 'Email already taken' })
      await pool.query('UPDATE admins SET email = ? WHERE id = ?', [email, adminId])
    }
    await logActivity(adminId, 'update_profile', 'Updated profile')
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/admin/export/articles', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })
    const { search, category, featured } = req.query
    let where = []
    const params = []
    if (search) { where.push('(title LIKE ? OR author LIKE ?)'); params.push(`%${search}%`, `%${search}%`) }
    if (category) { where.push('category = ?'); params.push(category) }
    if (featured === 'true') { where.push('featured = 1') }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const [rows] = await pool.query(`SELECT * FROM articles ${whereSql} ORDER BY date DESC`, params)
    const headers = ['id', 'title', 'slug', 'excerpt', 'content', 'image', 'category', 'author', 'date', 'featured']
    const csv = [headers.join(',')]
    for (const row of rows) {
      csv.push([row.id, `"${(row.title || '').replace(/"/g, '""')}"`, `"${(row.slug || '').replace(/"/g, '""')}"`, `"${(row.excerpt || '').replace(/"/g, '""')}"`, `"${(row.content || '').replace(/"/g, '""')}"`, `"${(row.image || '').replace(/"/g, '""')}"`, row.category, `"${(row.author || '').replace(/"/g, '""')}"`, row.date, row.featured].join(','))
    }
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="articles-export.csv"')
    res.send(csv.join('\n'))
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Newsletter endpoints
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body || {}
    if (!email) return res.status(400).json({ error: 'Email required' })
    const [exists] = await pool.query('SELECT id FROM newsletter_subscribers WHERE email = ? AND is_active = 1 LIMIT 1', [email])
    if (exists.length) return res.status(409).json({ error: 'Already subscribed' })
    await pool.query('INSERT INTO newsletter_subscribers (email, name) VALUES (?, ?)', [email, name || null])
    await logActivity(1, 'newsletter_subscribe', `New subscriber: ${email}`)
    return res.status(201).json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/newsletter/subscribers', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit
    const [rows] = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC LIMIT ? OFFSET ?', [Number(limit), offset])
    const [count] = await pool.query('SELECT COUNT(*) AS total FROM newsletter_subscribers')
    return res.json({ subscribers: rows, total: count[0].total, page: Number(page), limit: Number(limit) })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/newsletter/subscribers/:id', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })
    const { is_active } = req.body || {}
    await pool.query('UPDATE newsletter_subscribers SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id])
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/newsletter/subscribers/:id', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })
    await pool.query('DELETE FROM newsletter_subscribers WHERE id = ?', [req.params.id])
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Comments endpoints
app.get('/api/comments', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })
    const { articleId, approved } = req.query
    let where = []
    const params = []
    if (articleId) { where.push('article_id = ?'); params.push(Number(articleId)) }
    if (approved !== undefined) { where.push('is_approved = ?'); params.push(approved === 'true' ? 1 : 0) }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const [rows] = await pool.query(`SELECT c.*, a.title AS article_title FROM comments c LEFT JOIN articles a ON a.id = c.article_id ${whereSql} ORDER BY c.created_at DESC`, params)
    const [count] = await pool.query(`SELECT COUNT(*) AS total FROM comments ${whereSql}`, params)
    return res.json({ comments: rows, total: count[0].total })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/comments/:id/approve', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })
    await pool.query('UPDATE comments SET is_approved = 1 WHERE id = ?', [req.params.id])
    await logActivity(actor.id, 'approve_comment', `Approved comment ID ${req.params.id}`)
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ? LIMIT 1', [req.params.id])
    return res.json(rows[0])
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/comments/:id', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })
    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id])
    await logActivity(actor.id, 'delete_comment', `Deleted comment ID ${req.params.id}`)
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Tags endpoints
app.get('/api/tags', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })
    const [rows] = await pool.query('SELECT * FROM article_tags ORDER BY name ASC')
    return res.json(rows)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/tags', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })
    const { name } = req.body || {}
    if (!name) return res.status(400).json({ error: 'Tag name required' })
    await pool.query('INSERT IGNORE INTO article_tags (name) VALUES (?)', [name.trim().toLowerCase()])
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/tags/:id', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor || actor.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })
    await pool.query('DELETE FROM article_tag_map WHERE tag_id = ?', [req.params.id])
    await pool.query('DELETE FROM article_tags WHERE id = ?', [req.params.id])
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/articles/:id/tags', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })
    const { tagIds } = req.body || {}
    if (!Array.isArray(tagIds)) return res.status(400).json({ error: 'tagIds array required' })
    await pool.query('DELETE FROM article_tag_map WHERE article_id = ?', [req.params.id])
    for (const tagId of tagIds) {
      await pool.query('INSERT IGNORE INTO article_tag_map (article_id, tag_id) VALUES (?, ?)', [Number(req.params.id), Number(tagId)])
    }
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Share stats endpoints
app.get('/api/stats/share', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })
    const { articleId } = req.query
    let where = []
    const params = []
    if (articleId) { where.push('article_id = ?'); params.push(Number(articleId)) }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const [rows] = await pool.query(`SELECT * FROM share_stats ${whereSql} ORDER BY share_count DESC`, params)
    return res.json(rows)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/stats/share', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })
    const { articleId, platform } = req.body || {}
    if (!articleId || !platform) return res.status(400).json({ error: 'articleId and platform required' })
    const [rows] = await pool.query('SELECT * FROM share_stats WHERE article_id = ? AND platform = ? LIMIT 1', [Number(articleId), platform])
    if (rows[0]) {
      await pool.query('UPDATE share_stats SET share_count = share_count + 1 WHERE article_id = ? AND platform = ?', [Number(articleId), platform])
    } else {
      await pool.query('INSERT INTO share_stats (article_id, platform, share_count) VALUES (?, ?, 1)', [Number(articleId), platform])
    }
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Weather widget endpoint (demo data)
app.get('/api/weather', verifyToken, async (req, res) => {
  try {
    const actor = await getAdminById(req.admin.id)
    if (!actor) return res.status(403).json({ error: 'Forbidden' })
    const cities = [
      { city: 'Kigali', temp: 22, condition: 'Partly Cloudy', humidity: 65, icon: 'cloud' },
      { city: 'London', temp: 15, condition: 'Rainy', humidity: 80, icon: 'rain' },
      { city: 'New York', temp: 18, condition: 'Sunny', humidity: 50, icon: 'sun' },
      { city: 'Paris', temp: 16, condition: 'Cloudy', humidity: 70, icon: 'cloud' },
      { city: 'Dubai', temp: 35, condition: 'Sunny', humidity: 40, icon: 'sun' },
    ]
    return res.json(cities)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
