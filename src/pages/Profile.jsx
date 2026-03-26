import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext'
import { User, Heart, Trash2, Home, MessageSquare, Trophy, Play, Pause } from 'lucide-react'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [savedTracks, setSavedTracks] = useState([])
  const navigate = useNavigate()
  const { playTrack, currentTrack, isPlaying } = useAudio()

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      
      const { data: vault } = await supabase.from('saved_tracks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (vault) setSavedTracks(vault)
    }
    fetchProfileData()
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-44 relative">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-10 pt-2">
          <h1 className="text-xl font-black italic uppercase tracking-tighter">My <span className="text-orange-500">Vault</span></h1>
          <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="text-red-500 font-black text-[10px] uppercase tracking-widest border border-red-500/20 px-4 py-2 rounded-xl bg-red-500/5 hover:bg-red-500 hover:text-white transition-all">
            Logout
          </button>
        </header>

        <div className="bg-gradient-to-br from-[#0A0A0A] to-[#121212] p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center mb-10 shadow-2xl">
          <div className="w-20 h-20 rounded-full border-2 border-orange-500 bg-orange-500/10 flex items-center justify-center mb-4">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" /> : <User size={40} className="text-orange-500" />}
          </div>
          {/* 🔥 ACTUAL USERNAME DISPLAYER */}
          <h2 className="text-2xl font-black italic uppercase">@{profile?.username || 'Curator'}</h2>
          
          <div className="flex gap-4 mt-4">
            <div className="text-center"><p className="text-orange-500 font-black text-lg">{savedTracks.length}</p><p className="text-[8px] text-gray-500 uppercase tracking-widest">Hearted</p></div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="text-center"><p className="text-orange-500 font-black text-lg">{profile?.download_count || 0}</p><p className="text-[8px] text-gray-500 uppercase tracking-widest">Downloads</p></div>
          </div>
        </div>

        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 px-2 flex items-center gap-2"><Heart size={12} className="text-orange-500"/> Saved Collection</h3>
        
        <div className="space-y-3">
          {savedTracks.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed"><p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Your vault is empty.</p></div>
          ) : (
            savedTracks.map((track, index) => {
              const isPlayingThis = currentTrack?.file_url === track.file_url
              return (
                <div key={track.id} onClick={() => playTrack(index, savedTracks)} className={`p-4 bg-[#0A0A0A] rounded-2xl border flex items-center justify-between group cursor-pointer transition-all ${isPlayingThis ? 'border-orange-500/30 bg-orange-500/5' : 'border-white/5 hover:border-white/10'}`}>
                  <div className="flex items-center gap-4 truncate">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black">
                      <img src={track.cover_image} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                         {isPlayingThis && isPlaying ? <Pause size={18}/> : <Play size={18}/>}
                      </div>
                    </div>
                    <div className="truncate text-left">
                      <h4 className={`font-black uppercase text-sm truncate italic ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>{track.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{track.artist}</p>
                    </div>
                  </div>
                  <button onClick={async (e) => { e.stopPropagation(); await supabase.from('saved_tracks').delete().eq('id', track.id); setSavedTracks(prev => prev.filter(t => t.id !== track.id)) }} className="p-3 bg-white/5 rounded-xl text-gray-700 hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={18}/></button>
                </div>
              )
            })
          )}
        </div>
      </div>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] z-40 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 flex justify-around shadow-2xl items-center">
        <Link to="/dashboard" className="p-2 text-gray-600 hover:text-white transition-colors"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-600 hover:text-white transition-colors"><MessageSquare size={24} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-600 hover:text-white transition-colors"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-orange-500"><User size={24} /></Link>
      </nav>
    </div>
  )
}