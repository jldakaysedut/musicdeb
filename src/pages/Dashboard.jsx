import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { Play, Pause, LogOut, Search, Download, Heart, Disc3, User, Trophy, MessageSquare, Home, Flame, Radio } from 'lucide-react'

const CATEGORIES = ["Trending Hits", "Hev Abi", "OPM Viral", "Al James", "Hip-Hop", "Pop"]

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [savedTracks, setSavedTracks] = useState([])
  const [searchQuery, setSearchQuery] = useState('') 
  const [activeCategory, setActiveCategory] = useState("Trending Hits")
  const [loading, setLoading] = useState(true)
  
  const navigate = useNavigate()
  const { currentTrack, isPlaying, playTrack } = useAudio()

  useEffect(() => { 
    fetchMusic(activeCategory) 
    fetchSavedTracks() 
  }, [])

  const fetchSavedTracks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('saved_tracks').select('*').eq('user_id', user.id)
    if (data) setSavedTracks(data)
  }

  const fetchMusic = async (query) => {
    setLoading(true)
    setActiveCategory(query)
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

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setActiveCategory("Search Results")
      fetchMusic(searchQuery)
    }
  }

  const handleDownload = async (e, track) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('download_count').eq('id', user.id).single()
    await supabase.from('profiles').update({ download_count: (profile?.download_count || 0) + 1 }).eq('id', user.id)
    window.open(track.download_url, '_blank')
  }

  const handleLike = async (e, track) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    const isLiked = savedTracks.some(st => st.track_id === track.id)
    if (isLiked) {
      setSavedTracks(prev => prev.filter(st => st.track_id !== track.id))
      await supabase.from('saved_tracks').delete().match({ user_id: user.id, track_id: track.id })
    } else {
      const newSaved = { user_id: user.id, track_id: track.id, title: track.title, artist: track.artist, file_url: track.file_url, cover_image: track.cover_image }
      setSavedTracks(prev => [newSaved, ...prev])
      await supabase.from('saved_tracks').insert(newSaved)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-44">
      <header className="max-w-6xl mx-auto p-6 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-white/5">
        <h1 className="text-xl font-black italic tracking-tighter flex items-center gap-2">
          <Disc3 size={24} className="text-orange-500 animate-spin-slow" /> JAMLIST
        </h1>
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><LogOut size={20} /></button>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500" />
            <input type="text" placeholder="Search tracks, artists..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold" />
          </div>
          <button type="submit" className="px-6 bg-orange-500 text-black font-black uppercase rounded-2xl hover:bg-orange-400">Search</button>
        </form>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => fetchMusic(cat)}
              className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border 
              ${activeCategory === cat ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}>
              {cat === "Trending Hits" ? <span className="flex items-center gap-1"><Flame size={12}/> {cat}</span> : cat}
            </button>
          ))}
        </div>

        <div className="space-y-3 text-left">
          {loading ? <div className="text-center py-20 animate-pulse text-gray-600 font-black uppercase tracking-widest">Loading Vibes...</div> : 
            tracks.map((item, index) => (
              <div key={item.id} onClick={() => playTrack(index, tracks)} className={`p-3 bg-[#0A0A0A] rounded-2xl flex items-center justify-between border group cursor-pointer transition-all ${currentTrack?.file_url === item.file_url ? 'border-orange-500/30 bg-orange-500/5' : 'border-white/5 hover:border-white/10'}`}>
                <div className="flex items-center gap-4 truncate">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black">
                    <img src={item.cover_image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                       {currentTrack?.file_url === item.file_url && isPlaying ? <Pause size={18}/> : <Play size={18}/>}
                    </div>
                  </div>
                  <div className="truncate">
                    <h4 className={`text-sm font-black uppercase italic truncate ${currentTrack?.file_url === item.file_url ? 'text-orange-500' : 'text-white'}`}>{item.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{item.artist}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={(e) => handleLike(e, item)} className="p-3 bg-white/5 rounded-xl hover:bg-orange-500/20 transition-all"><Heart size={18} className={savedTracks.some(st => st.track_id === item.id) ? "text-orange-500 fill-orange-500" : "text-gray-600"} /></button>
                  <button onClick={(e) => handleDownload(e, item)} className="p-3 bg-white/5 rounded-xl text-gray-600 hover:text-white transition-all"><Download size={18} /></button>
                </div>
              </div>
            ))
          }
        </div>
      </main>

      {/* 🧭 FIXED BOTTOM NAV WITH CENTER RADIO BUTTON */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] md:w-[400px] z-40 bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-6 py-3 flex justify-between shadow-2xl items-center">
        <Link to="/dashboard" className="p-2 text-orange-500 transition-colors"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><MessageSquare size={24} /></Link>
        
        <Link to="/dashboard" className="p-4 bg-orange-500 text-black rounded-full -mt-10 border-4 border-[#050505] shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all">
          <Radio size={24} />
        </Link>

        <Link to="/leaderboard" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><User size={24} /></Link>
      </nav>
    </div>
  )
}