import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ArticleForm from './ArticleForm'
import CommentsTab from '../components/CommentsTab'
import TagsTab from '../components/TagsTab'
import WeatherWidget from '../components/WeatherWidget'
import NotificationBell from '../components/NotificationBell'
import { useArticles } from '../context/ArticleContext'
import { format } from 'date-fns'
import {
  PenSquare, Trash2, LogOut, Search as SearchIcon, Sparkles, Newspaper, Star,
  Trash, Users, UserPlus, Shield, ShieldOff, Zap, EyeOff, Clock, TrendingUp, BarChart3, User,
  MessageSquare, Tag, Eye, ChevronDown, Moon, Sun, Bell
} from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminDashboard() {
  const { articles, deleteArticle, loading, toggleFeatured } = useArticles()
  const navigate = useNavigate()
  const { isAdmin, role, usesLeft, consumeUse, logout, admins, adminsLoading, fetchAdmins, addAdmin, toggleAdminActive, changeAdminRole, deleteAdmin, notifications, unreadCount, darkMode, setDarkMode } = useAdminAuth()
  const [tab, setTab] = useState('articles')
  const [adminTab, setAdminTab] = useState('overview')

  useEffect(() => {
    if (!isAdmin) navigate('/admin')
  }, [isAdmin, navigate])

  useEffect(() => {
    if (isAdmin && usesLeft <= 0 && role !== 'owner') {
      logout(); navigate('/admin')
    }
  }, [isAdmin, usesLeft, logout, navigate, role])

  useEffect(() => {
    if (isAdmin && role === 'owner') fetchAdmins()
  }, [isAdmin, role, fetchAdmins])

  const total = articles.length
  const featuredCount = articles.filter((a) => a.featured).length
  const todayArticles = articles.filter((a) => {
    const d = new Date(a.date); const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

  const categories = ['politics', 'sports', 'tech', 'business', 'entertainment']
  const categoryCounts = useMemo(() => categories.map((c) => ({
    key: c,
    count: articles.filter((a) => a.category === c).length,
    percent: total > 0 ? Math.round((articles.filter((a) => a.category === c).length / total) * 100) : 0,
  })), [articles, total, categories])

  const latestArticles = useMemo(() => [...articles].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [articles])

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F3F5F7]'}`}>
      <header className={`border-b shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className={`h-1 ${darkMode ? 'bg-gradient-to-r from-[#D72638] via-red-500 to-orange-400' : 'bg-gradient-to-r from-[#D72638] via-red-500 to-orange-400'}`} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#D72638] tracking-tight">INKINGI</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
            <p className="mt-1 text-[11px] font-semibold text-gray-600">
              Role: <span className="text-[#D72638]">{role === 'owner' ? 'Owner (Full Access)' : 'Admin'}</span>
              {role !== 'owner' && (<> | Uses left: <span className="text-[#D72638]">{usesLeft}</span>/5</>)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/profile" className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-[#D72638] hover:bg-gray-700' : 'text-gray-600 hover:text-[#D72638] hover:bg-gray-50'}`}>
              <User className="w-4 h-4" /> Profile
            </Link>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Toggle dark mode">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <NotificationBell />
            <button onClick={() => { logout(); navigate('/admin') }} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-[#D72638] hover:bg-gray-700' : 'text-gray-700 hover:text-[#D72638] hover:bg-gray-50'}`}>
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'articles' && <ArticlesTab articles={articles} deleteArticle={deleteArticle} loading={loading} categoryCounts={categoryCounts} latestArticles={latestArticles} total={total} featuredCount={featuredCount} todayArticles={todayArticles} role={role} consumeUse={consumeUse} usesLeft={usesLeft} logout={logout} toggleFeatured={toggleFeatured} />}
        {tab === 'admins' && role === 'owner' && <AdminsTab admins={admins} adminsLoading={adminsLoading} onAdd={addAdmin} onToggleActive={toggleAdminActive} onChangeRole={changeAdminRole} onDelete={deleteAdmin} />}
        {tab === 'comments' && <CommentsTab articles={articles} />}
        {tab === 'tags' && <TagsTab articles={articles} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-6 right-6 z-50">
        <div className={`rounded-xl shadow-lg border flex overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <button onClick={() => setTab('articles')} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === 'articles' ? 'bg-[#D72638] text-white' : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Newspaper className="w-4 h-4" /> Articles
          </button>
          <button onClick={() => setTab('admins')} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === 'admins' ? 'bg-[#D72638] text-white' : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Users className="w-4 h-4" /> Admins
          </button>
          {role === 'owner' && (
            <>
              <button onClick={() => setTab('comments')} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === 'comments' ? 'bg-[#D72638] text-white' : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <MessageSquare className="w-4 h-4" /> Comments
              </button>
              <button onClick={() => setTab('tags')} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === 'tags' ? 'bg-[#D72638] text-white' : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <Tag className="w-4 h-4" /> Tags
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Weather widget */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <WeatherWidget />
      </div>
    </div>
  );
}

function ArticlesTab(props) {
  const { articles, deleteArticle, loading, categoryCounts, latestArticles, total, featuredCount, todayArticles, role, consumeUse, usesLeft, logout, toggleFeatured } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const categories = ['politics', 'sports', 'tech', 'business', 'entertainment'];

  const filtered = useMemo(() => {
    return articles
      .filter((a) => (categoryFilter === 'all' ? true : a.category === categoryFilter))
      .filter((a) => (statusFilter === 'all' ? true : a.featured === (statusFilter === 'featured')))
      .filter((a) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q) || (a.excerpt && a.excerpt.toLowerCase().includes(q));
      });
  }, [articles, searchQuery, categoryFilter, statusFilter]);

  const statCards = [
    { icon: Newspaper, title: 'Total Articles', value: total, accent: 'from-[#D72638] to-red-600', bgIcon: 'bg-red-50', iconColor: 'text-[#D72638]' },
    { icon: Star, title: 'Featured', value: featuredCount, accent: 'from-blue-500 to-indigo-600', bgIcon: 'bg-blue-50', iconColor: 'text-blue-500' },
    { icon: TrendingUp, title: 'Today', value: todayArticles, accent: 'from-emerald-500 to-teal-600', bgIcon: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { icon: BarChart3, title: 'Categories', value: categories.length, accent: 'from-amber-500 to-orange-600', bgIcon: 'bg-amber-50', iconColor: 'text-amber-500' },
  ];

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    const result = consumeUse();
    if (!result.ok) return;
    deleteArticle(id);
  };

  if (editingArticle) {
    return <ArticleForm article={editingArticle} onCancel={() => setEditingArticle(null)} onSaved={() => setEditingArticle(null)} />;
  }

  const allSelected = filtered.length > 0 && filtered.every((a) => selectedIds.includes(a.id));

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
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
          );
        })}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Category Distribution</h3>
        <div className="space-y-3">
          {categoryCounts.map((c) => (
            <div key={c.key} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 w-24 capitalize">{c.key}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r from-[#D72638] to-red-400 transition-all duration-500`} style={{ width: `${c.percent}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-8 text-right">{c.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            {showSearch ? (
              <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title, author..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm w-full" />
            ) : (
              <button onClick={() => setShowSearch(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-500 hover:border-[#D72638] hover:text-[#D72638] transition-colors w-full">
                <SearchIcon className="w-4 h-4" /> Search articles...
              </button>
            )}
            {showSearch && searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs font-bold">&times;</button>
            )}
            {!showSearch && <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />}
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:border-[#D72638]">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:border-[#D72638]">
              <option value="all">All Status</option>
              <option value="featured">Featured</option>
              <option value="notFeatured">Not Featured</option>
            </select>
            <button onClick={() => { const result = consumeUse(); if (!result.ok) return; if (usesLeft <= 1 && role !== 'owner') logout(); setEditingArticle({}); }} className="px-4 py-2.5 bg-[#D72638] text-white rounded-md text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Add Article
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of {total} articles
            {searchQuery && <span className="ml-2 text-[#D72638]">| &ldquo;{searchQuery}&rdquo;</span>}
          </div>
          <button onClick={() => {
            if (selectedIds.length === 0) return;
            if (!window.confirm(`Delete ${selectedIds.length} selected article(s)?`)) return;
            const result = consumeUse();
            if (!result.ok) return;
            selectedIds.forEach((id) => deleteArticle(id));
            setSelectedIds([]);
          }} disabled={selectedIds.length === 0 || loading} className="px-3 py-2 border border-red-200 text-red-700 rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 transition-colors flex items-center gap-2">
            <Trash className="w-4 h-4" /> Delete Selected ({selectedIds.length})
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-[#D72638]" /> Recent Articles</h3>
        <div className="space-y-2">
          {latestArticles.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <img src={a.image} alt="" className="w-8 h-8 object-cover rounded" />
                <span className="text-sm font-medium text-gray-900 truncate">{a.title}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase">{a.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleFeatured(a.id)} className="p-1 text-gray-400 hover:text-yellow-500 transition-colors" title="Toggle featured">
                  <Star className={`w-3.5 h-3.5 ${a.featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
              </div>
            </div>
          ))}
          {latestArticles.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No articles yet</p>}
        </div>
      </section>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10">
                  <input type="checkbox" checked={allSelected} onChange={() => {
                    const allIds = filtered.map((a) => a.id);
                    if (allSelected) setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
                    else setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
                  }} className="w-4 h-4 rounded border-gray-300 text-[#D72638] focus:ring-[#D72638]" aria-label="Select all" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500"><div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-[#D72638] mr-2" />Loading...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">No articles found.</td></tr>}
              {!loading && filtered.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input type="checkbox" checked={selectedIds.includes(article.id)} onChange={() => { setSelectedIds((prev) => (prev.includes(article.id) ? prev.filter((x) => x !== article.id) : [...prev, article.id])); }} className="w-4 h-4 rounded border-gray-300 text-[#D72638] focus:ring-[#D72638]" aria-label={`Select ${article.title}`} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap"><img src={article.image} alt={article.title} className="w-16 h-10 object-cover rounded" /></td>
                  <td className="px-4 py-3"><p className="text-sm font-semibold text-gray-900 max-w-xs truncate">{article.title}</p></td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-[#D72638] uppercase">{article.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{article.author}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{format(new Date(article.date), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleFeatured(article.id)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${article.featured ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      <Star className={`w-3 h-3 ${article.featured ? 'fill-yellow-400 text-yellow-400' : ''}`} /> {article.featured ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingArticle(article)} className="p-2 text-gray-600 hover:text-[#D72638] transition-colors" title="Edit"><PenSquare className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(article.id)} className="p-2 text-gray-600 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AdminsTab({ admins, adminsLoading, onAdd, onToggleActive, onChangeRole, onDelete }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return; }
    try {
      await onAdd(email.trim(), password);
      setSuccess('Admin created successfully.');
      setEmail('');
      setPassword('');
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#D72638]" /> Register New Admin
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm" placeholder="Set a strong password" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="px-4 py-2.5 bg-[#D72638] text-white rounded-md text-sm font-semibold hover:bg-red-700 transition-colors">Create Admin</button>
          </div>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-700">{success}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-[#D72638]" /> All Admins</h2>
          <span className="text-xs text-gray-500">{admins.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminsLoading ? (
                <tr><td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">No admins found.</td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{admin.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{admin.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{admin.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(admin.created_at), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onToggleActive(admin.id, !admin.is_active)} className={`p-2 rounded-md transition-colors ${admin.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title={admin.is_active ? 'Deactivate' : 'Activate'}>
                          {admin.is_active ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        {admin.role !== 'owner' && (
                          <button onClick={() => { if (window.confirm('Promote to owner?')) onChangeRole(admin.id, 'owner') }} className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors" title="Make Owner"><Zap className="w-4 h-4" /></button>
                        )}
                        {admin.role === 'owner' && (
                          <button onClick={() => { if (window.confirm('Demote to admin?')) onChangeRole(admin.id, 'admin') }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Demote"><EyeOff className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => { if (window.confirm('Delete permanently?')) onDelete(admin.id) }} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
  );
}
