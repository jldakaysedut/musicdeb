import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { Play, Pause, LogOut, Search, Heart, Disc3, User, Trophy, MessageSquare, Home, Flame, Radio, Music2 } from 'lucide-react'

const CATEGORIES = ["Trending Hits", "Hev Abi", "OPM Viral", "Al James", "Pop"]

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [savedTrackIds, setSavedTrackIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('') 
  const [activeCategory, setActiveCategory] = useState("Trending Hits")
  const [loading, setLoading] = useState(true)
  
  const navigate = useNavigate()
  const { currentTrack, isPlaying, playTrack } = useAudio()

  useEffect(() => { 
    fetchMusic(activeCategory) 
    fetchUserLikes()
  }, [activeCategory])

  const fetchUserLikes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('saved_tracks').select('track_id').eq('user_id', user.id)
    if (data) setSavedTrackIds(new Set(data.map(item => item.track_id)))
  }

  const fetchMusic = async (query) => {
    setLoading(true)
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=30`)
      const json = await res.json()
      if (json.results) {
        setTracks(json.results.map(t => ({
          id: t.trackId.toString(),
          title: t.trackName,
          artist: t.artistName,
          file_url: t.previewUrl,
          download_url: t.previewUrl,
          cover_image: t.artworkUrl100?.replace('100x100bb', '600x600bb')
        })))
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleManualSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setActiveCategory(null) // Unselect categories kapag nag-search
      fetchMusic(searchQuery)
    }
  }

  const handleLike = async (e, track) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isLiked = savedTrackIds.has(track.id)
    if (isLiked) {
      setSavedTrackIds(prev => {
        const next = new Set(prev); next.delete(track.id); return next
      })
      await supabase.from('saved_tracks').delete().match({ user_id: user.id, track_id: track.id })
    } else {
      setSavedTrackIds(prev => new Set(prev).add(track.id))
      await supabase.from('saved_tracks').insert({
        user_id: user.id, track_id: track.id, title: track.title, artist: track.artist, file_url: track.file_url, cover_image: track.cover_image
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-52">
      {/* 🔝 TOP HEADER */}
      <header className="max-w-6xl mx-auto p-6 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-white/5">
        <h1 className="text-xl font-black italic tracking-tighter flex items-center gap-2">
          <Disc3 size={24} className="text-orange-500 animate-spin-slow" /> JAMLIST
        </h1>
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        {/* 🔍 SEARCH BAR INTEGRATION */}
        <div className="mb-10">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-6">Discover <span className="text-orange-500">Hits</span></h2>
          <form onSubmit={handleManualSearch} className="flex gap-3">
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="What's on your mind today?" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500/50 outline-none font-bold text-sm shadow-inner transition-all" 
              />
            </div>
            <button type="submit" className="px-6 bg-orange-500 text-black font-black uppercase italic rounded-2xl hover:bg-orange-400 active:scale-95 transition-all">
              Search
            </button>
          </form>
        </div>

        {/* 🏷️ QUICK FILTERS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
              className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border 
              ${activeCategory === cat ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}>
              {cat === "Trending Hits" ? <span className="flex items-center gap-1"><Flame size={12}/> {cat}</span> : cat}
            </button>
          ))}
        </div>

        {/* 🎵 THE MUSIC LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-20 animate-pulse text-gray-600 font-black uppercase tracking-widest text-xs">
              Fetching Fresh Vibes...
            </div>
          ) : (
            tracks.map((item, index) => {
              const isActive = currentTrack?.file_url === item.file_url;
              return (
                <div 
                  key={item.id} 
                  onClick={() => playTrack(index, tracks)} 
                  className={`p-4 bg-[#0A0A0A] rounded-[1.5rem] flex items-center justify-between border transition-all cursor-pointer group
                  ${isActive ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-4 truncate">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                      <img src={item.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isActive && isPlaying ? <Pause size={20} className="text-orange-500" /> : <Play size={20} />}
                      </div>
                    </div>
                    <div className="truncate text-left">
                      <h4 className={`text-sm font-black uppercase italic truncate ${isActive ? 'text-orange-500' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">{item.artist}</p>
                    </div>
                  </div>
                  <button onClick={(e) => handleLike(e, item)} className="p-3 bg-white/5 rounded-xl hover:bg-orange-500/10 transition-all">
                    <Heart size={16} className={savedTrackIds.has(item.id) ? "text-orange-500 fill-orange-500" : "text-gray-700"} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* 🧭 NAVIGATION BAR */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[420px] z-50 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] px-8 py-4 flex justify-between shadow-2xl items-center">
        <Link to="/dashboard" className="p-2 text-orange-500 transition-all relative">
          <Home size={24} />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
        </Link>
        <Link to="/chat" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><MessageSquare size={24} /></Link>
        
        <Link to="/radio" className="p-5 bg-orange-500 text-black rounded-full -mt-12 border-[6px] border-[#050505] shadow-[0_15px_30px_rgba(249,115,22,0.4)] transition-all hover:scale-110 active:scale-90">
          <Radio size={28} />
        </Link>

        <Link to="/leaderboard" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-gray-500 hover:text-orange-400 transition-all"><User size={24} /></Link>
      </nav>
    </div>
  )
}