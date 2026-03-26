import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { Play, Pause, Search, Heart, Radio, Home, MessageSquare, Trophy, User, Mic2, Podcast, Globe, Disc3, Loader2, Wifi } from 'lucide-react'

// 🎙️ HIGH-RELIABILITY FEATURED SHOWS (Sure to play immediately)
const FEATURED_STATIONS = [
  { id: "f1", title: "The Daily", artist: "The New York Times", file_url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3", cover_image: "https://static01.nyt.com/images/2017/01/29/podcasts/the-daily-album-art/the-daily-album-art-square320-v4.png", genre: "News" },
  { id: "f2", title: "TED Radio Hour", artist: "NPR", file_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover_image: "https://media.npr.org/assets/img/2018/08/03/ted_radio_hour_sq-97000d0061e3d096d85a06950285b0d879435b89.jpg", genre: "Education" },
  { id: "f3", title: "OPM Top Hits Radio", artist: "Global Pinoy", file_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", cover_image: "https://i.scdn.co/image/ab67706f0000000349646c057b54546410cc04f5", genre: "OPM" }
]

export default function RadioHub() {
  const [stations, setStations] = useState(FEATURED_STATIONS)
  const [searchQuery, setSearchQuery] = useState('') 
  const [loading, setLoading] = useState(false)
  const [bufferingId, setBufferingId] = useState(null) // Para sa loading button logic
  
  const { currentTrack, isPlaying, playTrack } = useAudio()

  const fetchBroadcasts = async (query) => {
    setLoading(true)
    try {
      // 📡 iTunes entity=podcast is reliable for direct media previews
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=podcast&limit=25`)
      const json = await res.json()
      if (json.results) {
        const results = json.results.map(s => ({
          id: s.trackId.toString(),
          title: s.trackName,
          artist: s.artistName,
          file_url: s.collectionViewUrl, // Note: For actual podcasts, this would ideally be an mp3 feed
          preview_url: s.artworkUrl600,
          cover_image: s.artworkUrl600 || s.artworkUrl100,
          genre: s.primaryGenreName
        }))
        setStations([...FEATURED_STATIONS, ...results])
      }
    } catch (err) { console.error("Search failed:", err) }
    setLoading(false)
  }

  const handleTune = async (index, stationList) => {
    setBufferingId(stationList[index].id) // Show loading on this button
    
    // Simulate connection delay para feel na feel ang "Tuning"
    setTimeout(() => {
      playTrack(index, stationList)
      setBufferingId(null)
    }, 800);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-52">
      {/* 📡 ANIMATED HEADER */}
      <header className="max-w-4xl mx-auto p-12 pt-20 flex flex-col items-center">
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-orange-500 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
          <div className="w-24 h-24 bg-orange-500 rounded-[2.5rem] flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(249,115,22,0.3)]">
             <Radio size={48} className="text-black" />
          </div>
          <div className="absolute -top-2 -right-2 bg-red-600 px-3 py-1 rounded-full border-4 border-[#050505] flex items-center gap-1.5 shadow-xl">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            <span className="text-[10px] font-black italic uppercase tracking-tighter">Live</span>
          </div>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-center">Frequency <span className="text-orange-500">Scanner</span></h1>
      </header>

      <main className="max-w-3xl mx-auto px-6">
        {/* 🔍 REAL-TIME SEARCH */}
        <form onSubmit={(e) => { e.preventDefault(); fetchBroadcasts(searchQuery); }} className="mb-12 flex gap-3">
          <div className="relative flex-1 group">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Live Stations, Podcasts, or News..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-[#0F0F0F] rounded-[2.2rem] border border-white/5 focus:border-orange-500/50 outline-none font-bold text-sm shadow-2xl transition-all" 
            />
          </div>
          <button type="submit" className="px-10 bg-orange-500 text-black font-black uppercase italic rounded-[2.2rem] hover:bg-orange-400 active:scale-95 transition-all shadow-lg shadow-orange-500/20">
            Scan
          </button>
        </form>

        {/* 📟 STATION LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 flex items-center gap-3">
              <Globe size={14} className="text-orange-500"/> Signal Strength: 100%
            </h3>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">STEREO</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Disc3 size={48} className="text-orange-500 animate-spin" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Establishing Connection...</p>
            </div>
          ) : (
            stations.map((s, i) => {
              const isActive = currentTrack?.id === s.id;
              const isBuffering = bufferingId === s.id;
              
              return (
                <div 
                  key={s.id} 
                  onClick={() => handleTune(i, stations)} 
                  className={`p-5 bg-[#0A0A0A] rounded-[2.5rem] flex items-center justify-between border transition-all cursor-pointer group hover:scale-[1.02]
                  ${isActive ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-6 truncate">
                    <div className="relative w-16 h-16 rounded-[1.8rem] bg-black overflow-hidden shrink-0 shadow-2xl border border-white/5">
                      <img src={s.cover_image} className={`w-full h-full object-cover transition-transform duration-700 ${isActive && isPlaying ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         {isBuffering ? <Loader2 size={24} className="text-orange-500 animate-spin" /> : (isActive && isPlaying ? <Pause size={24} className="text-orange-500 fill-orange-500" /> : <Play size={24} className="text-white fill-white" />)}
                      </div>
                    </div>
                    <div className="truncate text-left">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[8px] font-black bg-white/5 text-gray-400 px-2 py-0.5 rounded uppercase border border-white/5">
                          {s.genre || 'Broadcast'}
                        </span>
                        {isActive && <Wifi size={10} className="text-orange-500 animate-pulse"/>}
                      </div>
                      <h4 className={`text-base font-black uppercase italic truncate tracking-tight ${isActive ? 'text-orange-500' : 'text-white'}`}>
                        {s.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mt-1 tracking-widest">{s.artist}</p>
                    </div>
                  </div>

                  {/* LOADING / PLAY BUTTON */}
                  <div className={`p-4 rounded-2xl transition-all ${isActive ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-700 hover:text-white'}`}>
                    {isBuffering ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      isActive && isPlaying ? <Pause size={20} /> : <Play size={20} />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* 🧭 NAVIGATION BAR */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[420px] z-50 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] px-8 py-4 flex justify-between shadow-2xl items-center ring-1 ring-white/5">
        <Link to="/dashboard" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><MessageSquare size={24} /></Link>
        
        <Link to="/radio" className="relative group p-5 bg-orange-500 text-black rounded-full -mt-12 border-[6px] border-[#050505] shadow-[0_15px_30px_rgba(249,115,22,0.4)] transition-all">
          <Radio size={28} className={isPlaying ? "animate-pulse" : ""} />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"></div>
        </Link>

        <Link to="/leaderboard" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><User size={24} /></Link>
      </nav>
    </div>
  )
}