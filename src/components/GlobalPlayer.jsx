import { useAudio } from '../context/AudioContext'
import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react'

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, progress, togglePlay, playNext, playPrev } = useAudio()

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-10">
      
      {/* Top Edge Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5 rounded-t-[2rem] overflow-hidden">
        <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="flex items-center justify-between gap-4 mt-2">
        
        {/* Track Info & API Cover Art */}
        <div className="flex items-center gap-4 overflow-hidden w-1/2">
          <div className="w-14 h-14 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center shrink-0 shadow-lg overflow-hidden relative group">
            {currentTrack.cover_image ? (
              <img src={currentTrack.cover_image} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <Music size={20} className="text-orange-500" />
            )}
            {/* Cool pulsing overlay when playing */}
            {isPlaying && <div className="absolute inset-0 bg-orange-500/10 animate-pulse"></div>}
          </div>
          
          <div className="truncate">
            <h4 className="text-sm font-black truncate uppercase italic tracking-tight text-white">{currentTrack.title}</h4>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-5 pr-2">
          <button onClick={playPrev} className="text-gray-500 hover:text-white transition-colors active:scale-90"><SkipBack size={22} fill="currentColor" /></button>
          
          <button onClick={togglePlay} className="w-14 h-14 bg-orange-500 text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-90 transition-transform hover:scale-105">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          
          <button onClick={playNext} className="text-gray-500 hover:text-white transition-colors active:scale-90"><SkipForward size={22} fill="currentColor" /></button>
        </div>
      </div>
    </div>
  )
}