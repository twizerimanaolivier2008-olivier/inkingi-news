import { useState } from 'react'
import { useArticles } from '../context/ArticleContext'
import { ArrowLeft, Plus, PenSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'

const categories = ['Politics', 'Sports', 'Tech', 'Business', 'Entertainment']

export default function ArticleForm({ article, onCancel, onSaved }) {
  const { addArticle, updateArticle } = useArticles()
  const navigate = useNavigate()
  const isEditing = !!article

  const [form, setForm] = useState({
    title: article?.title || '',
    content: article?.content || '',
    image: article?.image || 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&q=80',
    category: article?.category || 'Politics',
    author: article?.author || '',
    excerpt: article?.excerpt || '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.content.trim()) errs.content = 'Content is required'
    if (!form.author.trim()) errs.author = 'Author is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)

    const payload = {
      ...form,
      category: form.category.toLowerCase(),
      date: article?.date || new Date().toISOString(),
      featured: article?.featured || false,
    }

    if (isEditing) {
      updateArticle(article.id, payload)
    } else {
      addArticle(payload)
    }
    setSubmitting(false)
    onSaved?.()
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7]">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#D72638] tracking-tight">INKINGI</h1>
            <p className="text-xs text-gray-500">CMS — {isEditing ? 'Edit Article' : 'New Article'}</p>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#D72638] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={cn(
                'w-full px-4 py-2.5 border rounded-md focus:outline-none focus:border-[#D72638] text-sm',
                errors.title ? 'border-red-500' : 'border-gray-200'
              )}
              placeholder="Enter article title"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <input
              type="text"
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
              placeholder="Short summary for cards"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              className={cn(
                'w-full px-4 py-2.5 border rounded-md focus:outline-none focus:border-[#D72638] text-sm',
                errors.content ? 'border-red-500' : 'border-gray-200'
              )}
              placeholder="Write article content here..."
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
              placeholder="https://..."
            />
            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="mt-3 w-full h-40 object-cover rounded-md border border-gray-200"
                onError={(e) => (e.target.style.display = 'none')}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                className={cn(
                  'w-full px-4 py-2.5 border rounded-md focus:outline-none focus:border-[#D72638] text-sm',
                  errors.author ? 'border-red-500' : 'border-gray-200'
                )}
                placeholder="Author name"
              />
              {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#D72638] text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? <PenSquare className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {submitting ? 'Saving...' : isEditing ? 'Update Article' : 'Publish Article'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
