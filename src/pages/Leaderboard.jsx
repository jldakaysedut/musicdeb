import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { Trophy, User, Disc3, Crown, ChevronLeft } from 'lucide-react'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase.from('profiles').select('*').order('download_count', { ascending: false }).limit(10)
      if (data) setLeaders(data)
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-40">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-4 mb-16 pt-4">
          <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-500 transition-all text-gray-400 hover:text-black"><ChevronLeft size={20}/></Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Download <span className="text-orange-500">Kings</span></h1>
        </header>

        <div className="space-y-4">
          {loading ? <div className="text-center py-20 text-gray-700 uppercase font-black tracking-widest text-xs">Ranking Users...</div> : 
            leaders.map((user, i) => (
              <div key={user.id} className={`p-6 rounded-[2.5rem] border flex items-center justify-between transition-all group ${i === 0 ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.15)]' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}>
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-8">
                    {i === 0 ? <Crown className="text-orange-500 animate-bounce" size={24}/> : <span className="text-2xl font-black italic text-gray-800">#{i + 1}</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                      {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover"/> : <User className="text-gray-700" size={20}/>}
                    </div>
                    <h4 className="font-black uppercase italic tracking-tight text-lg">{user.username}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                  <Disc3 size={18} className="text-orange-500" />
                  <span className="text-lg font-black text-white italic">{user.download_count || 0}</span>
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest hidden md:inline">Downloads</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}