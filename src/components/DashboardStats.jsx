import { useEffect, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { Newspaper, Star, TrendingUp, Users, UserPlus, Shield, MessageSquare, Tag, BarChart3, Clock, Activity, Globe, Zap } from 'lucide-react'

export default function DashboardStats() {
  const { token, role } = useAdminAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchStats()
  }, [token])

  if (loading || !stats) return null

  const cards = [
    { icon: Newspaper, title: 'Total Articles', value: stats.totalArticles, accent: 'from-[#D72638] to-red-600', bgIcon: 'bg-red-50', iconColor: 'text-[#D72638]' },
    { icon: Star, title: 'Featured', value: stats.featuredCount, accent: 'from-blue-500 to-indigo-600', bgIcon: 'bg-blue-50', iconColor: 'text-blue-500' },
    { icon: TrendingUp, title: 'Today', value: stats.todayArticles, accent: 'from-emerald-500 to-teal-600', bgIcon: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { icon: Users, title: 'Total Admins', value: stats.totalAdmins, accent: 'from-purple-500 to-violet-600', bgIcon: 'bg-purple-50', iconColor: 'text-purple-500' },
    { icon: Shield, title: 'Active Admins', value: stats.activeAdmins, accent: 'from-green-500 to-teal-600', bgIcon: 'bg-green-50', iconColor: 'text-green-500' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`px-4 py-3 bg-gradient-to-r ${card.accent} text-white`} />
            <div className="-mt-10 px-4 pb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-extrabold text-gray-900">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${card.bgIcon} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}

      {/* Category breakdown mini cards */}
      <div className="sm:col-span-2 lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#D72638]" /> Category Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(stats.categoryBreakdown || []).map((cat) => {
            const total = stats.totalArticles || 1
            const pct = Math.round((cat.cnt / total) * 100)
            return (
              <div key={cat.category} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">{cat.category}</p>
                <p className="text-lg font-extrabold text-gray-900">{cat.cnt}</p>
                <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#D72638] to-red-400" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{pct}%</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}