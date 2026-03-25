import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Music2, ArrowLeft } from 'lucide-react'

function FloatingInput({ id, type, label, hint, icon: Icon, value, onChange }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '4px' }}>
      {/* Icon */}
      <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, transition: 'color 0.2s', color: active ? 'var(--orange)' : 'var(--white-30)', pointerEvents: 'none' }}>
        <Icon size={17} />
      </div>
      {/* Floating label */}
      <label htmlFor={id} style={{
        position: 'absolute',
        left: '48px',
        transition: 'all 0.2s cubic-bezier(.16,1,.3,1)',
        pointerEvents: 'none',
        fontWeight: 600,
        zIndex: 2,
        top: active ? '10px' : '50%',
        transform: active ? 'translateY(0) scale(0.82)' : 'translateY(-50%)',
        transformOrigin: 'left top',
        fontSize: '14px',
        color: active ? 'var(--orange)' : 'var(--white-30)',
      }}>{label}</label>
      {/* Input */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        style={{
          width: '100%',
          paddingLeft: '48px',
          paddingRight: '18px',
          paddingTop: active ? '26px' : '18px',
          paddingBottom: active ? '10px' : '18px',
          background: 'var(--black-3)',
          border: `1px solid ${focused ? 'var(--orange)' : 'var(--border)'}`,
          borderRadius: '14px',
          color: 'var(--white)',
          fontSize: '15px',
          fontWeight: 500,
          fontFamily: 'var(--font-body)',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: focused ? '0 0 0 3px rgba(255,107,26,0.15)' : 'none',
        }}
      />
      {hint && <p style={{ fontSize: '11px', color: 'var(--white-30)', marginTop: '6px', paddingLeft: '4px', fontWeight: 500 }}>{hint}</p>}
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setErrorMsg(authError.message)
      setLoading(false)
    } else {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
      navigate(profile?.role === 'admin' ? '/admin' : '/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--black)' }}>

      {/* ── LEFT PANEL (desktop only) ─────────────── */}
      <div style={{ display: 'none', width: '45%', background: 'var(--black-2)', borderRight: '1px solid var(--border)', padding: '48px', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}
           className="lg-panel">
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,26,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music2 size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px' }}>Music<span style={{ color: 'var(--orange)' }}>Dep</span></span>
          </div>

          <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '20px' }}>
            Welcome back<br />to your vault.
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--white-60)', lineHeight: 1.65 }}>
            Your music, your community, your rules — all right where you left them.
          </p>
        </div>

        {/* Decorative vinyl circle */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--black-3)', borderRadius: '18px', border: '1px solid var(--border)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-orange)' }}>
            <Music2 size={22} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px' }}>Retro Mix Vol. 1</p>
            <p style={{ fontSize: '12px', color: 'var(--white-30)', marginTop: '3px' }}>Last played · 2 hours ago</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '3px', alignItems: 'flex-end', height: '20px' }}>
            <div style={{ width: '3px', background: 'var(--orange)', borderRadius: '2px' }} className="eq-bar-1" />
            <div style={{ width: '3px', background: 'var(--orange)', borderRadius: '2px' }} className="eq-bar-2" />
            <div style={{ width: '3px', background: 'var(--orange)', borderRadius: '2px' }} className="eq-bar-3" />
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ─────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
        {/* Back btn */}
        <Link to="/" style={{ position: 'absolute', top: '24px', left: '24px', width: '40px', height: '40px', borderRadius: '12px', background: 'var(--black-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--white-60)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--white-60)' }}>
          <ArrowLeft size={18} />
        </Link>

        <div style={{ width: '100%', maxWidth: '400px' }} className="anim-fade-up">
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music2 size={16} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '16px' }}>Music<span style={{ color: 'var(--orange)' }}>Dep</span></span>
          </div>

          <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '8px' }}>Sign In</h1>
          <p style={{ fontSize: '14px', color: 'var(--white-60)', marginBottom: '32px', lineHeight: 1.6 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'none' }}>Create one free →</Link>
          </p>

          {/* Error */}
          {errorMsg && (
            <div className="anim-scale-in" style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#FF6060', fontWeight: 600 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF6060', flexShrink: 0 }} />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FloatingInput id="email" type="email" label="Email address" icon={Mail} value={email} onChange={e => setEmail(e.target.value)} />
            <FloatingInput id="password" type="password" label="Password" hint="Forgot your password? Contact support." icon={Lock} value={password} onChange={e => setPassword(e.target.value)} />

            <button type="submit" disabled={loading} className="btn-orange" style={{ width: '100%', marginTop: '8px', fontSize: '15px', padding: '16px' }}>
              {loading ? (
                <>
                  <span className="spin" style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block' }} />
                  Verifying...
                </>
              ) : <>Enter Vault <ArrowRight size={18} /></>}
            </button>
          </form>

          <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--white-30)', textAlign: 'center', lineHeight: 1.6 }}>
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* CSS for left panel responsive */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}