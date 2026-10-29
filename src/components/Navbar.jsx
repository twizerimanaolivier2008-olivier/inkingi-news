import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, X, Zap } from 'lucide-react'
import logo from '../assets/helo.png'

// NOTE: removed/does not exist error fix: fallback to assets/logo.png

import WeatherWidget from './WeatherWidget'

const FbIcon = () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const TwIcon = () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
const IgIcon = () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
const LiIcon = () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>

export default function Navbar({ onSearchSubmit }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/category/politics', label: 'Politics' },
    { to: '/category/sports', label: 'Sports' },
    { to: '/category/tech', label: 'Tech' },
    { to: '/category/business', label: 'Business' },
    { to: '/category/entertainment', label: 'Entertainment' },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchValue.trim()) {
      onSearchSubmit?.(searchValue.trim())
      setSearchValue('')
      setSearchFocused(false)
      setIsMenuOpen(false)
    }
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <header className="sticky top-0 z-50">
          {/* Top bar */}
          <div className={`bg-[#121212] text-white text-xs transition-all duration-300 overflow-hidden ${scrolled ? 'max-h-0' : 'max-h-9'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 hidden sm:block">{today}</span>
            <WeatherWidget />
          </div>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors"><FbIcon /></a>
            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors"><TwIcon /></a>
            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors"><IgIcon /></a>
            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors"><LiIcon /></a>
            <span className="text-gray-600 mx-1">|</span>

          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className={`bg-white border-b border-gray-100 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 select-none">
<img src={logo} alt="INKINGI" className="h-7 w-7 object-contain rounded-full" />
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-xl font-extrabold text-[#D72638] tracking-tight">INKINGI</span>
                <span className="text-[9px] text-gray-400 tracking-widest uppercase">News & Media</span>
              </div>
            </Link>

            {/* Breaking badge */}
            <div className="hidden lg:flex items-center gap-1 ml-6">
              <span className="flex items-center gap-1 bg-[#D72638] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mr-2 animate-pulse">
                <Zap className="w-2.5 h-2.5" /> Breaking
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    [
                      'px-3 py-2 text-sm font-semibold tracking-wide rounded-md transition-all',
                      isActive
                        ? 'text-[#D72638] bg-red-50'
                        : 'text-gray-700 hover:text-[#D72638] hover:bg-red-50',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop search */}
            <div className="hidden md:flex items-center gap-2">
              <form onSubmit={handleSearch} className={`flex items-center overflow-hidden transition-all duration-300 ${searchFocused ? 'w-56' : 'w-10'}`}>
                {searchFocused && (
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search news..."
                    autoFocus
                    className="flex-1 px-3 py-1.5 text-sm border border-r-0 border-gray-200 rounded-l-full focus:outline-none focus:border-[#D72638]"
                  />
                )}
                <button
                  type={searchFocused ? 'submit' : 'button'}
                  onClick={() => !searchFocused && setSearchFocused(true)}
                  className={`p-2 text-gray-600 hover:text-[#D72638] transition-colors ${searchFocused ? 'bg-[#D72638] text-white rounded-r-full px-3 hover:bg-red-700' : ''}`}
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
              {searchFocused && (
                <button onClick={() => setSearchFocused(false)} className="p-1 text-gray-400 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile controls */}
            <div className="flex items-center gap-1 lg:hidden">
              <button onClick={() => setSearchFocused(!searchFocused)} className="p-2 text-gray-600 hover:text-[#D72638] transition-colors" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 hover:text-[#D72638] transition-colors" aria-label="Menu">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          {searchFocused && (
            <div className="lg:hidden pb-3">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search news..."
                  autoFocus
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-l-full focus:outline-none focus:border-[#D72638]"
                />
                <button type="submit" className="bg-[#D72638] text-white px-4 py-2 rounded-r-full text-sm hover:bg-red-700 transition-colors">
                  Go
                </button>
              </form>
            </div>
          )}

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-100">
              <div className="py-3 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-colors',
                        isActive ? 'bg-red-50 text-[#D72638]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#D72638]',
                      ].join(' ')
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="flex items-center gap-4 px-4 pt-3 border-t border-gray-100 mt-2">
                  <a href="#" className="text-gray-500 hover:text-[#D72638]"><FbIcon /></a>
                  <a href="#" className="text-gray-500 hover:text-[#D72638]"><TwIcon /></a>
                  <a href="#" className="text-gray-500 hover:text-[#D72638]"><IgIcon /></a>
                  <a href="#" className="text-gray-500 hover:text-[#D72638]"><LiIcon /></a>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
