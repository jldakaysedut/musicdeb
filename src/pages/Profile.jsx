import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { useAudio } from '../context/AudioContext'
import { User, Music, Trash2, Disc3, ChevronLeft, Heart } from 'lucide-react'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [savedTracks, setSavedTracks] = useState([])
  const { playTrack, togglePlay, currentTrack, isPlaying } = useAudio()

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(prof)
        const { data: vault } = await supabase.from('saved_tracks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (vault) setSavedTracks(vault)
      }
    }
    fetchProfileData()
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-40">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-12 pt-4">
          <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-500 transition-all text-gray-400 hover:text-black"><ChevronLeft size={20}/></Link>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">My <span className="text-orange-500 text-stroke-white">Vault</span></h1>
          <div className="w-10"></div>
        </header>

        {/* User Card */}
        <div className="p-8 bg-gradient-to-br from-[#0A0A0A] to-[#121212] rounded-[2.5rem] border border-white/5 flex items-center gap-6 mb-16 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center overflow-hidden">
             {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover"/> : <User size={32} className="text-orange-500"/>}
          </div>
          <div>
            <h2 className="text-2xl font-black italic uppercase">@{profile?.username || 'Curator'}</h2>
            <div className="flex gap-3 mt-2">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500 border border-white/5 flex items-center gap-1"><Heart size={10} className="text-orange-500"/> {savedTracks.length} Saved</span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500 border border-white/5">Member 2026</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 flex items-center gap-2 px-2"><Music size={12}/> Collection</h3>
          {savedTracks.map((track, index) => {
            const isPlayingThis = currentTrack?.file_url === track.file_url
            return (
              <div key={track.id} onClick={() => isPlayingThis ? togglePlay() : playTrack(index, savedTracks)} 
                className={`p-4 bg-[#0A0A0A] rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${isPlayingThis ? 'border-orange-500/30' : 'border-white/5 hover:border-white/10'}`}>
                <div className="flex items-center gap-4 truncate">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black">
                    <img src={track.cover_image} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       {isPlayingThis && isPlaying ? <Pause size={18}/> : <Play size={18}/>}
                    </div>
                  </div>
                  <div className="truncate w-full">
                    <h4 className={`text-sm font-black uppercase italic truncate ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>{track.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{track.artist}</p>
                  </div>
                </div>
                <button onClick={async (e) => { e.stopPropagation(); await supabase.from('saved_tracks').delete().eq('id', track.id); setSavedTracks(prev => prev.filter(t => t.id !== track.id)) }} 
                  className="p-3 text-gray-700 hover:text-red-500 transition-colors bg-white/5 rounded-xl"><Trash2 size={18}/></button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}