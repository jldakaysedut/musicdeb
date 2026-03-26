import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { 
  Play, Pause, Search, Heart, Radio, Home, MessageSquare, 
  Trophy, User, Mic2, Podcast, Globe, Disc3, Loader2, 
  Wifi, Signal, Zap, Headphones, ChevronRight 
} from 'lucide-react'

// 🎙️ VERIFIED BROADCAST STATIONS (These will ALWAYS work)
const VERIFIED_STATIONS = [
  { 
    id: "v1", 
    title: "Global OPM Radio", 
    artist: "Pinoy Hits Live", 
    file_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
    cover_image: "https://i.scdn.co/image/ab67706f0000000349646c057b54546410cc04f5", 
    genre: "Live Radio" 
  },
  { 
    id: "v2", 
    title: "The Tech Daily", 
    artist: "Future Broadcast", 
    file_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", 
    cover_image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=300&auto=format&fit=crop", 
    genre: "Podcast" 
  },
  { 
    id: "v3", 
    title: "Midnight Mystery", 
    artist: "Storyteller FM", 
    file_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", 
    cover_image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&auto=format&fit=crop", 
    genre: "Stories" 
  }
]

const CATEGORIES = [
  { label: "Verified", query: "verified" },
  { label: "OPM Radio", query: "Tagalog Podcast" },
  { label: "True Crime", query: "True Crime" },
  { label: "Comedy", query: "Comedy Podcast" },
  { label: "Tech News", query: "Technology" }
]

export default function RadioHub() {
  const [stations, setStations] = useState(VERIFIED_STATIONS)
  const [searchQuery, setSearchQuery] = useState('') 
  const [loading, setLoading] = useState(false)
  const [tuningId, setTuningId] = useState(null)
  const [activeTab, setActiveTab] = useState("Verified")
  
  const { currentTrack, isPlaying, playTrack } = useAudio()

  useEffect(() => {
    if (activeTab !== "Verified") {
      fetchBroadcasts(activeTab)
    } else {
      setStations(VERIFIED_STATIONS)
    }
  }, [activeTab])

  const fetchBroadcasts = async (query) => {
    setLoading(true)
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=podcast&limit=20`)
      const json = await res.json()
      if (json.results) {
        const apiStations = json.results.map(s => ({
          id: s.trackId.toString(),
          title: s.trackName,
          artist: s.artistName,
          file_url: s.collectionViewUrl, // Search for preview links
          cover_image: s.artworkUrl600 || s.artworkUrl100,
          genre: s.primaryGenreName
        }))
        setStations(activeTab === "Verified" ? VERIFIED_STATIONS : apiStations)
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleTune = (index) => {
    const target = stations[index]
    setTuningId(target.id)
    
    // 📡 Simulated "Frequency Tuning" effect
    setTimeout(() => {
      playTrack(index, stations)
      setTuningId(null)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-60 selection:bg-orange-500/30">
      
      {/* 📡 BROADCAST HEADER */}
      <header className="max-w-4xl mx-auto p-12 pt-24 text-center relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-500/10 blur-[100px] -z-10"></div>
        
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 bg-orange-500 rounded-[2.2rem] flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.3)]">
            <Radio size={44} className="text-black" />
          </div>
          <div className="absolute -top-2 -right-4 bg-red-600 px-3 py-1 rounded-full border-[4px] border-[#050505] flex items-center gap-1.5">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            <span className="text-[9px] font-black uppercase tracking-tighter italic">Live</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
          Airwave <span className="text-orange-500">Scanner</span>
        </h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-2">
           <Signal size={12} className="text-orange-500"/> Frequency: 102.6 CPS-FM
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-6">
        {/* 🔍 SEARCH & SCAN */}
        <form onSubmit={(e) => { e.preventDefault(); fetchBroadcasts(searchQuery); }} className="mb-12 flex gap-3">
          <div className="relative flex-1 group">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Scan Station or Podcast..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 focus:border-orange-500/40 outline-none font-bold text-sm shadow-2xl transition-all" 
            />
          </div>
          <button type="submit" className="px-10 bg-orange-500 text-black font-black uppercase italic rounded-[2.5rem] hover:bg-orange-400 active:scale-95 transition-all">
            Scan
          </button>
        </form>

        {/* 📟 CATEGORY DIAL */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-12 pb-2">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.label} 
              onClick={() => setActiveTab(cat.label)}
              className={`px-6 py-3.5 rounded-full font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2
              ${activeTab === cat.label ? 'bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'}`}
            >
              {cat.label === "Verified" && <Zap size={14}/>}
              {cat.label}
            </button>
          ))}
        </div>

        {/* 📻 STATION LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 flex items-center gap-3">
              <Headphones size={14} className="text-orange-500"/> Found Frequencies
            </h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-30">
              <Disc3 size={48} className="text-orange-500 animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">Tuning Dial...</p>
            </div>
          ) : (
            stations.map((s, i) => {
              const isActive = currentTrack?.id === s.id;
              const isTuning = tuningId === s.id;
              
              return (
                <div 
                  key={s.id} 
                  onClick={() => handleTune(i)} 
                  className={`p-5 bg-[#0A0A0A] rounded-[2.8rem] flex items-center justify-between border transition-all cursor-pointer group
                  ${isActive ? 'border-orange-500/50 bg-orange-500/10 shadow-[0_15px_40px_rgba(249,115,22,0.1)]' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-6 truncate text-left">
                    <div className="relative w-16 h-16 rounded-[1.8rem] bg-black overflow-hidden shrink-0 shadow-2xl border border-white/5">
                      <img src={s.cover_image} className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         {isTuning ? <Loader2 className="text-orange-500 animate-spin" /> : (isActive && isPlaying ? <Pause className="text-orange-500 fill-orange-500" /> : <Play className="text-white fill-white" />)}
                      </div>
                    </div>
                    
                    <div className="truncate">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-black bg-white/5 text-gray-400 px-2 py-0.5 rounded uppercase border border-white/5">
                          {s.genre}
                        </span>
                        {isActive && isPlaying && <Wifi size={10} className="text-orange-500 animate-pulse" />}
                      </div>
                      <h4 className={`text-base font-black uppercase italic truncate tracking-tight ${isActive ? 'text-orange-500' : 'text-white'}`}>
                        {s.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mt-1 tracking-widest">{s.artist}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl transition-all ${isActive ? 'bg-orange-500 text-black' : 'bg-white/5 text-gray-700 hover:text-white'}`}>
                    {isTuning ? <Loader2 size={20} className="animate-spin" /> : (isActive && isPlaying ? <Pause size={20} /> : <Play size={20} />)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* 🧭 NAVIGATION */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[420px] z-50 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] px-8 py-4 flex justify-between shadow-2xl items-center ring-1 ring-white/10">
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