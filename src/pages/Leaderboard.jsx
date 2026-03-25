import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { User, Trophy, Medal } from 'lucide-react'
import NavLayout from '../components/NavLayout'

function LoadingScreen({ text }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div className="spin" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--black-5)', borderTopColor: 'var(--orange)' }} />
      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--white-30)' }}>{text}</p>
    </div>
  )
}

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { fetchLeaderboard() }, [])

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase.from('tracks').select('user_id, profiles(username, avatar_url)').eq('status', 'approved')
    if (error) { setLoading(false); return }
    const userCounts = {}
    data.forEach(track => {
      const uid = track.user_id
      if (!userCounts[uid]) userCounts[uid] = { count: 0, username: track.profiles?.username || 'Unknown', avatar_url: track.profiles?.avatar_url || null }
      userCounts[uid].count += 1
    })
    setTopUsers(Object.values(userCounts).sort((a, b) => b.count - a.count))
    setLoading(false)
  }

  if (loading) return <NavLayout><LoadingScreen text="Tallying the scores..." /></NavLayout>

  const rankConfig = [
    { border: 'rgba(255,107,26,0.4)', bg: 'rgba(255,107,26,0.07)', color: '#FF6B1A', Icon: Trophy },
    { border: 'rgba(192,192,192,0.3)', bg: 'rgba(192,192,192,0.04)', color: '#C0C0C0', Icon: Medal },
    { border: 'rgba(180,120,60,0.3)', bg: 'rgba(180,120,60,0.04)', color: '#B87840', Icon: Medal },
  ]

  return (
    <NavLayout>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '28px 20px' }}>
        <div className="anim-fade-up" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>Top Contributors</h1>
          <p style={{ fontSize: '14px', color: 'var(--white-60)' }}>
            The ultimate ranking of MusicDep's best curators. Upload quality tracks to climb the chart.
          </p>
        </div>

        {topUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--black-2)', borderRadius: '20px', border: '2px dashed var(--border)' }}>
            <Trophy size={48} color="var(--white-30)" style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>No rankings yet.</p>
            <p style={{ fontSize: '14px', color: 'var(--white-60)' }}>Be the first to get your tracks approved and claim the #1 spot!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topUsers.map((user, index) => {
              const cfg = rankConfig[index] || { border: 'var(--border)', bg: 'transparent', color: 'var(--white-60)', Icon: null }
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '18px', background: cfg.bg, border: `1px solid ${cfg.border}`, transition: 'transform 0.2s ease', animationDelay: `${index * 0.05}s` }}
                     className="anim-fade-up"
                     onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'}
                     onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                      {cfg.Icon ? <cfg.Icon size={24} color={cfg.color} /> : (
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--white-30)' }}>#{index + 1}</span>
                      )}
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--black-4)', border: `2px solid ${cfg.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {user.avatar_url ? <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="var(--white-30)" />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '16px', color: cfg.color, marginBottom: '3px' }}>@{user.username}</p>
                      <p style={{ fontSize: '12px', color: 'var(--white-30)', fontWeight: 500 }}>
                        Contributor · {user.count} approved {user.count === 1 ? 'track' : 'tracks'}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', paddingRight: '4px' }}>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: cfg.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{user.count}</p>
                    <p style={{ fontSize: '10px', color: 'var(--white-30)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Tracks</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </NavLayout>
  )
}