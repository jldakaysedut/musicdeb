import { useEffect, useRef } from 'react'
import { useAudio } from '../context/AudioContext'
import { supabase } from '../supabaseClient'
import { Play, Pause, SkipBack, SkipForward, Volume2, Disc3 } from 'lucide-react'

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, progress, duration, seek } = useAudio()
  
  // ⏱️ HEARTBEAT LOGIC: Update DB every 30 seconds of listening
  useEffect(() => {
    let interval;
    if (isPlaying && currentTrack) {
      interval = setInterval(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: prof } = await supabase.from('profiles').select('total_listening_time').eq('id', user.id).single()
          await supabase.from('profiles')
            .update({ total_listening_time: (prof?.total_listening_time || 0) + 30 })
            .eq('id', user.id)
        }
      }, 30000); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-[94%] md:w-[450px] bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4">
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
        <img src={currentTrack.cover_image} className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse' : ''}`} />
      </div>
      <div className="flex-1 truncate">
        <h4 className="text-[11px] font-black uppercase italic truncate text-orange-500">{currentTrack.title}</h4>
        <p className="text-[9px] text-gray-500 font-bold uppercase truncate">{currentTrack.artist}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors"><SkipBack size={18}/></button>
        <button onClick={togglePlay} className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-black hover:scale-105 transition-all">
          {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
        </button>
        <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors"><SkipForward size={18}/></button>
      </div>
    </div>
  )
}