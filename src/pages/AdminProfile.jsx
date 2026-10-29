import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { User, Shield, ArrowLeft, Check, X } from 'lucide-react'

export default function AdminProfile() {
  const { session, loginVerified } = useAdminAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: session?.email || '', currentPassword: '', newPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('profile')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (tab === 'password' && !form.currentPassword) {
      setError('Current password is required.')
      return
    }
    if (tab === 'password' && form.newPassword && form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          email: tab === 'profile' ? form.email : undefined,
          currentPassword: tab === 'password' ? form.currentPassword : undefined,
          newPassword: tab === 'password' ? form.newPassword : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')

      if (tab === 'profile' && data.ok) {
        loginVerified({ email: form.email, role: session?.role, token: session?.token })
      }
      setSuccess('Profile updated successfully.')
      if (tab === 'password') {
        setForm({ email: form.email, currentPassword: '', newPassword: '' })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7]">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#D72638] tracking-tight">INKINGI</h1>
            <p className="text-xs text-gray-500">Admin Profile & Settings</p>
          </div>
          <Link to="/admin/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#D72638] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setTab('profile')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${tab === 'profile' ? 'border-b-2 border-[#D72638] text-[#D72638]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User className="w-4 h-4 inline mr-2" /> Profile
            </button>
            <button
              onClick={() => setTab('password')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${tab === 'password' ? 'border-b-2 border-[#D72638] text-[#D72638]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Shield className="w-4 h-4 inline mr-2" /> Password
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded">{success}</div>}

            {tab === 'profile' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
                  placeholder="your@email.com"
                />
                <p className="mt-1 text-xs text-gray-500">Your role: <span className="font-semibold text-[#D72638]">{session?.role === 'owner' ? 'Owner' : 'Admin'}</span></p>
              </div>
            )}

            {tab === 'password' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
                    placeholder="At least 6 characters"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#D72638] text-white rounded-md text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete Account</p>
              <p className="text-xs text-gray-500">This action cannot be undone.</p>
            </div>
            <button onClick={() => { if (window.confirm('Are you sure? This will delete your account permanently.')) navigate('/admin') }} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
