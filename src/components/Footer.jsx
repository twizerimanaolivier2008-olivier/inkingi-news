import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Mail, Phone, MapPin } from 'lucide-react'
import logo from '../assets/helo.png'

const FbIcon = () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const TwIcon = () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
const IgIcon = () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
const LiIcon = () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
const YtIcon = () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#0d0d0d" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>

export default function Footer() {
  const year = format(new Date(), 'yyyy')

  const handleSubscribe = (e) => {
    e.preventDefault()
    const email = e.target.elements.email?.value
    if (email) {
      alert(`✅ Subscribed! Welcome to INKINGI — ${email}`)
      e.target.reset()
    }
  }

  return (
    <footer className="bg-[#0d0d0d] text-white">
      {/* Newsletter banner */}
      <div className="bg-[#D72638] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">Stay Informed. Stay Ahead.</h3>
            <p className="text-red-100 text-sm mt-1">Get breaking news delivered to your inbox every morning.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
              className="flex-1 md:w-72 px-4 py-2.5 text-gray-900 text-sm rounded-l-full focus:outline-none"
            />
            <button type="submit" className="px-5 py-2.5 bg-[#121212] text-white text-sm font-bold rounded-r-full hover:bg-black transition-colors whitespace-nowrap">
              Subscribe Free
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
<img src={logo} alt="INKINGI" className="h-8 w-8 object-contain brightness-0 invert rounded-full" />
              <span className="text-2xl font-extrabold text-[#D72638] tracking-tight">INKINGI</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Rwanda & Africa's trusted source for accurate, timely, and unbiased news reporting.
            </p>
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#D72638] shrink-0" />
              <span className="text-gray-500 text-xs">Kigali, Rwanda</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <Mail className="w-3.5 h-3.5 text-[#D72638] shrink-0" />
              <a href="mailto:info@inkingi.rw" className="text-gray-500 text-xs hover:text-white transition-colors">info@inkingi.rw</a>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#D72638] shrink-0" />
              <span className="text-gray-500 text-xs">+250 700 000 000</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5 pb-2 border-b border-gray-800">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[['/', 'Home'], ['/about', 'About Us'], ['/contact', 'Contact'], ['/careers', 'Careers'], ['/advertise', 'Advertise With Us']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                    <span className="text-[#D72638] text-xs">›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5 pb-2 border-b border-gray-800">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {['Politics', 'Sports', 'Technology', 'Business', 'Entertainment', 'Health', 'Culture'].map((cat) => (
                <li key={cat}>
                  <Link to={`/category/${cat.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                    <span className="text-[#D72638] text-xs">›</span> {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5 pb-2 border-b border-gray-800">Follow Us</h4>
            <p className="text-gray-400 text-sm mb-5">Join our community across all platforms.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FbIcon, label: 'Facebook', color: 'hover:bg-blue-600' },
                { icon: TwIcon, label: 'Twitter / 𝕏', color: 'hover:bg-zinc-800' },
                { icon: IgIcon, label: 'Instagram', color: 'hover:bg-pink-600' },
                { icon: YtIcon, label: 'YouTube', color: 'hover:bg-red-600' },
                { icon: LiIcon, label: 'LinkedIn', color: 'hover:bg-blue-700' },
              ].map(({ icon: Icon, label, color }) => (
                <a
                  key={label}
                  href="#"
                  className={`flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white text-xs font-medium transition-all ${color}`}
                >
                  <Icon /> {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs text-center sm:text-left">
            © {year} INKINGI News. All rights reserved. | Rwanda & Africa
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-gray-600 text-xs hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-600 text-xs hover:text-gray-300 transition-colors">Terms of Use</Link>
            <Link to="/sitemap" className="text-gray-600 text-xs hover:text-gray-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
