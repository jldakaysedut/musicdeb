import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext'
import { 
  User, Music, Trash2, Home, MessageSquare, 
  Trophy, LogOut, Disc3, Play, Pause, Download, ChevronLeft
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

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(profileData)

    const { data: tracksData } = await supabase
      .from('saved_tracks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (tracksData) setSavedTracks(tracksData)
    setLoading(false)
  }

  const handleRemove = async (e, id) => {
    e.stopPropagation() 
    if (!window.confirm("Remove this from your vault?")) return
    setSavedTracks(prev => prev.filter(t => t.id !== id))
    await supabase.from('saved_tracks').delete().eq('id', id)
  }

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Disc3 className="animate-spin text-orange-500" /></div>

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-40 relative selection:bg-orange-500">
      <div className="max-w-3xl mx-auto p-6 relative z-10">
        
        <header className="flex justify-between items-center mb-10 pt-4">
          <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-500 transition-all text-gray-400 hover:text-black">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">My <span className="text-orange-500">Vault</span></h1>
          <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={20} />
          </button>
        </header>

        <div className="p-8 bg-gradient-to-br from-[#0A0A0A] to-[#141414] border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 mb-12 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.2)]">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User size={40} className="text-orange-500" />}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">@{profile?.username || 'User'}</h2>
            <div className="flex gap-2 mt-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500 border border-white/5">Member Since 2026</span>
              <span className="px-3 py-1 bg-orange-500/10 rounded-full text-[9px] font-black uppercase tracking-widest text-orange-500 border border-orange-500/20 flex items-center gap-1"><Music size={10}/> {savedTracks.length} Tracks</span>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          {savedTracks.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
              <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">No tracks saved yet.</p>
            </div>
          ) : (
            savedTracks.map((track, index) => {
              const isPlayingThis = currentTrack?.file_url === track.file_url
              return (
                <div key={track.id} onClick={() => isPlayingThis ? togglePlay() : playTrack(index, savedTracks)}
                  className={`p-3 bg-[#0A0A0A] rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isPlayingThis ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5 hover:border-white/10'}`}>
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/5 bg-black">
                      <img src={track.cover_image} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isPlayingThis && isPlaying ? <Pause size={18}/> : <Play size={18}/>}
                      </div>
                    </div>
                    <div className="truncate">
                      <h4 className={`text-sm font-black truncate uppercase italic ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>{track.title}</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a href={track.file_url} target="_blank" onClick={e => e.stopPropagation()} className="p-3 text-gray-600 hover:text-white transition-colors"><Download size={18}/></a>
                    <button onClick={e => handleRemove(e, track.id)} className="p-3 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              )
            })
          )}
        </section>
      </div>

      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 flex justify-around items-center shadow-2xl">
        <Link to="/dashboard" className="p-2 text-gray-600"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-600"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-600"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-orange-500"><User size={22} /></Link>
      </nav>
    </div>
  )
}