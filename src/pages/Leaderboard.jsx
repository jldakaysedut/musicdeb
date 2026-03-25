import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { ArrowLeft, Trophy, Medal, User, Home, MessageSquare, Disc3, LayoutGrid } from 'lucide-react'

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    // 1. Fetch approved tracks with profile details
    const { data, error } = await supabase
      .from('tracks')
      .select('user_id, profiles(username, avatar_url)')
      .eq('status', 'approved')

    if (error) {
      console.error("Leaderboard error:", error)
      setLoading(false)
      return
    }

    // 2. Logic: Group and count tracks per user
    const userCounts = {}
    data.forEach(track => {
      const uid = track.user_id
      if (!userCounts[uid]) {
        userCounts[uid] = { 
          count: 0, 
          username: track.profiles?.username || 'Audiophile',
          avatar_url: track.profiles?.avatar_url || null
        }
      }
      userCounts[uid].count += 1
    })

    const sortedUsers = Object.values(userCounts).sort((a, b) => b.count - a.count)
    setTopUsers(sortedUsers)
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Tallying the Vault...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-40 relative overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* Background Aesthetic Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto pt-10 z-10 relative">
        
        {/* Header Section */}
        <header className="mb-12">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-all font-bold text-sm group mb-8">
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-orange-500/10">
              <ArrowLeft size={18} />
            </div>
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-500/10 rounded-[1.5rem] border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
              <Trophy size={32} className="text-orange-500" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tightest uppercase italic">Top <span className="text-orange-500">Curators</span></h1>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">The elite ranking of JamList's best.</p>
            </div>
          </div>
        </header>

        {topUsers.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
            <Disc3 size={48} className="mx-auto text-gray-800 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-tighter">No Champions Yet</h3>
            <p className="text-gray-500 font-bold text-sm">Be the first to have your tracks approved!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {topUsers.map((user, index) => {
              const isRank1 = index === 0
              const isRank2 = index === 1
              const isRank3 = index === 2

              // Dynamic Styling based on Rank
              let cardStyle = "bg-white/[0.03] border-white/5"
              let rankText = "text-gray-600"
              let RankIcon = <span className="text-lg font-black">{index + 1}</span>

              if (isRank1) {
                cardStyle = "bg-orange-500/10 border-orange-500/30 shadow-[0_10px_40px_rgba(249,115,22,0.1)]"
                rankText = "text-orange-500"
                RankIcon = <Trophy size={24} className="text-orange-500" />
              } else if (isRank2) {
                cardStyle = "bg-white/[0.05] border-gray-400/20"
                rankText = "text-gray-400"
                RankIcon = <Medal size={24} className="text-gray-400" />
              } else if (isRank3) {
                cardStyle = "bg-white/[0.04] border-amber-700/20"
                rankText = "text-amber-700"
                RankIcon = <Medal size={24} className="text-amber-700" />
              }

              return (
                <div key={index} className={`p-5 rounded-[2rem] border flex items-center justify-between gap-4 transition-all hover:scale-[1.02] active:scale-95 group ${cardStyle}`}>
                  
                  <div className="flex items-center gap-5">
                    <div className="w-10 flex justify-center shrink-0">
                      {RankIcon}
                    </div>
                    
                    <div className="w-14 h-14 rounded-2xl bg-[#111] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-gray-700" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className={`font-black text-lg tracking-tight ${isRank1 ? 'text-orange-500' : 'text-white'}`}>@{user.username}</h3>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Verified Contributor</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end pr-3">
                    <span className={`text-2xl font-black ${rankText}`}>{user.count}</span>
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Approved Tracks</span>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex justify-around items-center">
        <Link to="/dashboard" className="p-2 text-gray-500"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-500"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-orange-500"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-gray-500"><User size={22} /></Link>
      </nav>

      {/* Signature Branding */}
      <footer className="text-center py-10 opacity-30">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">
          Curated with 🔥 by <span className="text-white">Dakay</span>
        </p>
      </footer>
    </div>
  )
}