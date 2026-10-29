import { useState, useRef, useEffect } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { Bell, Check, X } from 'lucide-react'

export default function NotificationBell() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, logout } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const typeColors = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-[#D72638] transition-colors rounded-lg hover:bg-gray-100"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#D72638] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllNotificationsRead} className="text-xs text-[#D72638] hover:text-red-700 flex items-center gap-1">
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 ${!n.read ? 'bg-blue-50' : ''} ${typeColors[n.type] || typeColors.info}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="text-xs opacity-80">{n.message}</p>
                    </div>
                    {!n.read && (
                      <button onClick={() => markNotificationRead(n.id)} className="text-[10px] font-bold uppercase">
                        New
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] opacity-60 mt-1">{new Date(n.id).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-gray-100">
            <button onClick={logout} className="w-full text-xs text-center text-gray-500 hover:text-red-600 py-1">
              Logout & Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
