import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ArticleProvider } from './context/ArticleContext'
import Navbar from './components/Navbar'
import NewsTicker from './components/NewsTicker'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ReadingProgress from './components/ReadingProgress'
import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminProfile from './pages/AdminProfile'
import { AdminAuthProvider } from './context/AdminAuthContext'

// IMPORTANT: backend URLs for OTP/login can be wired here later.
// Current flow uses the demo OTP UI for owner login.

function Layout({ children }) {

  const handleSearch = (query) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`
  }
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ReadingProgress />
      <Navbar onSearchSubmit={handleSearch} />
      <NewsTicker />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

function App() {
  return (
    <ArticleProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/article/:slug" element={<Layout><ArticlePage /></Layout>} />
            <Route path="/category/:category" element={<Layout><CategoryPage /></Layout>} />
            <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </ArticleProvider>
  )
}


export default App
