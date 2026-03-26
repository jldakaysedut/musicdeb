import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { Play, Pause, Search, Heart, Radio, Home, MessageSquare, Trophy, User, Mic2, Podcast, Wifi, Globe, Disc3 } from 'lucide-react'

const BROADCASTS = [
  { label: "Top Podcasts", query: "Podcast" },
  { label: "Live FM", query: "Live FM Radio" },
  { label: "OPM News", query: "Tagalog News" },
  { label: "Tech Talk", query: "Technology Podcast" }
]

export default function RadioHub() {
  const [stations, setStations] = useState([])
  const [searchQuery, setSearchQuery] = useState('') 
  const [activeCategory, setActiveCategory] = useState("Top Podcasts")
  const [loading, setLoading] = useState(false)
  const { currentTrack, isPlaying, playTrack } = useAudio()

  useEffect(() => { fetchBroadcasts(activeCategory) }, [activeCategory])

  const fetchBroadcasts = async (query) => {
    setLoading(true)
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=podcast&limit=30`)
      const json = await res.json()
      if (json.results) {
        setStations(json.results.map(s => ({
          id: s.trackId.toString(), title: s.trackName, artist: s.artistName, file_url: s.feedUrl, cover_image: s.artworkUrl600, genre: s.primaryGenreName
        })))
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-52">
      <header className="max-w-4xl mx-auto p-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-orange-500 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-2xl animate-pulse"><Radio size={32} className="text-black"/></div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Broadcast <span className="text-orange-500">Hub</span></h1>
      </header>

      <main className="max-w-3xl mx-auto px-6">
        <form onSubmit={(e) => { e.preventDefault(); fetchBroadcasts(searchQuery); }} className="mb-8 flex gap-3">
          <input type="text" placeholder="Search Stations or Podcasts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 pl-6 pr-6 py-4 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold text-sm" />
          <button type="submit" className="px-6 bg-orange-500 text-black font-black uppercase italic rounded-2xl">Tune</button>
        </form>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
          {BROADCASTS.map(cat => (
            <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
              className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest border whitespace-nowrap
              ${activeCategory === cat.label ? 'bg-orange-500 text-black border-orange-500' : 'bg-white/5 text-gray-500 border-white/5'}`}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? <Disc3 className="mx-auto text-orange-500 animate-spin mt-10" /> : 
            stations.map((s, i) => (
              <div key={s.id} onClick={() => playTrack(i, stations)} className={`p-4 bg-[#0A0A0A] rounded-[1.8rem] flex items-center justify-between border ${currentTrack?.id === s.id ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/5'}`}>
                <div className="flex items-center gap-5 truncate text-left">
                  <img src={s.cover_image} className="w-14 h-14 rounded-2xl object-cover" />
                  <div className="truncate">
                    <span className="text-[8px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded uppercase font-black">{s.genre}</span>
                    <h4 className={`text-sm font-black uppercase italic truncate mt-1 ${currentTrack?.id === s.id ? 'text-orange-500' : 'text-white'}`}>{s.title}</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">{s.artist}</p>
                  </div>
                </div>
                {currentTrack?.id === s.id && isPlaying ? <Pause size={20} className="text-orange-500" /> : <Play size={20} className="text-gray-700" />}
              </div>
            ))
          }
        </div>
      </main>

      {/* 🧭 NAV BAR */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[420px] z-50 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] px-8 py-4 flex justify-between shadow-2xl items-center">
        <Link to="/dashboard" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><MessageSquare size={24} /></Link>
        <Link to="/radio" className="p-5 bg-orange-500 text-black rounded-full -mt-12 border-[6px] border-[#050505] shadow-[0_15px_30px_rgba(249,115,22,0.4)] transition-all hover:scale-110">
          <Radio size={28} className="animate-pulse" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
        </Link>
        <Link to="/leaderboard" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><User size={24} /></Link>
      </nav>
    </div>
  )
}