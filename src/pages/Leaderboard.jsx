import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { Trophy, User, Home, MessageSquare, Clock, ChevronLeft, Crown, Radio, Zap } from 'lucide-react'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('total_listening_time', { ascending: false })
      .limit(10)
    
    if (data) setLeaders(data)
    setLoading(false)
  }

  // Helper para gawing readable ang seconds (e.g. 1.5h o 45m)
  const formatTime = (seconds) => {
    if (!seconds) return "0m"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-44 relative">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-5 mb-14 pt-6">
          <Link to="/dashboard" className="p-3 bg-white/5 rounded-[1.2rem] hover:bg-orange-500 transition-all text-gray-400 hover:text-black">
            <ChevronLeft size={20}/>
          </Link>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Time <span className="text-orange-500">Kings</span></h1>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mt-1">Top Listeners of the Week</p>
          </div>
        </header>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-24 opacity-30">
               <Zap className="mx-auto animate-bounce text-orange-500 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">Calculating Ranks...</p>
            </div>
          ) : (
            leaders.map((user, i) => (
              <div 
                key={user.id} 
                className={`p-6 rounded-[2.5rem] border flex items-center justify-between transition-all group
                ${i === 0 ? 'bg-orange-500/10 border-orange-500 shadow-[0_20px_40px_rgba(249,115,22,0.1)] scale-[1.02]' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-6">
                  {/* RANK NUMBER */}
                  <div className={`text-2xl font-black italic w-8 ${i === 0 ? 'text-orange-500' : 'text-gray-800'}`}>
                    #{i + 1}
                  </div>
                  
                  {/* USER INFO */}
                  <div className="flex items-center gap-4 text-left">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center border border-white/10 overflow-hidden shadow-xl">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className={i === 0 ? "text-orange-500" : "text-gray-700"} />
                        )}
                      </div>
                      {i === 0 && <Crown size={16} className="absolute -top-2 -right-2 text-orange-500 fill-orange-500 rotate-12 shadow-orange-500" />}
                    </div>
                    <div>
                      <h4 className={`font-black uppercase italic text-lg tracking-tight ${i === 0 ? 'text-orange-500' : 'text-white'}`}>
                        {user.username}
                      </h4>
                      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Verified Listener</p>
                    </div>
                  </div>
                </div>

                {/* TIME BADGE */}
                <div className={`px-6 py-3 rounded-2xl border font-black flex items-center gap-3 italic transition-all
                  ${i === 0 ? 'bg-orange-500 text-black border-orange-500' : 'bg-white/5 border-white/5 text-orange-500 group-hover:bg-orange-500/10'}`}>
                  <Clock size={16} className={i === 0 ? "animate-pulse" : ""} /> 
                  <span className="text-xl">{formatTime(user.total_listening_time)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🧭 NAVIGATION BAR */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[420px] z-50 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] px-8 py-4 flex justify-between shadow-2xl items-center ring-1 ring-white/5">
        <Link to="/dashboard" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><MessageSquare size={24} /></Link>
        <Link to="/radio" className="relative p-5 bg-orange-500 text-black rounded-full -mt-12 border-[6px] border-[#050505] shadow-[0_15px_30px_rgba(249,115,22,0.4)] transition-all hover:scale-110">
          <Radio size={28} />
        </Link>
        <Link to="/leaderboard" className="p-2 text-orange-500 transition-all relative">
          <Trophy size={24} />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
        </Link>
        <Link to="/profile" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><User size={24} /></Link>
      </nav>
    </div>
  )
}