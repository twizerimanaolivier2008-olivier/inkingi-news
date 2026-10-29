import { useEffect, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { Tag, Plus, Trash2, X } from 'lucide-react'

export default function TagsTab({ articles }) {
  const { token } = useAdminAuth()
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchTags = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/tags', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTags() }, [token])

  const handleAddTag = async (e) => {
    e.preventDefault()
    if (!newTag.trim()) return
    try {
      await fetch('http://localhost:4000/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTag.trim() }),
      })
      setNewTag('')
      setError('')
      fetchTags()
    } catch (err) { setError(err.message) }
  }

  const handleDeleteTag = async (tagId) => {
    try {
      await fetch(`http://localhost:4000/api/tags/${tagId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchTags()
    } catch { /* ignore */ }
  }

  const tagUsage = (tagId) => articles.filter((a) => a.tags && a.tags.includes(tagId)).length

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#D72638]" />
          Manage Tags
        </h2>
        <form onSubmit={handleAddTag} className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag name..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
          />
          <button type="submit" className="px-4 py-2.5 bg-[#D72638] text-white rounded-md text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900">All Tags ({tags.length})</h2>
        </div>
        {loading ? (
          <div className="px-6 py-6 text-center text-sm text-gray-500">Loading...</div>
        ) : tags.length === 0 ? (
          <div className="px-6 py-6 text-center text-sm text-gray-500">No tags yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tags.map((tag) => (
              <div key={tag.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-[#D72638]" />
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{tag.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{tagUsage(tag.id)} articles</span>
                  </div>
                </div>
                <button onClick={() => { if (window.confirm(`Delete tag "${tag.name}"?`)) handleDeleteTag(tag.id) }} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
