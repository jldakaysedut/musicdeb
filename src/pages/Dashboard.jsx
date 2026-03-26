import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { Play, Pause, LogOut, Heart, Disc3, User, Trophy, MessageSquare, Home, Flame, Radio } from 'lucide-react'

const CATEGORIES = ["Trending Hits", "Hev Abi", "OPM Viral", "Al James", "Pop"]

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [savedTracks, setSavedTracks] = useState([])
  const [activeCategory, setActiveCategory] = useState("Trending Hits")
  const [loading, setLoading] = useState(true)
  
  const navigate = useNavigate()
  const { currentTrack, isPlaying, playTrack } = useAudio()

  useEffect(() => { 
    fetchMusic(activeCategory) 
    fetchSavedTracks() 
  }, [activeCategory])

  const fetchSavedTracks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('saved_tracks').select('*').eq('user_id', user.id)
    if (data) setSavedTracks(data)
  }

  const fetchMusic = async (query) => {
    setLoading(true)
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=25`)
      const json = await res.json()
      if (json.results) {
        setTracks(json.results.map(t => ({
          id: t.trackId.toString(), title: t.trackName, artist: t.artistName, file_url: t.previewUrl, download_url: t.previewUrl, cover_image: t.artworkUrl100?.replace('100x100bb', '600x600bb')
        })))
      }
    } catch (err) { console.error(err) }
    setLoading(false)
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
        <div className="mb-8">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Daily <span className="text-orange-500">Mix</span></h2>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Curated for you</p>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border 
              ${activeCategory === cat ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}>
              {cat === "Trending Hits" ? <span className="flex items-center gap-1"><Flame size={12}/> {cat}</span> : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? <div className="col-span-full text-center py-20 animate-pulse text-gray-600 font-black uppercase tracking-widest">Loading Feed...</div> : 
            tracks.map((item, index) => (
              <div key={item.id} onClick={() => playTrack(index, tracks)} className="bg-[#0A0A0A] p-3 rounded-2xl border border-white/5 hover:border-orange-500/50 cursor-pointer group transition-all">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <img src={item.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {currentTrack?.file_url === item.file_url && isPlaying ? <Pause size={24}/> : <Play size={24}/>}
                  </div>
                </div>
                <h4 className={`text-xs font-black uppercase italic truncate ${currentTrack?.file_url === item.file_url ? 'text-orange-500' : 'text-white'}`}>{item.title}</h4>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[9px] text-gray-500 uppercase font-bold truncate pr-2">{item.artist}</p>
                  <button onClick={(e) => handleLike(e, item)}><Heart size={14} className={savedTracks.some(st => st.track_id === item.id) ? "text-orange-500 fill-orange-500" : "text-gray-600 hover:text-white"} /></button>
                </div>
              </div>
            ))
          }
        </div>
      </main>

      {/* 🧭 NAV BAR - Center goes to /radio */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] md:w-[400px] z-40 bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-6 py-3 flex justify-between shadow-2xl items-center">
        <Link to="/dashboard" className="p-2 text-orange-500 transition-colors"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><MessageSquare size={24} /></Link>
        
        <Link to="/radio" className="p-4 bg-orange-500 text-black rounded-full -mt-10 border-4 border-[#050505] shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all">
          <Radio size={24} />
        </Link>

        <Link to="/leaderboard" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><User size={24} /></Link>
      </nav>
    </div>
  )
}