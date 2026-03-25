import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, Check, X, Play, Pause, LogOut, Music, User, Home, LayoutGrid } from 'lucide-react'

export default function Admin() {
  const [pendingTracks, setPendingTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState(null)
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

    fetchPendingTracks()
  }

  const fetchPendingTracks = async () => {
    const { data } = await supabase
      .from('tracks')
      .select('*, profiles(username)') 
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (data) setPendingTracks(data)
    setLoading(false)
  }

  const handleApprove = async (id) => {
    const { error } = await supabase.from('tracks').update({ status: 'approved' }).eq('id', id)
    if (!error) fetchPendingTracks() 
  }

  const handleReject = async (id, fileUrl) => {
    if (!window.confirm("Permanent Action: Reject and purge this track?")) return
    const { error } = await supabase.from('tracks').delete().eq('id', id)
    if (!error) {
      const fileName = fileUrl.split('/').pop()
      await supabase.storage.from('music-bucket').remove([fileName])
      fetchPendingTracks()
    }
  }

  const togglePlay = (id) => {
    setPlayingId(playingId === id ? null : id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Authorizing Admin...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-40 relative overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* Background Authority Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto pt-10 z-10 relative">
        
        {/* Admin Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-500 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <ShieldAlert size={32} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tightest uppercase italic">Admin <span className="text-orange-500">HQ</span></h1>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Review and moderate user uploads.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
              <ArrowLeft size={14} /> Music Vault
            </Link>
            <button onClick={handleLogout} className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              Logoff
            </button>
          </div>
        </header>

        {/* Pending Queue Stats */}
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Incoming Submission Queue</span>
          <span className="text-[10px] font-black bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full border border-orange-500/20 tracking-widest">
            {pendingTracks.length} PENDING
          </span>
        </div>

        {/* Moderation List */}
        {pendingTracks.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Queue Empty</h3>
            <p className="text-gray-500 font-bold text-sm">All user submissions have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTracks.map((track) => (
              <div key={track.id} className="p-5 bg-white/[0.03] rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-white/10 shadow-xl group">
                
                <div className="flex items-center gap-5 w-full md:w-auto overflow-hidden">
                  <button onClick={() => togglePlay(track.id)} className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all border ${playingId === track.id ? 'bg-orange-500 text-black border-orange-500' : 'bg-[#111] text-gray-600 border-white/10 hover:border-orange-500/50'}`}>
                    {playingId === track.id ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                  </button>
                  <div className="overflow-hidden">
                    <h3 className="font-black text-lg text-white truncate leading-tight uppercase tracking-tight">{track.title}</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">{track.artist}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <User size={12} className="text-orange-500" />
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">@{track.profiles?.username}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-4 md:pt-0 border-t border-white/5 md:border-0">
                  <button onClick={() => handleApprove(track.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-black font-black text-xs rounded-xl hover:bg-orange-400 transition-all shadow-lg active:scale-95 uppercase tracking-widest">
                    <Check size={16} strokeWidth={4} /> Approve
                  </button>
                  <button onClick={() => handleReject(track.id, track.file_url)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white/5 text-red-500 border border-red-500/20 font-black text-xs rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 uppercase tracking-widest">
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

      {/* Signature Branding */}
      <footer className="text-center py-10 opacity-30 mt-10">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">
          Admin Suite Handcrafted by <span className="text-white">Dakay</span>
        </p>
      </footer>
    </div>
  )
}