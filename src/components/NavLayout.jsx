import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Trophy, MessageSquare, User, LogOut, Music2 } from 'lucide-react'
import { supabase } from '../supabaseClient'

const navLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Discover' },
  { to: '/leaderboard', icon: Trophy,          label: 'Charts'   },
  { to: '/chat',        icon: MessageSquare,   label: 'Lounge'   },
  { to: '/profile',     icon: User,            label: 'Profile'  },
]

export default function NavLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="page-shell">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="sidebar">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'var(--orange)', boxShadow: 'var(--shadow-orange)' }}>
            <Music2 size={18} className="text-white" />
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
            Music<span style={{ color: 'var(--orange)' }}>Dep</span>
          </span>
        </Link>

        {/* Section label */}
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white-30)', padding: '0 14px', marginBottom: '8px' }}>
          Navigation
        </p>

        {navLinks.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={`nav-item ${location.pathname === to ? 'active' : ''}`}>
            <Icon size={18} />
            {label}
          </Link>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="nav-item" style={{ color: 'rgba(255,100,80,0.7)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ff6450'; e.currentTarget.style.background = 'rgba(255,100,80,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,100,80,0.7)'; e.currentTarget.style.background = '' }}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        {children}
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav lg:hidden">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={`bottom-nav-item ${location.pathname === to ? 'active' : ''}`}>
            <Icon />
            {label}
          </Link>
        ))}
        <button onClick={handleLogout} className="bottom-nav-item">
          <LogOut />
          Out
        </button>
      </nav>
    </div>
  )
}