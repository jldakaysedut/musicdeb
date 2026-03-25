import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { Trophy, Crown, Medal, User, Home, MessageSquare, Disc3, ArrowLeft } from 'lucide-react'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    // 1. Kunin lahat ng profiles
    const { data: profiles } = await supabase.from('profiles').select('*')
    
    // 2. Kunin lahat ng saved_tracks para mabilang natin per user
    const { data: savedTracks } = await supabase.from('saved_tracks').select('user_id')

    if (profiles && savedTracks) {
      // Bilangin ang tracks per user
      const trackCounts = savedTracks.reduce((acc, track) => {
        acc[track.user_id] = (acc[track.user_id] || 0) + 1
        return acc
      }, {})

      // I-merge ang bilang sa profile data at i-sort pababa
      const rankedUsers = profiles
        .map(p => ({ ...p, trackCount: trackCounts[p.id] || 0 }))
        .sort((a, b) => b.trackCount - a.trackCount)
        .slice(0, 10) // Kunin lang ang Top 10

      setLeaders(rankedUsers)
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-40 relative overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto p-6 z-10 relative">
        
        {/* HEADER */}
        <header className="flex items-center gap-4 mb-10 pt-4">
          <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-500 hover:text-black transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              Hall of <span className="text-orange-500">Fame</span>
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Top Network Curators</p>
          </div>
        </header>

        {/* TOP 3 PODIUM */}
        <section className="flex items-end justify-center gap-4 mb-12 h-64 mt-12">
          
          {/* Rank 2 */}
          {leaders[1] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-10 duration-500 delay-100">
              <div className="w-16 h-16 rounded-full border-4 border-[#C0C0C0] bg-[#111] overflow-hidden mb-3 relative shadow-[0_0_20px_rgba(192,192,192,0.2)]">
                {leaders[1].avatar_url ? <img src={leaders[1].avatar_url} alt="avatar" className="w-full h-full object-cover" /> : <User size={24} className="text-[#C0C0C0] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
              </div>
              <div className="w-24 h-32 bg-gradient-to-t from-white/5 to-white/10 rounded-t-2xl border-t-4 border-[#C0C0C0] flex flex-col items-center pt-4 shadow-xl">
                <span className="text-3xl font-black text-[#C0C0C0] italic">2</span>
                <span className="text-[9px] font-black text-white uppercase tracking-widest mt-2 truncate w-full text-center px-2">{leaders[1].username}</span>
                <span className="text-[10px] font-bold text-gray-500">{leaders[1].trackCount} Tracks</span>
              </div>
            </div>
          )}

          {/* Rank 1 */}
          {leaders[0] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-10 duration-500 z-10">
              <Crown size={32} className="text-orange-500 mb-2 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
              <div className="w-20 h-20 rounded-full border-4 border-orange-500 bg-[#111] overflow-hidden mb-3 relative shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                {leaders[0].avatar_url ? <img src={leaders[0].avatar_url} alt="avatar" className="w-full h-full object-cover" /> : <User size={32} className="text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
              </div>
              <div className="w-28 h-40 bg-gradient-to-t from-orange-500/10 to-orange-500/20 rounded-t-2xl border-t-4 border-orange-500 flex flex-col items-center pt-4 shadow-2xl">
                <span className="text-4xl font-black text-orange-500 italic drop-shadow-md">1</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest mt-2 truncate w-full text-center px-2">{leaders[0].username}</span>
                <span className="text-[11px] font-bold text-orange-400">{leaders[0].trackCount} Tracks</span>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {leaders[2] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-10 duration-500 delay-200">
              <div className="w-16 h-16 rounded-full border-4 border-[#CD7F32] bg-[#111] overflow-hidden mb-3 relative shadow-[0_0_20px_rgba(205,127,50,0.2)]">
                {leaders[2].avatar_url ? <img src={leaders[2].avatar_url} alt="avatar" className="w-full h-full object-cover" /> : <User size={24} className="text-[#CD7F32] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
              </div>
              <div className="w-24 h-24 bg-gradient-to-t from-white/5 to-white/10 rounded-t-2xl border-t-4 border-[#CD7F32] flex flex-col items-center pt-4 shadow-xl">
                <span className="text-3xl font-black text-[#CD7F32] italic">3</span>
                <span className="text-[9px] font-black text-white uppercase tracking-widest mt-2 truncate w-full text-center px-2">{leaders[2].username}</span>
                <span className="text-[10px] font-bold text-gray-500">{leaders[2].trackCount} Tracks</span>
              </div>
            </div>
          )}

        </section>

        {/* REST OF THE RANKINGS (4-10) */}
        <section className="space-y-3">
          {leaders.slice(3).map((user, index) => (
            <div key={user.id} className="p-4 bg-[#0A0A0A] rounded-[2rem] border border-white/5 flex items-center justify-between transition-all hover:border-white/10 shadow-lg group">
              <div className="flex items-center gap-4">
                <span className="text-lg font-black text-gray-600 w-6 text-center italic">{index + 4}</span>
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-[#111] overflow-hidden flex items-center justify-center">
                  {user.avatar_url ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : <User size={18} className="text-gray-600" />}
                </div>
                <div>
                  <h4 className="font-black text-sm text-white uppercase italic tracking-tight">{user.username}</h4>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Curator</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
                <Disc3 size={14} className="text-orange-500" />
                <span className="text-[10px] font-black text-orange-500">{user.trackCount}</span>
              </div>
            </div>
          ))}

          {leaders.length === 0 && (
             <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
               <Trophy size={32} className="mx-auto text-gray-800 mb-4" />
               <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">No curators ranked yet.</p>
             </div>
          )}
        </section>

      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex justify-around items-center">
        <Link to="/dashboard" className="p-2 text-gray-600"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-600"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-orange-500"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-gray-600"><User size={22} /></Link>
      </nav>
    </div>
  )
}