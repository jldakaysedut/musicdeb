import { useState } from 'react'
import { useAudio } from '../context/AudioContext'
import { Play, Pause, SkipForward, SkipBack, ListMusic, X, Disc3 } from 'lucide-react'

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrev, queue } = useAudio()
  const [showQueue, setShowQueue] = useState(false)

  // Kung walang nag-pe-play na kanta, itago ang radio
  if (!currentTrack) return null

  return (
    <>
      {/* 📜 UP NEXT QUEUE PANEL */}
      {showQueue && (
        <div className="fixed bottom-[180px] left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] z-40 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><ListMusic size={14}/> Up Next</h3>
            <button onClick={() => setShowQueue(false)} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-full"><X size={14}/></button>
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-2 no-scrollbar">
            {queue?.map((track, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-2 rounded-xl ${currentTrack.file_url === track.file_url ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-white/5'}`}>
                <img src={track.cover_image} className="w-8 h-8 rounded-md object-cover" />
                <div className="truncate flex-1">
                  <p className={`text-[10px] font-black uppercase italic truncate ${currentTrack.file_url === track.file_url ? 'text-orange-500' : 'text-white'}`}>{track.title}</p>
                  <p className="text-[8px] font-bold text-gray-500 uppercase">{track.artist}</p>
                </div>
                {currentTrack.file_url === track.file_url && <Disc3 size={12} className="text-orange-500 animate-spin mr-2"/>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📻 MAIN FLOATING RADIO BAR */}
      <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-[92%] md:w-[420px] z-50 bg-[#141414]/90 backdrop-blur-2xl border border-orange-500/30 rounded-[2rem] p-3 flex items-center justify-between shadow-[0_0_40px_rgba(249,115,22,0.15)] transition-all">
        
        {/* Cover & Info (Clickable para lumabas ang Queue) */}
        <div className="flex items-center gap-3 truncate flex-1 cursor-pointer" onClick={() => setShowQueue(!showQueue)}>
          <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-orange-500/50 ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <img src={currentTrack.cover_image} className="w-full h-full object-cover" />
          </div>
          <div className="truncate text-left">
            <h4 className="text-[11px] font-black uppercase italic text-white truncate">{currentTrack.title}</h4>
            <p className="text-[9px] text-orange-500 uppercase font-bold tracking-widest flex items-center gap-1">
              <Disc3 size={10} className={isPlaying ? 'animate-spin' : ''} /> Now Playing
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {playPrev && (
            <button onClick={playPrev} className="p-3 text-gray-400 hover:text-white transition-colors active:scale-90"><SkipBack size={18} fill="currentColor" /></button>
          )}
          <button onClick={togglePlay} className="p-4 bg-orange-500 text-black rounded-2xl hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/20">
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          {playNext && (
            <button onClick={playNext} className="p-3 text-gray-400 hover:text-white transition-colors active:scale-90"><SkipForward size={18} fill="currentColor" /></button>
          )}
        </div>
      </div>
    </>
  )
}