import { createContext, useContext, useEffect, useState } from 'react'

const AdminAuthContext = createContext(null)

const LS_KEY = 'inkingi_admin_auth_v1'

function safeParse(json) {
  try { return JSON.parse(json) } catch { return null }
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    if (typeof window === 'undefined') return null
    const parsed = safeParse(window.localStorage.getItem(LS_KEY) || 'null')
    return parsed && parsed.isVerified ? parsed : null
  })

  const [admins, setAdmins] = useState([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [notifications, setNotifications] = useState(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(window.localStorage.getItem('inkingi_notifications') || '[]') } catch { return [] }
  })
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('inkingi_dark_mode') === 'true'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!session) { window.localStorage.removeItem(LS_KEY); return }
    window.localStorage.setItem(LS_KEY, JSON.stringify(session))
  }, [session])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('inkingi-auth-change', { detail: { token: session?.token, role: session?.role } }))
  }, [session])

  useEffect(() => {
    window.localStorage.setItem('inkingi_notifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    if (darkMode) { document.documentElement.classList.add('dark') } else { document.documentElement.classList.remove('dark') }
    window.localStorage.setItem('inkingi_dark_mode', String(darkMode))
  }, [darkMode])

  const base = 'http://localhost:4000'
  const token = session?.token

  const apiFetch = async (path, options = {}) => {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
    if (res.status === 401) throw new Error('Unauthorized')
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Request failed')
    }
    return res.json()
  }

  const isAdmin = !!session?.isVerified
  const role = session?.role || 'admin'
  const usesLeft = typeof session?.usesLeft === 'number' ? session.usesLeft : 0
  const usesMax = typeof session?.usesMax === 'number' ? session.usesMax : 5

  const fetchAdmins = async () => {
    if (!session || session.role !== 'owner') return
    setAdminsLoading(true)
    try {
      const data = await apiFetch('/api/admins')
      setAdmins(Array.isArray(data) ? data : [])
    } catch (e) { console.error('Failed to fetch admins', e) }
    finally { setAdminsLoading(false) }
  }

  const logout = () => { setSession(null); setAdmins([]) }

  const loginVerified = ({ email, role, token }) => {
    setSession({ isVerified: true, email, role: role || 'admin', token, usesLeft: role === 'owner' ? 999 : 5, usesMax: role === 'owner' ? 999 : 5 })
  }

  const addNotification = (notification) => {
    setNotifications((prev) => [{ ...notification, id: Date.now(), read: false }, ...prev].slice(0, 20))
  }

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const addAdmin = async (email, password) => {
    if (!session || session.role !== 'owner') throw new Error('Forbidden')
    await apiFetch('/api/admins', { method: 'POST', body: JSON.stringify({ email, password }) })
    await fetchAdmins()
    addNotification({ title: 'New Admin', message: `Admin ${email} created`, type: 'success' })
  }

  const toggleAdminActive = async (id, isActive) => {
    if (!session || session.role !== 'owner') throw new Error('Forbidden')
    await apiFetch(`/api/admins/${id}`, { method: 'PATCH', body: JSON.stringify({ is_active: isActive }) })
    await fetchAdmins()
  }

  const changeAdminRole = async (id, newRole) => {
    if (!session || session.role !== 'owner') throw new Error('Forbidden')
    await apiFetch(`/api/admins/${id}`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) })
    await fetchAdmins()
  }

  const deleteAdmin = async (id) => {
    if (!session || session.role !== 'owner') throw new Error('Forbidden')
    await apiFetch(`/api/admins/${id}`, { method: 'DELETE' })
    await fetchAdmins()
    addNotification({ title: 'Admin Deleted', message: 'An admin account was deleted', type: 'warning' })
  }

  const value = {
    isAdmin, role, usesLeft, usesMax, admins, adminsLoading, token,
    notifications, unreadCount, darkMode, setDarkMode, addNotification, markNotificationRead, markAllNotificationsRead,
    consumeUse: () => {
      if (!session) return { ok: false, reason: 'not-verified' }
      if (session.role === 'owner') return { ok: true, remainingUses: 999, maxUses: 999 }
      setSession((prev) => { if (!prev) return prev; const nextLeft = Math.max(0, prev.usesLeft - 1); return { ...prev, usesLeft: nextLeft } })
      return { ok: true }
    },
    loginVerified, logout, fetchAdmins, addAdmin, toggleAdminActive, changeAdminRole, deleteAdmin,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
