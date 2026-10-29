import { useParams, Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import NewsTicker from '../components/NewsTicker'
import { ArrowLeft } from 'lucide-react'
import { useArticles } from '../context/ArticleContext'

export default function CategoryPage() {
  const { category } = useParams()
  const { getArticlesByCategory } = useArticles()
  const articles = getArticlesByCategory(category)

  const title = category
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : 'Category'

  return (
    <div className="min-h-screen bg-white">
      <NewsTicker />

      <section className="bg-[#121212] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase">
            {title} News
          </h1>
          <p className="text-gray-400 mt-2 text-sm">All the latest updates in {title}</p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h2>
            <p className="text-gray-600">There are no articles in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="default" />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
