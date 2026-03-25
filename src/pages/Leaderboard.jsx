import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Trophy, User, Disc3, Crown } from 'lucide-react'

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
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-10 text-center">Download <span className="text-orange-500">Kings</span></h1>
        <div className="space-y-4">
          {leaders.map((user, i) => (
            <div key={user.id} className={`p-6 rounded-[2rem] border flex items-center justify-between ${i === 0 ? 'bg-orange-500/10 border-orange-500 shadow-xl shadow-orange-500/10' : 'bg-[#0A0A0A] border-white/5'}`}>
              <div className="flex items-center gap-5">
                <div className="text-xl font-black italic text-gray-700 w-6">#{i + 1}</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    {i === 0 ? <Crown className="text-orange-500" size={20}/> : <User className="text-gray-600" size={18}/>}
                  </div>
                  <h4 className="font-black uppercase italic">{user.username}</h4>
                </div>
              </div>
              <div className="flex items-center gap-2 text-orange-500 font-black italic bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Disc3 size={16} /> {user.download_count || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}