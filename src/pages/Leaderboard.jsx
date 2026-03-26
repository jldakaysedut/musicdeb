import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { Trophy, User, Home, MessageSquare, Disc3, ChevronLeft, Crown, Radio } from 'lucide-react'

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
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-44 relative">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-12 pt-2">
          <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-500 transition-all text-gray-400 hover:text-black"><ChevronLeft size={20}/></Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Download <span className="text-orange-500">Kings</span></h1>
        </header>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-gray-600 uppercase font-black tracking-widest text-[10px]">Loading Ranks...</div>
          ) : (
            leaders.map((user, i) => (
              <div key={user.id} className={`p-6 rounded-[2.5rem] border flex items-center justify-between transition-all ${i === 0 ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 'bg-[#0A0A0A] border-white/5'}`}>
                <div className="flex items-center gap-5">
                  <span className="text-2xl font-black italic text-gray-800 w-8">#{i + 1}</span>
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border border-white/10 overflow-hidden">
                      {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : (i === 0 ? <Crown size={24} className="text-orange-500" /> : <User size={24} className="text-gray-700" />)}
                    </div>
                    <h4 className={`font-black uppercase italic text-lg tracking-tight ${i === 0 ? 'text-orange-500' : 'text-white'}`}>{user.username}</h4>
                  </div>
                </div>
                <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/10 text-orange-500 font-black flex items-center gap-2 italic">
                  <Disc3 size={16} className={i === 0 ? "animate-spin-slow" : ""} /> <span className="text-xl">{user.download_count || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🧭 FIXED BOTTOM NAV WITH CENTER RADIO BUTTON */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] md:w-[400px] z-50 bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-6 py-3 flex justify-between shadow-2xl items-center">
        <Link to="/dashboard" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><MessageSquare size={24} /></Link>
        
        <Link to="/dashboard" className="p-4 bg-orange-500 text-black rounded-full -mt-10 border-4 border-[#050505] shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all">
          <Radio size={24} />
        </Link>

        <Link to="/leaderboard" className="p-2 text-orange-500 transition-colors"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><User size={24} /></Link>
      </nav>
    </div>
  )
}