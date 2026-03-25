import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { 
  Play, Pause, LogOut, Search, Download, Heart,
  Disc3, User, Trophy, MessageSquare, Home
} from 'lucide-react'

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [savedTracks, setSavedTracks] = useState([])
  const [filter, setFilter] = useState('All') 
  const [searchQuery, setSearchQuery] = useState('') 
  const [loading, setLoading] = useState(true)
  
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  useEffect(() => { 
    // Default vibe check: Mag-search agad ng OPM/Trending pagkabukas ng app
    fetchUndergroundMusic('Hev Abi') 
    fetchSavedTracks() 
  }, [])

  // 1. Fetch User's Vault from Supabase
  const fetchSavedTracks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('saved_tracks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setSavedTracks(data)
  }

  // 2. 🌐 THE UNDERGROUND ENGINE: Fetching FULL tracks from JioSaavn API
  const fetchUndergroundMusic = async (query = 'Trending') => {
    setLoading(true)
    try {
      // Heto ang sikreto: Ang unofficial public wrapper ng JioSaavn
      const endpoint = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=30`
      const response = await fetch(endpoint)
      const json = await response.json()
      
      if (json.success && json.data && json.data.results) {
        const undergroundTracks = json.data.results.map(track => {
          // Kunin ang pinakamagandang quality ng audio at album art (nandun madalas sa huling array)
          const bestAudio = track.downloadUrl?.pop()?.url || ''
          const bestImage = track.image?.pop()?.url || ''
          const artistName = track.artists?.primary?.[0]?.name || 'Unknown Artist'

          return {
            id: track.id,
            // Nililinis natin ang title kung sakaling may HTML codes tulad ng &quot;
            title: track.name.replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
            artist: artistName,
            file_url: bestAudio,       // 100% Full Audio Stream!
            download_url: bestAudio,   // Direct file link para sa Download button
            cover_image: bestImage     // 500x500 High-Res Cover!
          }
        })
        
        setTracks(undergroundTracks)
      } else {
        setTracks([]) // Walang nahanap
      }
    } catch (error) {
      console.error("Underground Fetch Error:", error)
      setTracks([])
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setFilter('All')
      fetchUndergroundMusic(searchQuery)
    }
  }

  // 3. 💖 THE VAULT SYSTEM
  const handleLike = async (e, track) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    const isLiked = savedTracks.some(st => st.track_id === track.id) // Pinalitan ang jamendo_id to track_id

    if (isLiked) {
      // Unsave: Tanggalin sa UI at Database
      setSavedTracks(prev => prev.filter(st => st.track_id !== track.id))
      await supabase.from('saved_tracks').delete().match({ user_id: user.id, track_id: track.id })
    } else {
      // Save: Construct the record
      const newSavedTrack = {
        user_id: user.id,
        track_id: track.id,
        title: track.title,
        artist: track.artist,
        file_url: track.file_url,
        cover_image: track.cover_image
      }
      
      setSavedTracks(prev => [newSavedTrack, ...prev])
      await supabase.from('saved_tracks').insert(newSavedTrack)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Map the correct array based on Filter (All = Internet, Favorites = Supabase)
  const displayedItems = filter === 'Favorites' 
    ? savedTracks.map(st => ({ ...st, id: st.track_id })) 
    : tracks

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-44 overflow-x-hidden selection:bg-orange-500">
      
      <header className="max-w-5xl mx-auto p-6 flex justify-between items-center animate-in fade-in duration-700">
        <div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{greeting}</p>
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 italic">
            <Disc3 size={24} className="text-orange-500 animate-spin-slow" />
            JAMLIST
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <Link to="/leaderboard" className="hidden md:flex w-10 h-10 bg-white/5 rounded-xl items-center justify-center hover:border-orange-500/50 transition-colors"><Trophy size={18} /></Link>
           <Link to="/profile" className="hidden md:flex w-10 h-10 bg-white/5 rounded-xl items-center justify-center hover:border-orange-500/50 transition-colors"><User size={18} /></Link>
           <button onClick={handleLogout} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95">
             <LogOut size={18} strokeWidth={3} />
           </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        
        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="mb-6 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Search mainstream tracks (e.g., Hev Abi, Taylor Swift)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/[0.02] rounded-2xl border border-white/5 focus:border-orange-500 outline-none text-sm font-bold text-white transition-all"
          />
        </form>

        {/* PILLS */}
        <div className="flex gap-3 overflow-x-auto py-2 mb-6 no-scrollbar">
          {['All', 'Favorites'].map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} 
              className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all border 
              ${filter === cat ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-gray-400 border-white/5 hover:border-gray-600'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* FEED */}
        <section>
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 italic">
              {filter === 'Favorites' ? 'Your Personal Vault' : (searchQuery ? `Results for "${searchQuery}"` : 'Top Hits')}
            </h2>
            <span className="text-[10px] font-black text-gray-700 tracking-widest uppercase">{displayedItems.length} TRACKS</span>
          </div>

          <div className="space-y-3">
            {loading && filter === 'All' ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em]">Searching Global Network...</p>
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="text-center py-24 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
                <Disc3 size={32} className="mx-auto text-gray-900 mb-4" />
                <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">
                  {filter === 'Favorites' ? "You haven't saved any tracks yet." : "No tracks found."}
                </p>
              </div>
            ) : (
              displayedItems.map((item, index) => {
                const isPlayingThis = currentTrack?.file_url === item.file_url
                const isLiked = savedTracks.some(st => st.track_id === item.id)
                
                return (
                  <div key={item.id} onClick={() => isPlayingThis ? togglePlay() : playTrack(index, displayedItems)}
                    className={`p-3 rounded-2xl flex items-center justify-between border transition-all cursor-pointer group 
                    ${isPlayingThis ? 'bg-orange-500/10 border-orange-500/20 shadow-xl' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}>
                    
                    <div className="flex items-center gap-4 overflow-hidden">
                      {/* Album Art Cover */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#111]">
                        <img src={item.cover_image || '/api/placeholder/56/56'} alt="cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isPlayingThis && isPlaying ? <Pause size={20} className="text-white drop-shadow-lg" fill="currentColor" /> : <Play size={20} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-lg" fill="currentColor" />}
                        </div>
                      </div>

                      <div className="truncate">
                        <h4 className={`text-sm font-black truncate uppercase italic ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>{item.title}</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                          {item.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 z-10 shrink-0">
                      <button 
                        onClick={(e) => handleLike(e, item)} 
                        className="p-3 bg-transparent rounded-xl hover:bg-white/5 transition-all active:scale-75"
                      >
                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-orange-500" : "text-gray-500"} />
                      </button>
                      
                      {item.download_url && (
                        <a 
                          href={item.download_url} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()} 
                          className="p-3 bg-transparent rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Download size={18} />
                        </a>
                      )}
                    </div>

                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex justify-around items-center">
        <Link to="/dashboard" className="p-2 text-orange-500"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-700"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-700"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-gray-700"><User size={22} /></Link>
      </nav>
    </div>
  )
}