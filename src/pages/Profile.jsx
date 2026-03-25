import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext'
import { 
  User, Music, Trash2, Home, MessageSquare, 
  Trophy, LogOut, Disc3, Play, Pause, Download
} from 'lucide-react'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [savedTracks, setSavedTracks] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }

    // 1. Fetch User Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    setProfile(profileData)

    // 2. Fetch User's Saved Tracks (from our new hybrid table)
    const { data: tracksData } = await supabase
      .from('saved_tracks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (tracksData) setSavedTracks(tracksData)
    setLoading(false)
  }

  // --- REMOVE FUNCTION ---
  const handleRemove = async (e, id) => {
    e.stopPropagation() // Prevent playing the song when clicking delete
    if (!window.confirm("Remove this track from your personal vault?")) return

    // Optimistic UI Update
    setSavedTracks(prev => prev.filter(t => t.id !== id))

    try {
      const { error } = await supabase.from('saved_tracks').delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error("Remove failed:", error.message)
      fetchUserData() // Re-sync if failed
    }
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
            <div className="w-24 h-24 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(249,115,22,0.2)] overflow-hidden">
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
                  {profile?.role === 'admin' ? 'Administrator' : 'Verified Listener'}
                </span>
                <span className="text-[10px] font-black bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full uppercase tracking-widest border border-orange-500/20 flex items-center gap-1">
                  <Music size={12} /> {savedTracks.length} Saved
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* SAVED TRACKS COLLECTION */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Your Collection</h3>
          </div>

          <div className="space-y-3">
            {savedTracks.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
                <Disc3 size={32} className="mx-auto text-gray-800 mb-4" />
                <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Your vault is empty.</p>
                <Link to="/dashboard" className="inline-block mt-4 px-6 py-3 bg-orange-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all">Explore Network</Link>
              </div>
            ) : (
              savedTracks.map((track, index) => {
                const isPlayingThis = currentTrack?.file_url === track.file_url

                return (
                  <div key={track.id} onClick={() => isPlayingThis ? togglePlay() : playTrack(index, savedTracks)}
                    className={`p-4 bg-[#0A0A0A] rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between gap-5 hover:border-white/10 shadow-xl group ${isPlayingThis ? 'border-orange-500/30 bg-orange-500/5' : 'border-white/5'}`}>
                    
                    <div className="flex items-center gap-4 overflow-hidden">
                      {/* Album Art Cover */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#111]">
                        <img src={track.cover_image || '/api/placeholder/56/56'} alt="cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isPlayingThis && isPlaying ? <Pause size={20} className="text-white drop-shadow-lg" fill="currentColor" /> : <Play size={20} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-lg" fill="currentColor" />}
                        </div>
                      </div>

                      <div className="truncate">
                        <h4 className={`font-black text-sm truncate uppercase italic ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>{track.title}</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{track.artist}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 z-10">
                      {track.file_url && (
                        <a 
                          href={track.file_url} // Using file_url as fallback if download_url isn't saved
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()} 
                          className="p-3 rounded-xl bg-transparent text-gray-500 hover:text-white hover:bg-white/5 transition-all hidden md:flex"
                        >
                          <Download size={18} />
                        </a>
                      )}
                      <button onClick={(e) => handleRemove(e, track.id)} className="p-3 rounded-xl bg-transparent text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>

                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

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