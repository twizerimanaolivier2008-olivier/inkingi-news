import { useEffect, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { format } from 'date-fns'
import { Trash2, Check, X, User, Mail, MessageSquare, Eye, EyeOff } from 'lucide-react'

export default function CommentsTab({ articles }) {
  const { token } = useAdminAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const fetchComments = async () => {
    if (!token) return
    setLoading(true)
    try {
      let url = 'http://localhost:4000/api/comments?limit=100'
      if (filter === 'pending') url += '&approved=false'
      if (filter === 'approved') url += '&approved=true'
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchComments() }, [filter, token])

  const handleApprove = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/comments/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      fetchComments()
    } catch { /* ignore */ }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchComments()
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#D72638]" />
          Comments Management
        </h2>
        <div className="flex gap-2">
          {['all', 'pending', 'approved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                filter === f ? 'bg-[#D72638] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Approved'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Article</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : comments.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">No comments found.</td></tr>
              ) : (
                comments.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate">{c.article_title || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{c.author_name}</span>
                      </div>
                      {c.author_email && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-500">{c.author_email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-600 line-clamp-2">{c.content}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.is_approved ? <><Check className="w-3 h-3" /> Approved</> : <><EyeOff className="w-3 h-3" /> Pending</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(c.created_at), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {!c.is_approved && (
                          <button onClick={() => handleApprove(c.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => { if (window.confirm('Delete this comment?')) handleDelete(c.id) }} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
