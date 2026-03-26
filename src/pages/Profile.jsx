import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext'
import { 
  User, Heart, Trash2, Home, MessageSquare, 
  Trophy, Play, Pause, Radio, Disc3, 
  ShieldCheck, ChevronLeft, LogOut, Activity, Star 
} from 'lucide-react'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [savedTracks, setSavedTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  const { playTrack, currentTrack, isPlaying } = useAudio()

  useEffect(() => {
    fetchProfileData()
  }, [navigate])

  const fetchProfileData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      navigate('/login')
      return
    }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    
    // Friendly Username Logic
    const realUsername = prof?.username 
      || user?.user_metadata?.username 
      || user?.user_metadata?.full_name 
      || user?.email?.split('@')[0] 
      || 'Curator'

    setProfile({ 
      ...prof, 
      display_name: realUsername, 
      email: user.email,
      role: prof?.role || 'user'
    })
    
    const { data: vault } = await supabase
      .from('saved_tracks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (vault) setSavedTracks(vault)
    setLoading(false)
  }

  const handleRemoveTrack = async (e, trackId) => {
    e.stopPropagation()
    const { error } = await supabase.from('saved_tracks').delete().eq('id', trackId)
    if (!error) {
      setSavedTracks(prev => prev.filter(t => t.id !== trackId))
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <Disc3 className="text-orange-500 animate-spin" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Loading Vault...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 font-sans pb-52">
      
      {/* 🔝 MINIMAL STICKY HEADER */}
      <header className="max-w-4xl mx-auto p-6 flex justify-between items-center sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-50 border-b border-white/[0.03]">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-orange-500 hover:text-black transition-all active:scale-90">
            <ChevronLeft size={20}/>
          </Link>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">My <span className="text-orange-500">Vault</span></h1>
        </div>
        <button 
          onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} 
          className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/10 hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 mt-8">
        
        {/* 👤 PROFILE CARD (Eco-Minimalist Style) */}
        <div className="relative bg-[#0A0A0A] p-8 rounded-[3rem] border border-white/5 flex flex-col items-center mb-12 shadow-2xl overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/5 blur-[100px] rounded-full"></div>
          
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-[2.5rem] bg-black flex items-center justify-center border-4 border-orange-500/20 overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.1)]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-orange-500" />
              )}
            </div>
            {profile?.role === 'admin' && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 p-2 rounded-full border-[4px] border-[#0A0A0A] shadow-xl">
                <ShieldCheck size={14} className="text-white" />
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1">@{profile?.display_name}</h2>
          <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em] mb-10">{profile?.email}</p>
          
          {/* STATS ROW (Thumb-Friendly spacing) */}
          <div className="grid grid-cols-2 w-full gap-4 pt-8 border-t border-white/[0.03]">
            <div className="bg-white/[0.02] border border-white/[0.03] p-5 rounded-[2rem] text-center">
              <p className="text-2xl font-black text-orange-500">{savedTracks.length}</p>
              <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Favorites</p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.03] p-5 rounded-[2rem] text-center">
              <p className="text-2xl font-black text-orange-500">{profile?.download_count || 0}</p>
              <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Total Hits</p>
            </div>
          </div>
        </div>

        {/* 🎵 SAVED COLLECTION LIST (Bento Style) */}
        <div className="flex items-center gap-4 px-2 mb-8 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] whitespace-nowrap">Your Collection</p>
            <div className="h-[1px] flex-1 bg-white/10"></div>
        </div>
        
        <div className="space-y-4">
          {savedTracks.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.01] rounded-[3rem] border border-white/[0.03] border-dashed">
              <Star size={32} className="mx-auto text-gray-800 mb-4" />
              <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest leading-relaxed">
                Vault Empty.<br/>Heart some tracks to fill it up!
              </p>
              <Link to="/radio" className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-orange-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                Go to Radio
              </Link>
            </div>
          ) : (
            savedTracks.map((track, index) => {
              const isPlayingThis = currentTrack?.file_url === track.file_url
              return (
                <div 
                  key={track.id} 
                  onClick={() => playTrack(index, savedTracks)} 
                  className={`p-4 bg-[#0A0A0A] rounded-[2.2rem] border flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98]
                  ${isPlayingThis ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-5 truncate">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-black border border-white/5">
                      <img src={track.cover_image} className="w-full h-full object-cover opacity-80 transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                         {isPlayingThis && isPlaying ? <Pause size={20} className="text-orange-500 fill-orange-500" /> : <Play size={20} className="text-white fill-white" />}
                      </div>
                    </div>
                    <div className="truncate text-left">
                      <h4 className={`font-black uppercase text-sm truncate italic tracking-tight ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>
                        {track.title}
                      </h4>
                      <p className="text-[10px] text-gray-600 font-bold uppercase mt-1 tracking-wider">{track.artist}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleRemoveTrack(e, track.id)} 
                    className="p-4 bg-white/5 rounded-2xl text-gray-800 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* 🧭 PREMIUM NAVIGATION BAR (Consistent with other pages) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[420px] z-50 bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] px-8 py-4 flex justify-between shadow-2xl items-center ring-1 ring-white/5">
        <Link to="/dashboard" className="p-2 text-gray-600 hover:text-orange-400 transition-all active:scale-110"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-600 hover:text-orange-400 transition-all active:scale-110"><MessageSquare size={24} /></Link>
        
        <Link to="/radio" className="relative group p-5 bg-orange-500 text-black rounded-full -mt-12 border-[6px] border-[#050505] shadow-[0_15px_40px_rgba(249,115,22,0.4)] transition-all hover:scale-110 active:scale-90">
          <Radio size={28} />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
        </Link>

        <Link to="/leaderboard" className="p-2 text-gray-600 hover:text-orange-400 transition-all active:scale-110"><Trophy size={24} /></Link>
        
        <Link to="/profile" className="p-2 text-orange-500 transition-all relative scale-110">
          <User size={24} />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_10px_#F97316]"></div>
        </Link>
      </nav>

      {/* 🏁 SYSTEM FOOTER */}
      <footer className="mt-20 py-10 opacity-10 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.8em]">JamList Vault Interface • 2026</p>
      </footer>
    </div>
  )
}