import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAudio } from '../context/AudioContext'
import { User, Music, Trash2, Heart, Disc3 } from 'lucide-react'

export default function Profile() {
  const [savedTracks, setSavedTracks] = useState([])
  const [profile, setProfile] = useState(null)
  const { playTrack, togglePlay, currentTrack, isPlaying } = useAudio()

  useEffect(() => {
    fetchProfileAndVault()
  }, [])

  const fetchProfileAndVault = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      const { data: vault } = await supabase.from('saved_tracks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (vault) setSavedTracks(vault)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-40">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-12 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
          <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center mb-4">
            <User size={32} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-black italic uppercase">@{profile?.username || 'Curator'}</h2>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">{savedTracks.length} Saved in Vault</p>
        </div>

        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 flex items-center gap-2"><Heart size={12}/> Hearted Tracks</h3>
        <div className="space-y-3">
          {savedTracks.map((track, index) => {
            const isPlayingThis = currentTrack?.file_url === track.file_url
            return (
              <div key={track.id} onClick={() => isPlayingThis ? togglePlay() : playTrack(index, savedTracks)} 
                className={`p-4 bg-[#0A0A0A] rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isPlayingThis ? 'border-orange-500/30 bg-orange-500/5' : 'border-white/5 hover:border-white/10'}`}>
                <div className="flex items-center gap-4 truncate">
                  <img src={track.cover_image} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="truncate text-left">
                    <h4 className={`text-sm font-black uppercase italic truncate ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>{track.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{track.artist}</p>
                  </div>
                </div>
                <button onClick={async (e) => { e.stopPropagation(); await supabase.from('saved_tracks').delete().eq('id', track.id); setSavedTracks(prev => prev.filter(t => t.id !== track.id)) }} 
                  className="p-3 text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}