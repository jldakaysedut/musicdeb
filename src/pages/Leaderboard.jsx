import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { ArrowLeft, Trophy, Medal, User, Disc3 } from 'lucide-react'

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    // 1. Kunin lahat ng APPROVED tracks kasama yung profile details ng nag-upload
    const { data, error } = await supabase
      .from('tracks')
      .select('user_id, profiles(username, avatar_url)')
      .eq('status', 'approved')

    if (error) {
      console.error("Error fetching leaderboard:", error)
      setLoading(false)
      return
    }

    // 2. I-group at bilangin kung ilan ang kanta ng bawat user (The Logic)
    const userCounts = {}
    data.forEach(track => {
      const uid = track.user_id
      if (!userCounts[uid]) {
        userCounts[uid] = { 
          count: 0, 
          username: track.profiles?.username || 'Unknown Audiophile',
          avatar_url: track.profiles?.avatar_url || null
        }
      }
      userCounts[uid].count += 1
    })

    // 3. I-sort mula sa pinakamataas (Highest count) pababa
    const sortedUsers = Object.values(userCounts).sort((a, b) => b.count - a.count)
    
    setTopUsers(sortedUsers)
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-[#090909] flex items-center justify-center text-green-500 font-bold">Tallying scores...</div>

  return (
    <div className="min-h-screen bg-[#090909] text-white font-sans p-6 relative pb-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-2xl mx-auto pt-10 z-10 relative">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors mb-8">
          <ArrowLeft size={20} /> Back to Vault
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
            <Trophy size={32} className="text-yellow-500" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Top Contributors.</h1>
        </div>
        <p className="text-gray-400 font-medium mb-10">The ultimate ranking of JamList's best curators.</p>

        {topUsers.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] rounded-[2rem] border border-[#222] border-dashed">
            <Disc3 size={48} className="mx-auto text-[#333] mb-4 animate-spin-slow" />
            <h3 className="text-xl font-bold text-white mb-2">No data yet</h3>
            <p className="text-gray-500 font-medium">Be the first to get your tracks approved!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {topUsers.map((user, index) => {
              // Custom styling para sa Top 1, 2, at 3
              const isRank1 = index === 0
              const isRank2 = index === 1
              const isRank3 = index === 2

              let borderClass = "border-[#222] bg-[#121212]"
              let textClass = "text-white"
              let RankIcon = () => <span className="text-xl font-black text-gray-500 w-8 text-center">#{index + 1}</span>

              if (isRank1) {
                borderClass = "border-yellow-500/50 bg-yellow-500/5 shadow-[0_0_30px_rgba(234,179,8,0.15)]"
                textClass = "text-yellow-500"
                RankIcon = () => <Trophy size={28} className="text-yellow-500 w-8" />
              } else if (isRank2) {
                borderClass = "border-gray-400/50 bg-gray-400/5"
                textClass = "text-gray-300"
                RankIcon = () => <Medal size={28} className="text-gray-400 w-8" />
              } else if (isRank3) {
                borderClass = "border-amber-700/50 bg-amber-700/5"
                textClass = "text-amber-600"
                RankIcon = () => <Medal size={28} className="text-amber-700 w-8" />
              }

              return (
                <div key={index} className={`p-4 rounded-3xl border flex items-center justify-between gap-4 transition-transform hover:scale-[1.02] ${borderClass}`}>
                  
                  <div className="flex items-center gap-4">
                    <RankIcon />
                    
                    <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-[#333] overflow-hidden flex items-center justify-center shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-gray-500" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className={`font-black text-xl tracking-tight ${textClass}`}>@{user.username}</h3>
                      <p className="text-sm text-gray-400 font-medium">Contributor</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end pr-2">
                    <span className={`text-3xl font-black ${textClass}`}>{user.count}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tracks</span>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}