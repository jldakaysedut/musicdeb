import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { 
  Play, Pause, Search, Heart, Radio, Home, MessageSquare, 
  Trophy, User, Disc3, Loader2, Wifi, Signal, Zap, 
  Headphones, ChevronLeft, Globe, Sparkles, Activity
} from 'lucide-react'

// 📻 ON-AIR ORIGINALS (Verified Live Streams)
const VERIFIED_STATIONS = [
  { id: "live-1", title: "BBC World Service", artist: "Live News • London", file_url: "https://stream.live.vc.bbc.co.uk/bbc_world_service_mp3", cover_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/BBC_World_Service.svg/1200px-BBC_World_Service.svg.png", genre: "News" },
  { id: "live-2", title: "NPR Program Stream", artist: "Public Radio • USA", file_url: "https://npr-ice.streamguys1.com/live.mp3", cover_image: "https://media.npr.org/assets/img/2018/08/03/npr_logo_sq-97000d0061e3d096d85a06950285b0d879435b89.jpg", genre: "Talk" },
  { id: "live-3", title: "Jazz FM Global", artist: "Live Jazz • Digital", file_url: "https://pureplay.cdnstream1.com/6022_128.mp3", cover_image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=300&auto=format&fit=crop", genre: "Jazz" },
  { id: "live-4", title: "Dance Wave", artist: "Electronic • Hungary", file_url: "https://dancewave.online/dance.mp3", cover_image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop", genre: "Dance" }
]

const CATEGORIES = [
  { label: "Verified", query: "" },
  { label: "Manila FM", query: "Philippines" },
  { label: "Top Global", query: "Top" },
  { label: "News Live", query: "News" },
  { label: "Jazz & Chill", query: "Jazz" }
]

export default function RadioHub() {
  const [stations, setStations] = useState(VERIFIED_STATIONS)
  const [searchQuery, setSearchQuery] = useState('') 
  const [loading, setLoading] = useState(false)
  const [tuningId, setTuningId] = useState(null)
  const [activeTab, setActiveTab] = useState("Verified")
  
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  useEffect(() => {
    if (activeTab === "Verified") {
      setStations(VERIFIED_STATIONS)
    } else {
      const selected = CATEGORIES.find(c => c.label === activeTab)
      fetchLiveRadios(selected.query)
    }
  }, [activeTab])

  const fetchLiveRadios = async (query) => {
    setLoading(true)
    try {
      // 📡 Connecting to the Global Radio Browser API for LIVE stations
      const res = await fetch(`https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(query)}?limit=30`)
      const data = await res.json()
      
      if (data) {
        const liveStations = data.map(s => ({
          id: s.stationuuid,
          title: s.name.trim(),
          artist: s.country || "Global Stream",
          file_url: s.url_resolved || s.url, 
          cover_image: s.favicon || "https://images.unsplash.com/photo-1485579149621-3123dd979885?q=80&w=300&auto=format&fit=crop",
          genre: s.tags?.split(',')[0] || "Live"
        })).filter(s => s.file_url && s.file_url.includes('http'))
        
        setStations(liveStations.length > 0 ? liveStations : VERIFIED_STATIONS)
      }
    } catch (err) { 
      console.error(err)
      setStations(VERIFIED_STATIONS) 
    }
    setLoading(false)
  }

  const handleTune = (index) => {
    const target = stations[index]
    if (currentTrack?.id === target.id) {
        togglePlay()
        return
    }
    setTuningId(target.id)
    setTimeout(() => {
      playTrack(index, stations)
      setTuningId(null)
    }, 1000) // Simulated signal lock
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 font-sans antialiased pb-60">
      
      {/* 🔝 LIVE SCANNER HEADER */}
      <header className="px-8 pt-16 pb-12 flex flex-col items-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/5 blur-[120px] -z-10"></div>
        
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-transform active:scale-90">
            <Radio size={40} className="text-black" />
          </div>
          <div className="absolute -top-2 -right-2 bg-red-600 px-3 py-1 rounded-full border-[4px] border-[#050505] flex items-center gap-1.5 shadow-2xl">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            <span className="text-[8px] font-black uppercase tracking-tighter italic">Live</span>
          </div>
        </div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Live <span className="text-orange-500">Scanner</span></h1>
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-2">
           <Signal size={12} className="text-orange-500"/> Station Sync: Online
        </p>
      </header>

      <main className="px-7">
        {/* 🔍 GLOBAL FREQUENCY SEARCH */}
        <form onSubmit={(e) => { e.preventDefault(); fetchLiveRadios(searchQuery); }} className="mb-12 flex gap-2">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Enter City or Station Name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-[#0A0A0A] rounded-[2rem] border border-white/5 outline-none focus:border-orange-500/30 text-[13px] font-bold shadow-2xl transition-all" 
            />
          </div>
          <button type="submit" className="px-8 bg-white text-black font-black uppercase italic tracking-widest text-[10px] rounded-[2rem] active:scale-95 transition-all shadow-xl shadow-white/5">
            Scan
          </button>
        </form>

        {/* 📟 TAB SELECTOR */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-12 pb-2">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.label} 
              onClick={() => setActiveTab(cat.label)}
              className={`px-7 py-4 rounded-full font-black text-[9px] uppercase tracking-[0.2em] transition-all border whitespace-nowrap
              ${activeTab === cat.label ? 'bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 📻 LIVE FEED */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 mb-8 opacity-40">
            <Activity size={14} className="text-orange-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.6em] whitespace-nowrap">Detected Signals</p>
            <div className="h-[1px] flex-1 bg-white"></div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-20">
              <Disc3 size={48} className="text-orange-500 animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">Fetching Airwaves...</p>
            </div>
          ) : (
            stations.map((s, i) => {
              const isActive = currentTrack?.id === s.id;
              const isTuning = tuningId === s.id;
              
              return (
                <div 
                  key={s.id} 
                  onClick={() => handleTune(i)} 
                  className={`p-5 bg-[#0A0A0A] rounded-[2.5rem] border flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98]
                  ${isActive ? 'border-orange-500/50 bg-orange-500/5 shadow-[0_20px_50px_rgba(249,115,22,0.1)]' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-5 truncate text-left min-w-0">
                    <div className="relative w-14 h-14 rounded-2xl bg-black overflow-hidden shrink-0 border border-white/5 shadow-2xl group-hover:scale-105 transition-transform">
                      <img 
                        src={s.cover_image} 
                        className={`w-full h-full object-cover transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-60'}`} 
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1485579149621-3123dd979885?q=80&w=300&auto=format&fit=crop" }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         {isTuning ? <Loader2 className="text-orange-500 animate-spin" /> : (isActive && isPlaying ? <Pause className="text-orange-500 fill-orange-500" /> : <Play className="text-white fill-white" />)}
                      </div>
                    </div>
                    
                    <div className="truncate">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[8px] font-black bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full border border-orange-500/20">
                          {s.genre}
                        </span>
                        {isActive && isPlaying && <Wifi size={10} className="text-orange-500 animate-pulse" />}
                      </div>
                      <h4 className={`text-[15px] font-black uppercase italic truncate tracking-tight ${isActive ? 'text-orange-500' : 'text-white'}`}>
                        {s.title}
                      </h4>
                      <p className="text-[10px] text-gray-700 font-bold uppercase mt-1 tracking-wider">{s.artist}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-[1.2rem] transition-all shadow-inner shrink-0 ${isActive ? 'bg-orange-500 text-black' : 'bg-white/5 text-gray-800 group-hover:text-white'}`}>
                    {isTuning ? <Loader2 size={18} className="animate-spin" /> : (isActive && isPlaying ? <Pause size={18} /> : <Play size={18} />)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* 🧭 NAVIGATION */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[420px] z-50 bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] px-8 py-4 flex justify-between shadow-2xl items-center ring-1 ring-white/5">
        <Link to="/dashboard" className="p-2 text-gray-600 hover:text-orange-400 transition-all"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-600 hover:text-orange-400 transition-all"><MessageSquare size={24} /></Link>
        
        <Link to="/radio" className="relative group p-5 bg-orange-500 text-black rounded-full -mt-12 border-[6px] border-[#050505] shadow-[0_15px_40px_rgba(249,115,22,0.4)] transition-all active:scale-90">
          <Radio size={28} className={isPlaying ? "animate-pulse" : ""} />
        </Link>

        <Link to="/leaderboard" className="p-2 text-gray-600 hover:text-orange-400 transition-all"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-gray-600 hover:text-orange-400 transition-all"><User size={24} /></Link>
      </nav>
    </div>
  )
}