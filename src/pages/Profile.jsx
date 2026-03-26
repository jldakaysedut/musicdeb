import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext'
import { User, Heart, Trash2, Home, MessageSquare, Trophy, Play, Pause, Radio, Disc3, ShieldCheck, ChevronLeft } from 'lucide-react'

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

    // 1. Kunin ang profile sa database
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    
    // 🔥 BULLETPROOF USERNAME LOGIC
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
    
    // 2. Kunin ang Vault (Saved Tracks)
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Disc3 className="text-orange-500 animate-spin" size={40} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-52">
      {/* 🔝 TOP NAVIGATION */}
      <header className="max-w-4xl mx-auto p-6 flex justify-between items-center sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-40 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-500 hover:text-black transition-all text-gray-400">
            <ChevronLeft size={20}/>
          </Link>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">My <span className="text-orange-500">Vault</span></h1>
        </div>
        <button 
          onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} 
          className="text-red-500 font-black text-[10px] uppercase tracking-widest border border-red-500/20 px-5 py-2.5 rounded-2xl bg-red-500/5 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
        >
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 mt-10">
        {/* 👤 PROFILE HERO CARD */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#0D0D0D] to-[#0A0A0A] p-10 rounded-[3rem] border border-white/10 flex flex-col items-center mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Animated Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 blur-[80px] rounded-full group-hover:bg-orange-500/20 transition-all duration-700"></div>
          
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-orange-500 bg-orange-500/10 flex items-center justify-center mb-6 overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.2)]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-orange-500" />
              )}
            </div>
            {profile?.role === 'admin' && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1.5 rounded-full border-4 border-[#0A0A0A] shadow-lg">
                <ShieldCheck size={16} className="text-white" />
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1">@{profile?.display_name}</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mb-8">{profile?.email}</p>
          
          {/* STATS ROW */}
          <div className="flex gap-10 w-full justify-center pt-8 border-t border-white/5">
            <div className="text-center group/stat">
              <p className="text-2xl font-black text-orange-500 transition-transform group-hover/stat:scale-110">{savedTracks.length}</p>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Hearted</p>
            </div>
            <div className="w-[1px] h-10 bg-white/10 self-center"></div>
            <div className="text-center group/stat">
              <p className="text-2xl font-black text-orange-500 transition-transform group-hover/stat:scale-110">{profile?.download_count || 0}</p>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Downloads</p>
            </div>
          </div>
        </div>

        {/* 🎵 SAVED COLLECTION LIST */}
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
            <div className="w-8 h-[1px] bg-orange-500/50"></div> Saved Collection
          </h3>
        </div>
        
        <div className="space-y-4">
          {savedTracks.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
              <Heart size={32} className="mx-auto text-gray-800 mb-4" />
              <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest leading-relaxed">
                Your vault is empty.<br/>Go heart some tracks in the radio!
              </p>
              <Link to="/radio" className="inline-block mt-6 px-6 py-3 bg-white/5 hover:bg-orange-500 hover:text-black rounded-xl text-[10px] font-black uppercase transition-all">
                Open Radio
              </Link>
            </div>
          ) : (
            savedTracks.map((track, index) => {
              const isPlayingThis = currentTrack?.file_url === track.file_url
              return (
                <div 
                  key={track.id} 
                  onClick={() => playTrack(index, savedTracks)} 
                  className={`p-4 bg-[#0A0A0A] rounded-[2rem] border flex items-center justify-between group cursor-pointer transition-all hover:scale-[1.01]
                  ${isPlayingThis ? 'border-orange-500/40 bg-orange-500/5 shadow-[0_10px_30px_rgba(249,115,22,0.1)]' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-5 truncate">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-black shadow-lg">
                      <img src={track.cover_image} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                         {isPlayingThis && isPlaying ? <Pause size={20} className="text-orange-500 fill-orange-500" /> : <Play size={20} className="text-white fill-white" />}
                      </div>
                    </div>
                    <div className="truncate text-left">
                      <h4 className={`font-black uppercase text-sm truncate italic tracking-tight ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>
                        {track.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5 tracking-wider">{track.artist}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleRemoveTrack(e, track.id)} 
                    className="p-4 bg-white/5 rounded-2xl text-gray-700 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* 🧭 PREMIUM NAVIGATION BAR */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[420px] z-50 bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] px-8 py-4 flex justify-between shadow-2xl items-center ring-1 ring-white/5">
        <Link to="/dashboard" className="p-2 text-gray-500 hover:text-orange-400 transition-all hover:scale-110"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-500 hover:text-orange-400 transition-all hover:scale-110"><MessageSquare size={24} /></Link>
        
        {/* CENTER FLOATING RADIO */}
        <Link to="/radio" className="relative group p-5 bg-orange-500 text-black rounded-full -mt-12 border-[6px] border-[#050505] shadow-[0_15px_30px_rgba(249,115,22,0.4)] transition-all hover:scale-110 hover:shadow-orange-500/60 active:scale-90">
          <Radio size={28} />
        </Link>

        <Link to="/leaderboard" className="p-2 text-gray-500 hover:text-orange-400 transition-all hover:scale-110"><Trophy size={24} /></Link>
        
        {/* ACTIVE PROFILE TAB */}
        <Link to="/profile" className="p-2 text-orange-500 transition-all hover:scale-110 relative">
          <User size={24} />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
        </Link>
      </nav>
    </div>
  )
}