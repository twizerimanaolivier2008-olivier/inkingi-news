import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon,
} from 'react-share'
import ArticleCard from '../components/ArticleCard'
import { useArticles } from '../context/ArticleContext'
import NewsTicker from '../components/NewsTicker'
import { Share2, Clock, User, ChevronLeft } from 'lucide-react'

export default function ArticlePage() {
  const { slug } = useParams()
  const { getArticleBySlug, getRelatedArticles } = useArticles()
  const article = getArticleBySlug(slug)
  const related = article ? getRelatedArticles(article.category, article.id) : []

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = article?.title || ''

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <NewsTicker />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you are looking for does not exist.</p>
          <a
            href="/"
            className="text-[#D72638] font-semibold hover:underline inline-flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <NewsTicker />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <span className="inline-block text-xs font-bold text-[#D72638] uppercase tracking-wider bg-red-50 px-3 py-1 rounded mb-4">
          {article.category}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
          {article.title}
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">{article.excerpt}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-1.5 font-medium text-gray-700">
            <User className="w-4 h-4 text-[#D72638]" />
            {article.author}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#D72638]" />
            {format(new Date(article.date), 'MMMM d, yyyy')}
          </div>
        </div>

        <img
          src={article.image}
          alt={article.title}
          className="w-full h-auto rounded-lg mb-8 shadow-sm object-cover max-h-[500px]"
        />

        <div className="prose prose-lg max-w-none mb-10">
          {article.content.split('\n').map((paragraph, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4 first-letter:text-4xl first-letter:font-bold first-letter:text-gray-900 first-letter:mr-1 first-letter:float-left">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="border-t border-b border-gray-100 py-5 mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#D72638]" />
              Share Article
            </span>
            <div className="flex items-center gap-3">
              <FacebookShareButton url={shareUrl} quote={shareTitle}>
                <FacebookIcon round size={36} />
              </FacebookShareButton>
              <TwitterShareButton url={shareUrl} title={shareTitle}>
                <TwitterIcon round size={36} />
              </TwitterShareButton>
              <LinkedinShareButton url={shareUrl} title={shareTitle}>
                <LinkedinIcon round size={36} />
              </LinkedinShareButton>
              <EmailShareButton url={shareUrl} subject={shareTitle} body="Check out this article:">
                <EmailIcon round size={36} />
              </EmailShareButton>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-6">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((article) => (
              <ArticleCard key={article.id} article={article} variant="default" />
            ))}
          </div>
        </section>
      )}

      <section className="bg-[#F3F5F7] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-6">Comments</h2>
          <form
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            onSubmit={(e) => {
              e.preventDefault()
              alert('Comment submitted successfully!')
              e.target.reset()
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
                placeholder="Enter your name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#D72638] text-sm"
                placeholder="Write your comment..."
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#D72638] text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Post Comment
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
