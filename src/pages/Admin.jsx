import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, Users, Database, MessageSquare, Activity, Disc3, Clock } from 'lucide-react'

export default function Admin() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalUsers: 0, totalSaves: 0, totalMessages: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
      alert("Access Denied: Administrative Clearance Required.")
      navigate('/dashboard')
      return
    }
    await fetchSystemData()
  }

  const fetchSystemData = async () => {
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: savesCount } = await supabase.from('saved_tracks').select('*', { count: 'exact', head: true })
    const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true })

    setStats({
      totalUsers: userCount || 0,
      totalSaves: savesCount || 0,
      totalMessages: msgCount || 0
    })

    const { data: activity } = await supabase
      .from('saved_tracks')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (activity) setRecentActivity(activity)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Gathering Telemetry...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-40 relative overflow-hidden selection:bg-orange-500 selection:text-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto pt-10 z-10 relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-500 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <ShieldAlert size={32} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tightest uppercase italic">Admin <span className="text-orange-500">HQ</span></h1>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1 italic">Network Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-all flex items-center gap-2">
              <ArrowLeft size={16} /> Exit
            </Link>
            <button onClick={handleLogout} className="px-5 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              Logoff
            </button>
          </div>
        </header>

        {/* METRICS DASHBOARD */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-6 bg-[#0A0A0A] border border-white/5 rounded-[2rem] relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={64} /></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg"><Users size={16} className="text-orange-500" /></div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Users</h3>
            </div>
            <p className="text-4xl font-black tracking-tighter text-white">{stats.totalUsers}</p>
          </div>

          <div className="p-6 bg-[#0A0A0A] border border-white/5 rounded-[2rem] relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Database size={64} /></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg"><Database size={16} className="text-orange-500" /></div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Saved Tracks</h3>
            </div>
            <p className="text-4xl font-black tracking-tighter text-white">{stats.totalSaves}</p>
          </div>

          <div className="p-6 bg-[#0A0A0A] border border-white/5 rounded-[2rem] relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare size={64} /></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg"><MessageSquare size={16} className="text-orange-500" /></div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Chat Logs</h3>
            </div>
            <p className="text-4xl font-black tracking-tighter text-white">{stats.totalMessages}</p>
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <div className="flex items-center justify-between mb-6 px-2 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-orange-500" />
            <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Live Network Activity</span>
          </div>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
            <Disc3 size={32} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">No recent network activity.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/5 flex items-center justify-between transition-all hover:bg-white/[0.04]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shrink-0">
                    <img src={activity.cover_image} alt="cover" className="w-full h-full object-cover rounded-full opacity-50" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-300">
                      <span className="text-orange-500 font-black">@{activity.profiles?.username}</span> saved a track.
                    </p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5 italic">
                      {activity.title} — {activity.artist}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}