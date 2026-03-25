import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { 
  User, Music, Edit2, Trash2, CheckCircle2, Clock, 
  Home, MessageSquare, Trophy, LogOut, X, Disc3, Save 
} from 'lucide-react'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [myTracks, setMyTracks] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit Modal State
  const [editingTrack, setEditingTrack] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editArtist, setEditArtist] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }

    // 1. Kunin ang profile info
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    setProfile(profileData)

    // 2. Kunin lang ang mga kanta na in-upload ng user na ito
    const { data: tracksData } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (tracksData) setMyTracks(tracksData)
    setLoading(false)
  }

  // --- DELETE FUNCTION (Purge from DB and Storage) ---
  const handleDelete = async (id, fileUrl) => {
    if (!window.confirm("Are you sure you want to permanently delete this track from your vault?")) return

    // Optimistic UI Update
    setMyTracks(prev => prev.filter(t => t.id !== id))

    try {
      // Burahin ang kanta sa Database
      const { error: dbError } = await supabase.from('tracks').delete().eq('id', id)
      if (dbError) throw dbError

      // Extract filename at burahin sa Storage
      const fileName = fileUrl.split('/').pop()
      await supabase.storage.from('music-bucket').remove([fileName])
      
    } catch (error) {
      console.error("Delete failed:", error.message)
      fetchUserData() // Re-sync if failed
    }
  }

  // --- UPDATE FUNCTION (Edit Title & Artist) ---
  const openEditModal = (track) => {
    setEditingTrack(track)
    setEditTitle(track.title)
    setEditArtist(track.artist)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    const { error } = await supabase
      .from('tracks')
      .update({ title: editTitle, artist: editArtist })
      .eq('id', editingTrack.id)

    if (!error) {
      // Update local state without refreshing
      setMyTracks(prev => prev.map(t => 
        t.id === editingTrack.id ? { ...t, title: editTitle, artist: editArtist } : t
      ))
      setEditingTrack(null)
    } else {
      alert("Failed to update track details.")
    }
    setIsSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-40 relative overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* Background Aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto p-6 z-10 relative">
        
        {/* HEADER & PROFILE CARD */}
        <header className="mb-10 pt-4">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Personal <span className="text-orange-500">Vault</span></h1>
            <button onClick={handleLogout} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90 hidden md:flex">
              <LogOut size={18} />
            </button>
          </div>

          <div className="p-8 bg-gradient-to-br from-[#0A0A0A] to-[#111] border border-white/10 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
            <div className="w-24 h-24 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <User size={40} className="text-orange-500" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">@{profile?.username || 'Curator'}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-black bg-white/5 text-gray-400 px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
                  {profile?.role === 'admin' ? 'Administrator' : 'Verified Curator'}
                </span>
                <span className="text-[10px] font-black bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full uppercase tracking-widest border border-orange-500/20 flex items-center gap-1">
                  <Music size={12} /> {myTracks.length} Uploads
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* MY TRACKS MANAGER */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Track Management</h3>
          </div>

          <div className="space-y-4">
            {myTracks.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
                <Disc3 size={32} className="mx-auto text-gray-800 mb-4" />
                <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Your studio is empty.</p>
                <Link to="/dashboard" className="inline-block mt-4 px-6 py-3 bg-orange-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all">Go Upload</Link>
              </div>
            ) : (
              myTracks.map(track => (
                <div key={track.id} className="p-5 bg-[#0A0A0A] rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-white/10 shadow-xl group">
                  
                  {/* Track Info */}
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-[#111] rounded-xl flex items-center justify-center shrink-0 border border-white/5 text-gray-600">
                      <Music size={20} />
                    </div>
                    <div className="truncate">
                      <h4 className="font-black text-sm text-white truncate uppercase italic">{track.title}</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{track.artist}</p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t border-white/5 md:border-0 pt-4 md:pt-0">
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white/[0.02] border-white/5">
                      {track.status === 'approved' ? (
                        <><CheckCircle2 size={12} className="text-green-500" /> <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Live</span></>
                      ) : (
                        <><Clock size={12} className="text-orange-500" /> <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Pending</span></>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(track)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(track.id, track.file_url)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* EDIT MODAL */}
      {editingTrack && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm p-8 rounded-[2.5rem] relative shadow-2xl">
            <button onClick={() => setEditingTrack(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-2 tracking-tighter italic uppercase">Edit <span className="text-orange-500">Track.</span></h2>
            <form onSubmit={handleUpdate} className="space-y-4 mt-6">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Track Title</label>
                <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 focus:border-orange-500 outline-none text-sm font-bold text-white placeholder-gray-800" />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Artist Name</label>
                <input type="text" required value={editArtist} onChange={(e) => setEditArtist(e.target.value)} className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 focus:border-orange-500 outline-none text-sm font-bold text-white placeholder-gray-800" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-5 mt-4 bg-orange-500 text-black font-black rounded-2xl hover:bg-orange-400 disabled:opacity-50 transition-all shadow-lg text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                {isSaving ? 'UPDATING...' : <><Save size={18} /> SAVE CHANGES</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex justify-around items-center">
        <Link to="/dashboard" className="p-2 text-gray-600"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-600"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-600"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-orange-500"><User size={22} /></Link>
      </nav>

      {/* FOOTER */}
      <footer className="hidden md:block absolute bottom-8 right-12 opacity-30">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 italic">
          Designed by <span className="text-white">Dakay</span>
        </p>
      </footer>
    </div>
  )
}