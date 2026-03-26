import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { 
  Trophy, User, Home, MessageSquare, Clock, 
  ChevronLeft, Crown, Radio, Star, Medal, Heart
} from 'lucide-react'

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

  // Simple time helper
  const formatTime = (seconds) => {
    if (!seconds) return "0m"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans pb-44">
      
      {/* 🔝 TOP SECTION */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-50 border-b border-white/[0.03]">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-orange-500 hover:text-black transition-all active:scale-90">
            <ChevronLeft size={20}/>
          </Link>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Time <span className="text-orange-500">Kings</span></h1>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Our Top Listeners</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
            <Star size={18} className="text-orange-500 animate-pulse" />
        </div>
      </header>

      <main className="px-6 pt-8">
        {/* ✨ QUICK STATS (Now with no cut-off text!) */}
        <div className="flex gap-3 mb-10 overflow-x-auto no-scrollbar">
            <div className="bg-white/[0.03] border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-2 shrink-0">
                <Medal size={14} className="text-orange-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Hall of Fame</span>
            </div>
            <div className="bg-white/[0.03] border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-2 shrink-0">
                <Heart size={14} className="text-orange-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Daily Best</span>
            </div>
        </div>

        {/* 🏆 THE LIST */}
        <div className="space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-20">
               <Radio className="text-orange-500 animate-spin mb-4" size={40} />
               <p className="text-[10px] font-black uppercase tracking-widest">Finding the Kings...</p>
            </div>
          ) : (
            leaders.map((user, i) => {
              const isFirst = i === 0;
              return (
                <div 
                  key={user.id} 
                  className={`relative p-5 rounded-[2.5rem] border flex items-center justify-between group active:scale-[0.98] transition-all
                  ${isFirst ? 'bg-orange-500/10 border-orange-500 shadow-2xl' : 'bg-[#0A0A0A] border-white/5'}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* RANK */}
                    <span className={`text-2xl font-black italic w-6 ${isFirst ? 'text-orange-500' : 'text-gray-800'}`}>
                        {i + 1}
                    </span>
                    
                    {/* AVATAR */}
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-2xl bg-black flex items-center justify-center border overflow-hidden ${isFirst ? 'border-orange-500/40' : 'border-white/5'}`}>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className={isFirst ? "text-orange-500" : "text-gray-800"} />
                        )}
                      </div>
                      {isFirst && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 p-1 rounded-full border-4 border-[#050505]">
                              <Crown size={12} className="text-black fill-black" />
                          </div>
                      )}
                    </div>

                    {/* NAME */}
                    <div className="truncate">
                      <h4 className={`font-black uppercase italic text-base truncate tracking-tight ${isFirst ? 'text-orange-500' : 'text-white'}`}>
                        {user.username}
                      </h4>
                      <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Global Listener</p>
                    </div>
                  </div>

                  {/* ⏱️ TIME BADGE (Integrated inside the card) */}
                  <div className={`ml-3 px-4 py-2 rounded-xl border font-black flex items-center gap-2 transition-all shrink-0
                    ${isFirst ? 'bg-orange-500 text-black border-orange-500' : 'bg-white/5 border-white/5 text-orange-500'}`}>
                    <Clock size={14} className={isFirst ? "animate-pulse" : ""} /> 
                    <span className="text-sm italic">{formatTime(user.total_listening_time)}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* 🧭 NAVIGATION */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] z-50 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] px-8 py-4 flex justify-between shadow-2xl items-center ring-1 ring-white/5">
        <Link to="/dashboard" className="p-2 text-gray-600 hover:text-orange-500 transition-all"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-600 hover:text-orange-500 transition-all"><MessageSquare size={24} /></Link>
        
        <Link to="/radio" className="relative group p-5 bg-orange-500 text-black rounded-full -mt-12 border-[6px] border-[#050505] shadow-xl hover:scale-110 active:scale-95 transition-all">
          <Radio size={28} />
        </Link>

        <Link to="/leaderboard" className="p-2 text-orange-500 relative transition-all">
          <Trophy size={24} />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_#F97316]"></div>
        </Link>
        
        <Link to="/profile" className="p-2 text-gray-600 hover:text-orange-500 transition-all"><User size={24} /></Link>
      </nav>
    </div>
  )
}