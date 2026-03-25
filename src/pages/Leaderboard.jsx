import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { Trophy, User, Home, MessageSquare, Disc3, ChevronLeft, Crown } from 'lucide-react'

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
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-12">
          <Link to="/dashboard" className="p-2 hover:text-orange-500 transition-colors"><ChevronLeft size={24}/></Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Download <span className="text-orange-500">Kings</span></h1>
        </header>

        <div className="space-y-4">
          {leaders.map((user, i) => (
            <div key={user.id} className={`p-6 rounded-[2.5rem] border flex items-center justify-between transition-all ${i === 0 ? 'bg-orange-500/10 border-orange-500 shadow-xl shadow-orange-500/10' : 'bg-[#0A0A0A] border-white/5'}`}>
              <div className="flex items-center gap-6">
                <span className="text-2xl font-black italic text-gray-800 w-8">#{i + 1}</span>
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    {i === 0 ? <Crown size={24} className="text-orange-500" /> : <User size={24} className="text-gray-700" />}
                  </div>
                  <h4 className="font-black uppercase italic text-lg tracking-tight">{user.username}</h4>
                </div>
              </div>
              <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-orange-500 font-black flex items-center gap-3 italic">
                <Disc3 size={18} /> {user.download_count || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] z-50 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 flex justify-around shadow-2xl items-center">
        <Link to="/dashboard" className="p-2 text-gray-600 hover:text-white"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-600 hover:text-white"><MessageSquare size={24} /></Link>
        <Link to="/leaderboard" className="p-2 text-orange-500"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-gray-600 hover:text-white"><User size={24} /></Link>
      </nav>
    </div>
  )
}