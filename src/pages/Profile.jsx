import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAudio } from '../context/AudioContext'
import { User, Music, Trash2, Disc3 } from 'lucide-react'

export default function Profile() {
  const [savedTracks, setSavedTracks] = useState([])
  const { playTrack } = useAudio()

  useEffect(() => {
    const fetchVault = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('saved_tracks').select('*').eq('user_id', user.id)
      if (data) setSavedTracks(data)
    }
    fetchVault()
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-40">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black italic uppercase mb-10">My <span className="text-orange-500">Heart Vault</span></h1>
        
        <div className="space-y-3">
          {savedTracks.map((track, index) => (
            <div key={track.id} onClick={() => playTrack(index, savedTracks)} className="p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4 truncate">
                <img src={track.cover_image} className="w-10 h-10 rounded-lg object-cover" />
                <div className="truncate"><h4 className="font-black uppercase text-sm truncate">{track.title}</h4><p className="text-[10px] text-gray-500 uppercase">{track.artist}</p></div>
              </div>
              <button onClick={async (e) => { e.stopPropagation(); await supabase.from('saved_tracks').delete().eq('id', track.id); setSavedTracks(prev => prev.filter(t => t.id !== track.id)) }} className="p-3 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}