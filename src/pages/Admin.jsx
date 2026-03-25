import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, Check, X, Play, Pause, LogOut, Music2 } from 'lucide-react'

export default function Admin() {
  const [pendingTracks, setPendingTracks] = useState([])
  const [loading, setLoading]             = useState(true)
  const [playingId, setPlayingId]         = useState(null)
  const navigate = useNavigate()

  useEffect(() => { checkAdminAndFetch() }, [])

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') { alert('Access denied.'); navigate('/dashboard'); return }
    fetchPendingTracks()
  }

  const fetchPendingTracks = async () => {
    const { data } = await supabase.from('tracks').select('*, profiles(username)').eq('status', 'pending').order('created_at', { ascending: false })
    if (data) setPendingTracks(data)
    setLoading(false)
  }

  const handleApprove = async (id) => {
    await supabase.from('tracks').update({ status: 'approved' }).eq('id', id)
    fetchPendingTracks()
  }

  const handleReject = async (id, fileUrl) => {
    if (!window.confirm('Reject and permanently delete this track? This cannot be undone.')) return
    const { error } = await supabase.from('tracks').delete().eq('id', id)
    if (!error) { await supabase.storage.from('music-bucket').remove([fileUrl.split('/').pop()]); fetchPendingTracks() }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login') }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-body)' }}>
        <div className="spin" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--black-5)', borderTopColor: 'var(--orange)' }} />
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--white-30)' }}>Verifying admin credentials...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', fontFamily: 'var(--font-body)' }}>

      {/* Top bar */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--black-2)', position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={18} color="#FF6060" />
          </div>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.01em' }}>Admin Headquarters</h1>
            <p style={{ fontSize: '11px', color: 'var(--white-30)', fontWeight: 500 }}>Content moderation · MusicDep</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/dashboard" className="btn-ghost" style={{ fontSize: '13px', padding: '9px 18px', borderRadius: '10px', textDecoration: 'none' }}>← Dashboard</Link>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '10px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', color: '#FF6060', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,80,80,0.1)'}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '36px' }}>
          {[
            { label: 'Pending Review', val: pendingTracks.length, color: '#FF6B1A', bg: 'rgba(255,107,26,0.08)' },
            { label: 'Awaiting Decision', val: pendingTracks.length, color: '#FFB400', bg: 'rgba(255,180,0,0.08)' },
            { label: 'Queue Status', val: pendingTracks.length === 0 ? 'Clear ✓' : 'Active', color: pendingTracks.length === 0 ? '#50C878' : '#FF6B1A', bg: pendingTracks.length === 0 ? 'rgba(80,200,120,0.08)' : 'rgba(255,107,26,0.08)' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '22px 20px', borderRadius: '18px', background: s.bg, border: `1px solid ${s.color}33`, textAlign: 'center' }}>
              <p style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: s.color, marginBottom: '5px', lineHeight: 1 }}>{s.val}</p>
              <p style={{ fontSize: '11px', color: 'var(--white-30)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.01em' }}>Pending Approvals</h2>
          <span style={{ background: 'var(--orange-dim)', color: 'var(--orange)', border: '1px solid rgba(255,107,26,0.25)', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>
            {pendingTracks.length} in queue
          </span>
        </div>

        {/* Empty state */}
        {pendingTracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 20px', background: 'var(--black-2)', borderRadius: '24px', border: '2px dashed var(--border)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'rgba(80,200,120,0.1)', border: '1px solid rgba(80,200,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Check size={32} color="#50C878" />
            </div>
            <p style={{ fontWeight: 800, fontSize: '22px', marginBottom: '10px' }}>All Clear!</p>
            <p style={{ fontSize: '15px', color: 'var(--white-60)', lineHeight: 1.65 }}>No pending tracks right now. The feed is clean and live.<br />Great moderation work. 🎉</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pendingTracks.map((track, i) => (
              <div key={track.id} className="card anim-fade-up" style={{ padding: '20px', animationDelay: `${i * 0.06}s` }}>
                {/* Track info row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <button onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                          style={{ width: '54px', height: '54px', borderRadius: '15px', background: 'var(--black-4)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--white-30)', flexShrink: 0, transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--white-30)' }}
                          title={playingId === track.id ? 'Pause preview' : 'Preview track'}>
                    {playingId === track.id ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: '2px' }} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.01em', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</p>
                    <p style={{ fontSize: '14px', color: 'var(--white-60)', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</p>
                    <p style={{ fontSize: '12px', color: 'var(--orange)', fontWeight: 700 }}>Uploaded by @{track.profiles?.username || 'Unknown User'}</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(255,180,0,0.12)', color: '#FFB400', border: '1px solid rgba(255,180,0,0.25)', borderRadius: '99px', padding: '4px 12px', flexShrink: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Pending
                  </span>
                </div>

                {/* Action row */}
                <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => handleApprove(track.id)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', borderRadius: '13px', background: 'rgba(80,200,120,0.1)', border: '1px solid rgba(80,200,120,0.25)', color: '#50C878', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#50C878'; e.currentTarget.style.color = 'var(--black)'; e.currentTarget.style.borderColor = '#50C878' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(80,200,120,0.1)'; e.currentTarget.style.color = '#50C878'; e.currentTarget.style.borderColor = 'rgba(80,200,120,0.25)' }}>
                    <Check size={17} strokeWidth={2.5} /> Approve & Publish
                  </button>
                  <button onClick={() => handleReject(track.id, track.file_url)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', borderRadius: '13px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#FF6060', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FF6060'; e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = '#FF6060' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.1)'; e.currentTarget.style.color = '#FF6060'; e.currentTarget.style.borderColor = 'rgba(255,80,80,0.25)' }}>
                    <X size={17} strokeWidth={2.5} /> Reject & Delete
                  </button>
                </div>

                {playingId === track.id && (
                  <audio src={track.file_url} autoPlay onEnded={() => setPlayingId(null)} style={{ display: 'none' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}