import { createContext, useContext, useState, useEffect } from 'react';

const ArticleContext = createContext(null);

const API_BASE = 'http://localhost:4000';

function apiFetch(path, token, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  }).then(async (res) => {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Request failed');
    }
    return res.json();
  });
}

export function ArticleProvider({ children }) {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const auth = JSON.parse(window.localStorage.getItem('inkingi_admin_auth_v1') || 'null');
      return auth?.isVerified ? auth.token : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAuthChange = (e) => {
      const { token } = e.detail || {}
      setToken(token || null)
    }

    const fetchArticles = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let url = `${API_BASE}/api/articles?limit=50`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
        const data = await apiFetch(url, token);
        setArticles(data.articles || []);
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [token, searchQuery, selectedCategory]);

  useEffect(() => {
    const handler = (e) => {
      const { token } = e.detail || {}
      setToken(token || null);
    };
    window.addEventListener('inkingi-auth-change', handler);
    return () => window.removeEventListener('inkingi-auth-change', handler);
  }, [])

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'inkingi_admin_auth_v1') {
        try {
          const auth = JSON.parse(e.newValue || 'null');
          setToken(auth?.isVerified ? auth.token : null);
        } catch {
          setToken(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const getArticleBySlug = (slug) => articles.find((article) => article.slug === slug) || null;

  const getArticlesByCategory = (category) => articles.filter((article) => article.category === category);

  const getTrendingArticles = () => articles.slice(0, Math.min(5, articles.length));

  const getFeaturedArticles = () => articles.filter((article) => article.featured === true);

  const getLatestArticles = (limit = 10) => {
    return [...articles]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  };

  const getRelatedArticles = (category, excludeId) => {
    return articles.filter((article) => article.category === category && article.id != excludeId).slice(0, 4);
  };

  const searchArticles = (query) => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerQuery) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(lowerQuery)) ||
        article.content.toLowerCase().includes(lowerQuery)
    );
  };

  const addArticle = async (articleData) => {
    if (!token) throw new Error('Not authenticated');
    const newArticle = await apiFetch('/api/articles', token, {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
    setArticles((prev) => [newArticle, ...prev]);
    return newArticle;
  };

  const updateArticle = async (id, updatedData) => {
    if (!token) throw new Error('Not authenticated');
    const updated = await apiFetch(`/api/articles/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    });
    setArticles((prev) => prev.map((a) => (a.id == id ? updated : a)));
    return updated;
  };

  const deleteArticle = async (id) => {
    if (!token) throw new Error('Not authenticated');
    await apiFetch(`/api/articles/${id}`, token, { method: 'DELETE' });
    setArticles((prev) => prev.filter((a) => a.id != id));
  };

  const toggleFeatured = async (id) => {
    if (!token) throw new Error('Not authenticated');
    const updated = await apiFetch(`/api/articles/${id}/featured`, token, { method: 'PATCH' });
    setArticles((prev) => prev.map((a) => (a.id == id ? updated : a)));
    return updated;
  };

  const value = {
    articles,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    loading,
    error,
    token,
    setToken,
    getArticleBySlug,
    getArticlesByCategory,
    getTrendingArticles,
    getFeaturedArticles,
    getLatestArticles,
    getRelatedArticles,
    searchArticles,
    addArticle,
    updateArticle,
    deleteArticle,
    toggleFeatured,
  };

  return <ArticleContext.Provider value={value}>{children}</ArticleContext.Provider>;
}

export function useArticles() {
  const context = useContext(ArticleContext);
  if (!context) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
}

export default ArticleProvider;
