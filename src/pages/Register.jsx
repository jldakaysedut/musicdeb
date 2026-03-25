import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Music2, ArrowLeft, CheckCircle2 } from 'lucide-react'

function FloatingInput({ id, type, label, hint, icon: Icon, value, onChange }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position: 'relative', marginBottom: '4px' }}>
      <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, transition: 'color 0.2s', color: active ? 'var(--orange)' : 'var(--white-30)', pointerEvents: 'none' }}>
        <Icon size={17} />
      </div>
      <label htmlFor={id} style={{ position: 'absolute', left: '48px', transition: 'all 0.2s cubic-bezier(.16,1,.3,1)', pointerEvents: 'none', fontWeight: 600, zIndex: 2, top: active ? '10px' : '50%', transform: active ? 'translateY(0) scale(0.82)' : 'translateY(-50%)', transformOrigin: 'left top', fontSize: '14px', color: active ? 'var(--orange)' : 'var(--white-30)' }}>{label}</label>
      <input id={id} type={type} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} required
        style={{ width: '100%', paddingLeft: '48px', paddingRight: '18px', paddingTop: active ? '26px' : '18px', paddingBottom: active ? '10px' : '18px', background: 'var(--black-3)', border: `1px solid ${focused ? 'var(--orange)' : 'var(--border)'}`, borderRadius: '14px', color: 'var(--white)', fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-body)', outline: 'none', transition: 'all 0.2s ease', boxShadow: focused ? '0 0 0 3px rgba(255,107,26,0.15)' : 'none' }} />
      {hint && <p style={{ fontSize: '11px', color: 'var(--white-30)', marginTop: '6px', paddingLeft: '4px', fontWeight: 500 }}>{hint}</p>}
    </div>
  )
}

const perks = [
  'Upload your tracks to the public vault',
  'Stream 15+ live PH radio stations',
  'Real-time global chat lounge',
  'Compete on the contributor leaderboard',
  'Favorite & organize your music library',
]

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMsg(''); setSuccessMsg(''); setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setErrorMsg(error.message); setLoading(false) }
    else {
      setSuccessMsg('Account created! Check your email to confirm, then sign in.')
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--black)' }}>

      {/* ── LEFT: Perks panel ── */}
      <div className="lg-panel" style={{ display: 'none', width: '45%', background: 'var(--orange)', padding: '48px', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        {/* Pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music2 size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px', color: 'white' }}>MusicDep</span>
          </div>
          <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '12px', color: 'white' }}>
            Everything you need to share your sound.
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', marginBottom: '40px', lineHeight: 1.65 }}>
            Join MusicDep free. Your contribution helps the community grow.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {perks.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={20} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
          100% free. No credit card required.
        </p>
      </div>

      {/* ── RIGHT: Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
        <Link to="/" style={{ position: 'absolute', top: '24px', left: '24px', width: '40px', height: '40px', borderRadius: '12px', background: 'var(--black-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--white-60)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--white-60)' }}>
          <ArrowLeft size={18} />
        </Link>

        <div style={{ width: '100%', maxWidth: '400px' }} className="anim-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music2 size={16} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '16px' }}>Music<span style={{ color: 'var(--orange)' }}>Dep</span></span>
          </div>

          <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ fontSize: '14px', color: 'var(--white-60)', marginBottom: '32px', lineHeight: 1.6 }}>
            Already a member?{' '}
            <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
          </p>

          {errorMsg && (
            <div className="anim-scale-in" style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#FF6060', fontWeight: 600 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF6060', flexShrink: 0 }} />{errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="anim-scale-in" style={{ background: 'rgba(80,200,120,0.1)', border: '1px solid rgba(80,200,120,0.25)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#50C878', fontWeight: 600 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#50C878', flexShrink: 0 }} />{successMsg}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FloatingInput id="email" type="email" label="Email address" icon={Mail} value={email} onChange={e => setEmail(e.target.value)} />
            <FloatingInput id="password" type="password" label="Password" hint="Use at least 6 characters for a strong password." icon={Lock} value={password} onChange={e => setPassword(e.target.value)} />

            <button type="submit" disabled={loading} className="btn-orange" style={{ width: '100%', marginTop: '8px', fontSize: '15px', padding: '16px' }}>
              {loading ? (
                <><span className="spin" style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block' }} /> Creating vault...</>
              ) : <>Create Free Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--white-30)', textAlign: 'center', lineHeight: 1.7 }}>
            By creating an account you agree to our<br />Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      <style>{`@media (min-width: 1024px) { .lg-panel { display: flex !important; } }`}</style>
    </div>
  )
}