import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { cn } from '../lib/utils'

const variantStyles = {
  default: {
    card: 'bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300',
    image: 'h-48',
    badge: true,
    excerpt: true,
  },
  featured: {
    card: 'bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row border-l-4 border-[#D72638]',
    image: 'md:w-1/2 h-48 md:h-auto',
    badge: true,
    excerpt: true,
  },
  compact: {
    card: 'bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-row',
    image: 'w-24 h-16',
    badge: false,
    excerpt: false,
  },
  large: {
    card: 'bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 relative group',
    image: 'h-64',
    badge: true,
    excerpt: false,
  },
}

export default function ArticleCard({ article, variant = 'default' }) {
  if (!article) return null

  const styles = variantStyles[variant] || variantStyles.default
  const date = format(new Date(article.date), 'MMM d, yyyy')

  return (
    <article className={styles.card}>
      <Link to={`/article/${article.slug}`} className="block">
        <div className={cn('overflow-hidden relative', styles.image === 'h-64' ? styles.image : '')}>
          <img
            src={article.image}
            alt={article.title}
            className={cn(
              'w-full object-cover transition-transform duration-500 group-hover:scale-105',
              styles.image === 'h-48' && 'h-48',
              styles.image === 'md:w-1/2 h-48 md:h-auto' && 'md:w-1/2 h-48 md:h-auto',
              styles.image === 'w-24 h-16' && 'w-24 h-16',
              styles.image === 'h-64' && 'h-64 group-hover:scale-105'
            )}
            loading="lazy"
          />
          {styles.badge && (
            <span className="absolute top-3 left-3 bg-[#D72638] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
              {article.category}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 flex-1">
        <Link
          to={`/category/${article.category.toLowerCase()}`}
          className="text-xs font-bold text-[#D72638] uppercase tracking-wider hover:text-red-700 transition-colors"
        >
          {article.category}
        </Link>
        <Link to={`/article/${article.slug}`} className="block mt-2">
          <h3 className={cn(
            'font-bold text-gray-900 leading-snug hover:text-[#D72638] transition-colors line-clamp-2',
            variant === 'large' && 'text-xl md:text-2xl'
          )}>
            {article.title}
          </h3>
        </Link>
        {styles.excerpt && article.excerpt && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span className="font-medium text-gray-600">{article.author}</span>
          <span>•</span>
          <time dateTime={article.date}>{date}</time>
        </div>
      </div>
    </article>
  )
}
