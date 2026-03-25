import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, ShieldAlert, Check, X, Play, Pause, 
  User, Database, Activity, BarChart3 
} from 'lucide-react'

export default function Admin() {
  const [pendingTracks, setPendingTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState(null)
  
  // 📊 NEW: Analytics State
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedTracks: 0,
    pendingCount: 0
  })

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

    await fetchDashboardData()
  }

  const fetchDashboardData = async () => {
    // 1. Fetch Pending Tracks
    const { data: pending } = await supabase
      .from('tracks')
      .select('*, profiles(username)') 
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (pending) setPendingTracks(pending)

    // 2. 📊 NEW: Fetch System Stats for Analytics
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: approvedCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'approved')

    setStats({
      totalUsers: userCount || 0,
      approvedTracks: approvedCount || 0,
      pendingCount: pending?.length || 0
    })

    setLoading(false)
  }

  // --- MODERATION ACTIONS ---
  const handleApprove = async (id) => {
    setPendingTracks(prev => prev.filter(t => t.id !== id))
    setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1, approvedTracks: prev.approvedTracks + 1 }))

    const { error } = await supabase.from('tracks').update({ status: 'approved' }).eq('id', id)
    if (error) fetchDashboardData() 
  }

  const handleReject = async (id, fileUrl) => {
    if (!window.confirm("Permanent Action: Reject and purge this track from the vault?")) return
    
    setPendingTracks(prev => prev.filter(t => t.id !== id))
    setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1 }))

    try {
      const { error: dbError } = await supabase.from('tracks').delete().eq('id', id)
      if (dbError) throw dbError

      const fileName = fileUrl.split('/').pop()
      await supabase.storage.from('music-bucket').remove([fileName])
    } catch (error) {
      console.error("Purge failed:", error.message)
      fetchDashboardData() 
    }
  }

  const togglePlay = (id) => setPlayingId(playingId === id ? null : id)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Syncing Analytics...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-40 relative overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* Background Authority Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto pt-10 z-10 relative">
        
        {/* 1. ADMIN HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-500 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <ShieldAlert size={32} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tightest uppercase italic">Admin <span className="text-orange-500">HQ</span></h1>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1 italic">System Control & Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-all flex items-center gap-2">
              <ArrowLeft size={16} /> Exit to Vault
            </Link>
            <button onClick={handleLogout} className="px-5 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              Logoff
            </button>
          </div>
        </header>

        {/* 2. 📊 SYSTEM ANALYTICS DASHBOARD */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          
          {/* Stat Card 1: Total Users */}
          <div className="p-6 bg-[#0A0A0A] border border-white/5 rounded-[2rem] relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><User size={64} /></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg"><User size={16} className="text-orange-500" /></div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Curators</h3>
            </div>
            <p className="text-4xl font-black tracking-tighter text-white">{stats.totalUsers}</p>
          </div>

          {/* Stat Card 2: Approved Tracks */}
          <div className="p-6 bg-[#0A0A0A] border border-white/5 rounded-[2rem] relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Database size={64} /></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg"><Database size={16} className="text-orange-500" /></div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Live Vault Tracks</h3>
            </div>
            <p className="text-4xl font-black tracking-tighter text-white">{stats.approvedTracks}</p>
          </div>

          {/* Stat Card 3: Pending Queue */}
          <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-[2rem] relative overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.05)]">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Activity size={64} className="text-orange-500" /></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500 rounded-lg"><Activity size={16} className="text-black" /></div>
              <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Action Required</h3>
            </div>
            <p className="text-4xl font-black tracking-tighter text-orange-500">{stats.pendingCount}</p>
          </div>

        </section>

        {/* 3. MODERATION QUEUE */}
        <div className="flex items-center justify-between mb-6 px-2 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-orange-500" />
            <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Incoming Transmissions</span>
          </div>
        </div>

        {pendingTracks.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-gray-800" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Vault is Clear</h3>
            <p className="text-gray-600 font-bold text-xs uppercase tracking-widest mt-1">All user submissions have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTracks.map((track) => (
              <div key={track.id} className="p-6 bg-[#0A0A0A] rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-orange-500/20 shadow-xl group">
                
                <div className="flex items-center gap-5 w-full md:w-auto overflow-hidden">
                  <button onClick={() => togglePlay(track.id)} className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all border ${playingId === track.id ? 'bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-[#111] text-gray-600 border-white/10 hover:border-orange-500/50'}`}>
                    {playingId === track.id ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                  </button>
                  <div className="overflow-hidden">
                    <h3 className="font-black text-lg text-white truncate leading-tight uppercase tracking-tight italic">{track.title}</h3>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-1">{track.artist}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <User size={12} className="text-orange-500" />
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">@{track.profiles?.username}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t border-white/5 md:border-0">
                  <button onClick={() => handleApprove(track.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-black font-black text-[10px] rounded-xl hover:bg-orange-400 transition-all shadow-lg active:scale-95 uppercase tracking-widest">
                    <Check size={16} strokeWidth={4} /> Approve
                  </button>
                  <button onClick={() => handleReject(track.id, track.file_url)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-red-500 border border-red-500/20 font-black text-[10px] rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 uppercase tracking-widest">
                    <X size={16} strokeWidth={4} /> Purge
                  </button>
                </div>

                {playingId === track.id && (
                  <audio src={track.file_url} autoPlay onEnded={() => setPlayingId(null)} className="hidden" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="text-center py-10 opacity-30 mt-10">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">
          Admin Suite Handcrafted by <span className="text-white">Dakay</span>
        </p>
      </footer>
    </div>
  )
}