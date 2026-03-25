import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, Check, X, Play, Pause, Music } from 'lucide-react'

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

    // Check kung Admin nga ba talaga yung naka-login
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
      alert("Access Denied: You are not an admin!")
      navigate('/dashboard')
      return
    }

    fetchPendingTracks()
  }

  const fetchPendingTracks = async () => {
    // Kunin lang yung mga kantang may status na 'pending'
    const { data, error } = await supabase
      .from('tracks')
      .select('*, profiles(username)') // Kukunin din natin yung username ng nag-upload
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (data) setPendingTracks(data)
    setLoading(false)
  }

  const handleApprove = async (id) => {
    const { error } = await supabase.from('tracks').update({ status: 'approved' }).eq('id', id)
    if (!error) fetchPendingTracks() // Refresh list
  }

  const handleReject = async (id, fileUrl) => {
    if (!window.confirm("Are you sure you want to reject and delete this track?")) return
    
    // 1. Delete sa Database
    const { error } = await supabase.from('tracks').delete().eq('id', id)
    if (!error) {
      // 2. Delete sa Storage Bucket
      const fileName = fileUrl.split('/').pop()
      await supabase.storage.from('music-bucket').remove([fileName])
      fetchPendingTracks()
    }
  }

  const togglePlay = (id) => {
    if (playingId === id) {
      setPlayingId(null)
    } else {
      setPlayingId(id)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#090909] flex items-center justify-center text-green-500 font-bold">Verifying Admin Credentials...</div>

  return (
    <div className="min-h-screen bg-[#090909] text-white font-sans p-6 relative pb-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto pt-10 z-10 relative">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={20} /> Back to Vault
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Admin Headquarters.</h1>
        </div>
        <p className="text-gray-400 font-medium mb-10">Review and moderate user uploads before they go public.</p>

        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pending Approvals</span>
          <span className="text-sm font-bold bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333]">{pendingTracks.length} Tracks</span>
        </div>

        {pendingTracks.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] rounded-[2rem] border border-[#222] border-dashed">
            <ShieldAlert size={48} className="mx-auto text-[#333] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
            <p className="text-gray-500 font-medium">No pending tracks to review right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pendingTracks.map((track) => (
              <div key={track.id} className="p-4 bg-[#121212] rounded-3xl border border-[#222] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-[#333] transition-colors">
                
                <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                  <button onClick={() => togglePlay(track.id)} className="w-14 h-14 shrink-0 bg-[#1a1a1a] rounded-2xl flex items-center justify-center hover:bg-green-500/20 hover:text-green-500 transition-colors border border-[#333]">
                    {playingId === track.id ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                  </button>
                  <div className="overflow-hidden pr-4">
                    <h3 className="font-bold text-lg text-white truncate">{track.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    <p className="text-xs text-green-500 font-medium mt-1">Uploaded by: {track.profiles?.username || 'Unknown User'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t border-[#222] md:border-0 pt-4 md:pt-0">
                  <button onClick={() => handleApprove(track.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black font-bold rounded-xl transition-all border border-green-500/20">
                    <Check size={18} strokeWidth={3} /> Approve
                  </button>
                  <button onClick={() => handleReject(track.id, track.file_url)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all border border-red-500/20">
                    <X size={18} strokeWidth={3} /> Reject
                  </button>
                </div>

                {/* Hidden Audio Player for Previewing */}
                {playingId === track.id && (
                  <audio src={track.file_url} autoPlay onEnded={() => setPlayingId(null)} className="hidden" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}