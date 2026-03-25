import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Trophy, User, Disc3 } from 'lucide-react'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Get all profiles sorted by download_count
      const { data } = await supabase.from('profiles').select('*').order('download_count', { ascending: false }).limit(10)
      if (data) setLeaders(data)
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-40">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-10 text-center">Download <span className="text-orange-500">Kings</span></h1>
      
      <div className="max-w-2xl mx-auto space-y-4">
        {leaders.map((user, i) => (
          <div key={user.id} className={`p-5 rounded-3xl border flex items-center justify-between ${i === 0 ? 'bg-orange-500/10 border-orange-500' : 'bg-[#0A0A0A] border-white/5'}`}>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-black italic text-gray-700">#{i + 1}</span>
              <h4 className="font-black uppercase italic">{user.username}</h4>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-orange-500 font-black">
              <Disc3 size={16} /> {user.download_count || 0} Downloads
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}