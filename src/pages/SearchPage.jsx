import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import NewsTicker from '../components/NewsTicker'
import { ArrowLeft, Search as SearchIcon } from 'lucide-react'
import { useArticles } from '../context/ArticleContext'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { searchArticles } = useArticles()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setResults(searchArticles(query))
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, searchArticles])

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
          <div className="flex items-center gap-3">
            <SearchIcon className="w-6 h-6 text-[#D72638]" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {query ? `Results for "${query}"` : 'Search Results'}
            </h1>
          </div>
          {!query && (
            <p className="text-gray-400 mt-2 text-sm">Please enter a search query to find articles.</p>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-200 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <SearchIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h2>
            <p className="text-gray-600">Try different keywords or browse our categories.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {results.length} article{results.length !== 1 && 's'} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((article) => (
                <ArticleCard key={article.id} article={article} variant="default" />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
