import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, ArrowRight, Clock, Flame, Zap, Bell,
  Play, BookmarkPlus, Share2, Eye, ChevronRight,
} from 'lucide-react'

import ArticleCard from '../components/ArticleCard'
import { useArticles } from '../context/ArticleContext'

/* ─────────────────────── helpers ─────────────────────── */
const SectionTitle = ({ title, linkTo, icon: Icon, accent = true }) => (
  <div className={`flex items-center justify-between mb-5 ${accent ? 'pb-3 border-b-2 border-[#D72638]' : ''}`}>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-[#D72638]" />}
      <h2 className="text-lg font-extrabold text-gray-900 tracking-tight uppercase">{title}</h2>
    </div>
    {linkTo && (
      <Link to={linkTo} className="text-xs font-semibold text-[#D72638] hover:text-red-700 flex items-center gap-0.5 transition-colors">
        View All <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    )}
  </div>
)

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="font-mono text-xs text-gray-500 tabular-nums">
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

function BreakingBanner({ articles }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % articles.length), 5000)
    return () => clearInterval(id)
  }, [articles.length])
  if (!articles.length) return null
  return (
    <div className="bg-[#D72638] text-white flex items-center gap-0 overflow-hidden">
      <span className="shrink-0 flex items-center gap-1 bg-black/25 px-3 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap">
        <Zap className="w-3 h-3" /> Breaking
      </span>
      <Link to={`/article/${articles[idx].slug}`}
        className="flex-1 px-4 py-2 text-xs font-medium truncate hover:underline">
        {articles[idx].title}
      </Link>
      <div className="flex items-center gap-1 px-3 shrink-0">
        {articles.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`rounded-full transition-all duration-300 h-1.5 ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />
        ))}
      </div>
    </div>
  )
}

/* Big hero article with overlay */
function HeroArticle({ article }) {
  if (!article) return null
  return (
    <Link to={`/article/${article.slug}`} className="relative block h-[420px] md:h-[520px] overflow-hidden rounded-xl group">
      <img src={article.image} alt={article.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8">
        <Link to={`/category/${article.category}`} onClick={e => e.stopPropagation()}>
          <span className="inline-block bg-[#D72638] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded mb-2">
            {article.category}
          </span>
        </Link>
        <h1 className="text-xl md:text-3xl font-extrabold text-white leading-tight group-hover:text-red-200 transition-colors mb-2 line-clamp-3">
          {article.title}
        </h1>
        <p className="text-gray-300 text-xs md:text-sm line-clamp-2 mb-3 max-w-2xl hidden md:block">
          {article.excerpt}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-gray-400 text-xs">
          <span className="font-semibold text-gray-200">{article.author}</span>
          <span>•</span>
          <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <div className="ml-auto flex gap-2">
            <button onClick={e => e.preventDefault()}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors">
              <BookmarkPlus className="w-3 h-3" /> Save
            </button>
            <button onClick={e => e.preventDefault()}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors">
              <Share2 className="w-3 h-3" /> Share
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* Compact side article card */
function SideArticle({ article, rank }) {
  return (
    <Link to={`/article/${article.slug}`}
      className="flex gap-3 group py-3 border-b border-gray-100 last:border-0">
      {rank && (
        <span className="shrink-0 text-2xl font-black text-gray-100 group-hover:text-[#D72638] transition-colors w-7 leading-none">
          {rank}
        </span>
      )}
      <img src={article.image} alt={article.title}
        className="shrink-0 w-16 h-16 object-cover rounded-lg" />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-black text-[#D72638] uppercase tracking-widest">{article.category}</span>
        <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#D72638] transition-colors leading-snug line-clamp-2 mt-0.5">
          {article.title}
        </h4>
        <p className="text-[10px] text-gray-400 mt-1">{article.author}</p>
      </div>
    </Link>
  )
}

/* Category section: 1 large left + 3 compact right */
function CategorySection({ title, linkTo, articles }) {
  if (!articles.length) return null
  const [main, ...rest] = articles
  return (
    <section className="mb-10">
      <SectionTitle title={title} linkTo={linkTo} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2">
          <ArticleCard article={main} variant="default" />
        </div>
        <div className="divide-y divide-gray-100">
          {rest.slice(0, 3).map(a => (
            <Link key={a.id} to={`/article/${a.slug}`} className="flex gap-3 py-3 group">
              <img src={a.image} alt={a.title} className="shrink-0 w-16 h-14 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#D72638] transition-colors line-clamp-2 leading-snug">
                  {a.title}
                </h4>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function VideoCard({ article }) {
  return (
    <Link to={`/article/${article.slug}`}
      className="relative block rounded-xl overflow-hidden group shadow-sm border border-gray-100 aspect-video">
      <img src={article.image} alt={article.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black/45 group-hover:bg-black/60 transition-all flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-[#D72638] flex items-center justify-center shadow-lg">
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <span className="text-[10px] text-[#ff6b7a] font-black uppercase tracking-wide">{article.category}</span>
        <p className="text-white text-xs font-bold line-clamp-2 leading-snug mt-0.5">{article.title}</p>
      </div>
    </Link>
  )
}

function NewsletterInline() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  return (
    <div className="bg-[#0d0d0d] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 mb-10">
      <div className="shrink-0 text-center md:text-left">
        <Bell className="w-7 h-7 mb-1.5 mx-auto md:mx-0 text-[#D72638]" />
        <h3 className="text-lg font-extrabold text-white tracking-tight">Daily Briefing</h3>
        <p className="text-gray-400 text-xs mt-0.5">Top stories every morning, free.</p>
      </div>
      {done ? (
        <p className="flex-1 text-center text-sm font-bold text-green-400">✅ You're subscribed!</p>
      ) : (
        <form onSubmit={e => { e.preventDefault(); if (email) setDone(true) }}
          className="flex flex-1 w-full max-w-md">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email" required
            className="flex-1 px-4 py-2.5 text-sm text-gray-900 rounded-l-full focus:outline-none bg-white" />
          <button type="submit"
            className="px-5 py-2.5 bg-[#D72638] hover:bg-red-700 text-white text-sm font-bold rounded-r-full transition-colors whitespace-nowrap">
            Subscribe
          </button>
        </form>
      )}
    </div>
  )
}

/* ─────────────────────── main page ─────────────────────── */
export default function HomePage() {
  const { articles, getFeaturedArticles, getLatestArticles, getTrendingArticles } = useArticles()

  const featured   = getFeaturedArticles()
  const latest     = getLatestArticles(12)
  const trending   = getTrendingArticles()

  const hero       = featured[0] || articles[0]
  const secondary  = featured.slice(1, 3)
  const breaking   = latest.slice(0, 6)

  const byCategory = (cat, n) => articles.filter(a => a.category === cat).slice(0, n)

  return (
    <div className="min-h-screen bg-[#F2F3F5]">

      {/* 1 ── Breaking ticker */}
      <BreakingBanner articles={breaking} />

      {/* 2 ── Site identity bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>

              <span className="text-lg font-black text-[#D72638] tracking-tight leading-none block">INKINGI NEWS</span>
              <span className="text-[10px] text-gray-400 tracking-widest uppercase">Rwanda & Africa</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#D72638] animate-pulse" />
              <span className="font-semibold text-gray-700">Live</span>
            </div>
            <span className="text-gray-300">|</span>
            <LiveClock />
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              <span>{(articles.length * 312).toLocaleString()} readers today</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Politics', 'Sports', 'Tech', 'Business', 'Entertainment'].map(cat => (
              <Link key={cat} to={`/category/${cat.toLowerCase()}`}
                className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full hover:bg-[#D72638] hover:text-white transition-all">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3 ── TOP SECTION: Hero + featured sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Hero — takes 2 cols */}
          <div className="lg:col-span-2">
            <HeroArticle article={hero} />
          </div>

          {/* Featured sidebar — latest 4 */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col">
            <SectionTitle title="Featured" linkTo="/" accent />
            <div className="flex-1 divide-y divide-gray-100">
              {(secondary.length >= 2 ? secondary : latest).slice(0, 4).map((a, i) => (
                <SideArticle key={a.id} article={a} rank={i + 1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 ── MAIN CONTENT + SIDEBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT: Feed ── */}
          <div className="flex-1 min-w-0">

            {/* Category sections */}
            <CategorySection title="Politics"      linkTo="/category/politics"      articles={byCategory('politics', 4)} />
            <CategorySection title="Sports"        linkTo="/category/sports"        articles={byCategory('sports', 4)} />

            {/* Video row */}
            <section className="mb-10">
              <SectionTitle title="Video Stories" icon={Play} accent />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {articles.slice(0, 4).map(a => <VideoCard key={a.id} article={a} />)}
              </div>
            </section>

            <CategorySection title="Technology"   linkTo="/category/tech"          articles={byCategory('tech', 4)} />
            <CategorySection title="Business"     linkTo="/category/business"      articles={byCategory('business', 4)} />

            {/* Newsletter mid-feed */}
            <NewsletterInline />

            <CategorySection title="Entertainment" linkTo="/category/entertainment" articles={byCategory('entertainment', 4)} />

            {/* Latest grid */}
            <section className="mb-6">
              <SectionTitle title="Latest News" linkTo="/" icon={Clock} accent />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {latest.slice(0, 9).map(a => (
                  <ArticleCard key={a.id} article={a} variant="default" />
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT: Sticky Sidebar ── */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* Trending */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <SectionTitle title="Trending" icon={Flame} accent />
                <div className="space-y-4">
                  {trending.map((a, i) => (
                    <Link key={a.id} to={`/article/${a.slug}`} className="flex gap-3 group">
                      <span className="shrink-0 text-2xl font-black text-gray-100 group-hover:text-[#D72638] transition-colors leading-none w-7">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#D72638] transition-colors leading-snug line-clamp-2">
                          {a.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {a.author} • {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Most Read */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <SectionTitle title="Most Read" icon={TrendingUp} accent />
                <div className="space-y-3">
                  {latest.slice(0, 5).map((a, i) => (
                    <Link key={a.id} to={`/article/${a.slug}`} className="flex items-start gap-2.5 group">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#D72638] text-white text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-xs font-semibold text-gray-800 group-hover:text-[#D72638] transition-colors line-clamp-2 leading-snug">
                        {a.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <SectionTitle title="Categories" accent={false} />
                {['Politics', 'Sports', 'Tech', 'Business', 'Entertainment'].map(cat => (
                  <Link key={cat} to={`/category/${cat.toLowerCase()}`}
                    className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-red-50 group transition-colors">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#D72638] transition-colors">{cat}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#D72638] group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>

              {/* Alert CTA */}
              <div className="bg-gradient-to-br from-[#D72638] to-[#a81e2b] rounded-xl p-5 text-white text-center shadow-md">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-75" />
                <h4 className="text-base font-extrabold mb-1">Get Breaking News</h4>
                <p className="text-red-100 text-xs mb-3">Instant alerts, no noise.</p>
                <button onClick={() => alert('Notifications enabled!')}
                  className="w-full px-4 py-2 bg-white text-[#D72638] text-xs font-black rounded-lg hover:bg-red-50 transition-colors">
                  Enable Alerts
                </button>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
