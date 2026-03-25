import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { Trophy, Crown, User, Home, MessageSquare, Disc3, ChevronLeft } from 'lucide-react'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchLeaderboard() }, [])

  const fetchLeaderboard = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*')
    const { data: savedTracks } = await supabase.from('saved_tracks').select('user_id')

    if (profiles && savedTracks) {
      const counts = savedTracks.reduce((acc, t) => { acc[t.user_id] = (acc[t.user_id] || 0) + 1; return acc }, {})
      const ranked = profiles.map(p => ({ ...p, count: counts[p.id] || 0 })).sort((a,b) => b.count - a.count).slice(0, 10)
      setLeaders(ranked)
    }
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Disc3 className="animate-spin text-orange-500" /></div>

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-40 relative overflow-hidden selection:bg-orange-500">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl mx-auto p-6 relative z-10">
        <header className="flex items-center gap-4 mb-16 pt-4">
          <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-500 transition-all text-gray-400 hover:text-black">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Hall of <span className="text-orange-500">Fame</span></h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Top Track Curators</p>
          </div>
        </header>

        {/* PODIUM SECTION */}
        <div className="flex items-end justify-center gap-4 mb-16 h-56">
          {leaders[1] && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-gray-400 bg-black mb-3 overflow-hidden">
                {leaders[1].avatar_url ? <img src={leaders[1].avatar_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-3 text-gray-400" />}
              </div>
              <div className="w-20 h-24 bg-white/5 rounded-t-2xl border-t-2 border-gray-400 flex flex-col items-center pt-3">
                <span className="text-2xl font-black italic text-gray-400">2</span>
                <span className="text-[8px] font-black uppercase mt-1 truncate px-2 w-full text-center">{leaders[1].username}</span>
              </div>
            </div>
          )}
          {leaders[0] && (
            <div className="flex flex-col items-center">
              <Crown className="text-orange-500 mb-2 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" size={28} />
              <div className="w-16 h-16 rounded-full border-2 border-orange-500 bg-black mb-3 overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                {leaders[0].avatar_url ? <img src={leaders[0].avatar_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-4 text-orange-500" />}
              </div>
              <div className="w-24 h-32 bg-orange-500/10 rounded-t-2xl border-t-2 border-orange-500 flex flex-col items-center pt-4">
                <span className="text-4xl font-black italic text-orange-500">1</span>
                <span className="text-[9px] font-black uppercase mt-1 truncate px-2 w-full text-center">{leaders[0].username}</span>
              </div>
            </div>
          )}
          {leaders[2] && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-amber-800 bg-black mb-3 overflow-hidden">
                {leaders[2].avatar_url ? <img src={leaders[2].avatar_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-3 text-amber-800" />}
              </div>
              <div className="w-20 h-20 bg-white/5 rounded-t-2xl border-t-2 border-amber-800 flex flex-col items-center pt-3">
                <span className="text-2xl font-black italic text-amber-800">3</span>
                <span className="text-[8px] font-black uppercase mt-1 truncate px-2 w-full text-center">{leaders[2].username}</span>
              </div>
            </div>
          )}
        </div>

        {/* LIST SECTION */}
        <div className="space-y-3">
          {leaders.slice(3).map((user, i) => (
            <div key={user.id} className="p-4 bg-[#0A0A0A] rounded-3xl border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-black italic w-4 text-center">{i + 4}</span>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <User size={16} className="text-gray-600" />}
                </div>
                <h4 className="font-black text-sm uppercase italic tracking-tight">{user.username}</h4>
              </div>
              <div className="bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20 text-orange-500 font-black text-[10px] tracking-widest uppercase flex items-center gap-2">
                <Disc3 size={12} /> {user.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 flex justify-around items-center shadow-2xl">
        <Link to="/dashboard" className="p-2 text-gray-600"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-600"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-orange-500"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-gray-600"><User size={22} /></Link>
      </nav>
    </div>
  )
}