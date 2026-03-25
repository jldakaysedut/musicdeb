import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, ShieldAlert, Users, Database, MessageSquare, 
  Activity, Disc3, Clock, ChevronRight, LayoutDashboard 
} from 'lucide-react'

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

    // Check if the role is 'admin' in profiles table
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    
    if (!profile || profile.role !== 'admin') {
      alert("RESTRICTED: Administrative Clearance Required.")
      navigate('/dashboard')
      return
    }
    await fetchSystemData()
  }

  const fetchSystemData = async () => {
    // Parallel fetching for performance
    const [usersRes, savesRes, msgsRes, activityRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('saved_tracks').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('saved_tracks').select('*, profiles(username)').order('created_at', { ascending: false }).limit(8)
    ])

    setStats({
      totalUsers: usersRes.count || 0,
      totalSaves: savesRes.count || 0,
      totalMessages: msgsRes.count || 0
    })

    if (activityRes.data) setRecentActivity(activityRes.data)
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <Disc3 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
      <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em]">Syncing Admin Data...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 selection:bg-orange-500">
      <div className="max-w-5xl mx-auto pt-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-500 rounded-[1.5rem] shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <ShieldAlert size={32} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tightest uppercase italic">Admin <span className="text-orange-500">HQ</span></h1>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">Network & Database Telemetry</p>
            </div>
          </div>
          <Link to="/dashboard" className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-all flex items-center gap-2">
            <LayoutDashboard size={16} /> Return to Dashboard
          </Link>
        </header>

        {/* TOP STATS CARD */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {[
            { label: 'Total Curators', val: stats.totalUsers, icon: Users, color: 'text-blue-500' },
            { label: 'Saved Tracks', val: stats.totalSaves, icon: Database, color: 'text-orange-500' },
            { label: 'Lounge Messages', val: stats.totalMessages, icon: MessageSquare, color: 'text-green-500' }
          ].map((stat, i) => (
            <div key={i} className="p-8 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] relative overflow-hidden group shadow-xl hover:border-white/10 transition-all">
              <stat.icon size={80} className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${stat.color}`} />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">{stat.label}</p>
              <h3 className="text-5xl font-black tracking-tighter">{stat.val}</h3>
            </div>
          ))}
        </section>

        {/* RECENT ACTIVITY TABLE */}
        <section className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <Activity size={20} className="text-orange-500" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Real-time Track Ingest</h2>
          </div>

          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-center py-10 text-gray-700 font-black text-[10px] uppercase tracking-widest italic">No activity logs found.</p>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-4 truncate">
                    <div className="w-10 h-10 rounded-full border border-white/10 bg-black flex items-center justify-center shrink-0 overflow-hidden">
                       <img src={log.cover_image} className="w-full h-full object-cover opacity-60" />
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] font-black text-white uppercase italic truncate">
                        <span className="text-orange-500">@{log.profiles?.username || 'user'}</span> saved "{log.title}"
                      </p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{log.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 shrink-0">
                    <Clock size={12} />
                    <span className="text-[9px] font-black uppercase">{new Date(log.created_at).toLocaleDateString()}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  )
}