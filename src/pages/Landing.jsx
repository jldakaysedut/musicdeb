import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Pause, Shield, Smartphone, Zap, Music2, Radio, Headphones } from 'lucide-react'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [demoPlaying, setDemoPlaying] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const featuredCards = [
    { title: 'Retro Mix',    sub: 'Classic Vibes',  plays: '2.4M', bg: 'linear-gradient(135deg,#FF6B1A 0%,#c0390a 100%)' },
    { title: 'Gym Mode',     sub: 'Peak Energy',    plays: '1.8M', bg: 'linear-gradient(135deg,#1a1a1a 0%,#333 100%)' },
    { title: 'Lofi Study',   sub: 'Deep Focus',     plays: '3.2M', bg: 'linear-gradient(135deg,#FF8C4A 0%,#7a2d00 100%)' },
    { title: 'Night Drive',  sub: 'After Hours',    plays: '980K', bg: 'linear-gradient(135deg,#222 0%,#111 100%)' },
  ]

  const features = [
    { icon: Zap,        title: 'Instant Streaming',    desc: 'Zero buffering. Your tracks load before you finish blinking — powered by Vite + Supabase edge infrastructure.',      color: '#FF6B1A' },
    { icon: Radio,      title: 'Live PH Radio',        desc: 'Tune into curated Philippine radio stations in real time. No app switching, no extra cost.',                          color: '#FF8C4A' },
    { icon: Shield,     title: 'Encrypted Vault',      desc: 'Every upload is secured behind enterprise-grade auth. Your sound, your rules — nobody else\'s.',                     color: '#FFFFFF'  },
    { icon: Smartphone, title: 'Feels Native Everywhere', desc: 'Bottom nav on mobile, sidebar on desktop. MusicDep adapts to how you naturally use your device.',                 color: '#FF6B1A' },
    { icon: Headphones, title: 'Community Curated',    desc: 'The best tracks get voted up. Your contribution helps the whole community discover better music.',                   color: '#FF8C4A' },
    { icon: Music2,     title: 'Admin Quality Control',desc: 'Every upload goes through a human review. That means the public feed stays clean, legit, and worth listening to.',   color: '#FFFFFF'  },
  ]

  return (
    <div className="overflow-x-hidden" style={{ background: 'var(--black)', color: 'var(--white)' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.4s ease',
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        padding: scrolled ? '12px 0' : '20px 0',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-orange)' }}>
              <Music2 size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
              Music<span style={{ color: 'var(--orange)' }}>Dep</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/login" style={{ color: 'var(--white-60)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', padding: '8px 16px', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--white)'}
                  onMouseLeave={e => e.target.style.color = 'var(--white-60)'}>
              Sign In
            </Link>
            <Link to="/register" className="btn-orange" style={{ padding: '10px 22px', fontSize: '14px', borderRadius: '10px' }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glow balls */}
        <div style={{ position: 'absolute', top: '15%', left: '20%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,26,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,26,0.07) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
                      backgroundImage: 'linear-gradient(var(--white-10) 1px, transparent 1px), linear-gradient(90deg, var(--white-10) 1px, transparent 1px)',
                      backgroundSize: '80px 80px' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px' }}>
          {/* Beta badge */}
          <div className="anim-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'var(--orange-dim)', border: '1px solid rgba(255,107,26,0.3)', marginBottom: '32px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--orange-light)' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--orange)', display: 'inline-block', animation: 'pulse-orange 2s ease-in-out infinite' }} />
            Now in Beta 2.0
          </div>

          <h1 className="anim-fade-up-1" style={{ fontSize: 'clamp(56px, 10vw, 100px)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.03em', marginBottom: '24px' }}>
            Your Music.<br />
            <span style={{ color: 'var(--orange)' }}>Your Rules.</span>
          </h1>

          <p className="anim-fade-up-2" style={{ fontSize: '18px', fontWeight: 400, color: 'var(--white-60)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '520px', margin: '0 auto 40px' }}>
            Upload your personal audio vault, tune into live radio, and enjoy a premium interface designed for people who actually care about music.
          </p>

          <div className="anim-fade-up-3" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-orange" style={{ fontSize: '16px', padding: '16px 32px', borderRadius: '14px' }}>
              Open the Vault <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost" style={{ fontSize: '16px', padding: '16px 32px', borderRadius: '14px' }}>
              Sign In
            </Link>
          </div>

          {/* Social proof */}
          <p className="anim-fade-up-4" style={{ marginTop: '40px', fontSize: '13px', color: 'var(--white-30)', fontWeight: 500 }}>
            Trusted by music lovers across the Philippines 🇵🇭
          </p>
        </div>
      </section>

      {/* ── APP PREVIEW ──────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--orange)', display: 'block', marginBottom: '12px' }}>
            Interface Preview
          </span>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '14px' }}>
            A player that feels premium.
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--white-60)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
            Designed for immersion. Every detail considered.
          </p>
        </div>

        {/* Mockup shell */}
        <div style={{ background: 'var(--black-2)', border: '1px solid var(--border)', borderRadius: '28px', padding: '32px', boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,26,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--white-30)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>Good evening</p>
              <h3 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>What are we playing?</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All Tracks', 'Favorites', 'Radio'].map((f, i) => (
                <span key={i} className={`filter-chip ${i === 0 ? 'active' : ''}`} style={{ fontSize: '12px', padding: '6px 14px' }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Featured cards row */}
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }} className="scrollbar-hide">
            {featuredCards.map((c, i) => (
              <div key={i} className={`feat-card ${i === 0 ? 'playing' : ''}`}
                   style={{ background: c.bg, minWidth: '160px' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                {i === 0 && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--orange)', borderRadius: '99px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', color: 'white' }}>
                    NOW PLAYING
                  </div>
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 800, marginBottom: '2px', letterSpacing: '-0.01em' }}>{c.title}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{c.sub} · {c.plays}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mini player demo */}
          <div style={{ marginTop: '20px', background: 'var(--black-3)', border: '1px solid var(--border)', borderRadius: '16px', padding: '14px 18px' }}>
            <div className="progress-track" style={{ marginBottom: '12px' }}>
              <div className="progress-fill" style={{ width: '42%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--orange-dim)', border: '1px solid rgba(255,107,26,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {demoPlaying ? (
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '16px' }}>
                      <div style={{ width: '3px', background: 'var(--orange)', borderRadius: '2px', minHeight: '4px' }} className="eq-bar-1" />
                      <div style={{ width: '3px', background: 'var(--orange)', borderRadius: '2px', minHeight: '4px' }} className="eq-bar-2" />
                      <div style={{ width: '3px', background: 'var(--orange)', borderRadius: '2px', minHeight: '4px' }} className="eq-bar-3" />
                    </div>
                  ) : <Music2 size={16} color="var(--orange)" />}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px' }}>Retro Mix Vol. 1</p>
                  <p style={{ fontSize: '12px', color: 'var(--white-30)', fontWeight: 500, marginTop: '2px' }}>@djretro · 2:34 / 5:12</p>
                </div>
              </div>
              <button className="btn-orange" style={{ width: '44px', height: '44px', padding: 0, borderRadius: '50%' }} onClick={() => setDemoPlaying(!demoPlaying)}>
                {demoPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--orange)', display: 'block', marginBottom: '12px' }}>
            Why MusicDep
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Built for people who love music.<br />Not just listeners.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: '28px' }}
                 onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,107,26,0.35)'}
                 onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--black-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', border: '1px solid var(--border)' }}>
                <f.icon size={20} color={f.color} />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px', letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--white-60)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'var(--orange)', borderRadius: '28px', padding: 'clamp(40px, 6vw, 72px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px', color: 'white' }}>
              Ready to drop your sound?
            </h2>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.8)', marginBottom: '36px', lineHeight: 1.6 }}>
              Join thousands of Filipino music lovers already on the platform.<br />Your contribution helps the community grow.
            </p>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'white', color: 'var(--orange)', fontWeight: 800, fontSize: '16px', padding: '16px 36px', borderRadius: '14px', textDecoration: 'none', transition: 'transform 0.2s ease, box-shadow 0.2s ease', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)' }}>
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '36px 24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music2 size={16} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '16px' }}>MusicDep</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--white-30)', fontWeight: 500 }}>© 2026 MusicDep. Crafted for audiophiles.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['GitHub', 'Twitter', 'Instagram'].map(s => (
            <a key={s} href="#" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white-30)', textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={e => e.target.style.color = 'var(--orange)'}
               onMouseLeave={e => e.target.style.color = 'var(--white-30)'}>{s}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}