import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { 
  Play, Pause, LogOut, Search, Download, Heart,
  Disc3, User, Trophy, MessageSquare, Home, RefreshCw
} from 'lucide-react'

// ✅ 1. FRESH 2026 PROXY SERVERS
const PIPED_INSTANCES = [
  'https://pipedapi.smnz.de',
  'https://pipedapi.adminforge.de',
  'https://piped-api.lunar.icu',
  'https://pipedapi.kavin.rocks',
]

const INVIDIOUS_INSTANCES = [
  'https://vid.puffyan.us',
  'https://invidious.fdn.fr',
  'https://invidious.nerdvpn.de',
  'https://yewtu.be',
]

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [savedTracks, setSavedTracks] = useState([])
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  useEffect(() => {
    fetchMusic('Hev Abi')
    fetchSavedTracks()
  }, [])

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

  // ─── THE HYDRA SEARCH (Double-Layered Search Strategy) ──────────
  const searchVideos = async (query) => {
    // LAYER 1: Try Piped API
    for (const instance of PIPED_INSTANCES) {
      try {
        const res = await fetch(`${instance}/search?q=${encodeURIComponent(query)}&filter=videos`, { signal: AbortSignal.timeout(8000) })
        if (res.ok) {
          const json = await res.json()
          if (json?.items?.length) return json.items.filter(i => i.type === 'stream').slice(0, 10).map(t => ({
             id: t.url.replace('/watch?v=', ''),
             title: t.title,
             artist: t.uploaderName,
             cover_image: t.thumbnail
          }))
        }
      } catch (err) {}
    }
    
    // LAYER 2: If Piped fails, Fallback to Invidious Search
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const res = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, { signal: AbortSignal.timeout(8000) })
        if (res.ok) {
          const json = await res.json()
          if (json?.length) return json.slice(0, 10).map(t => ({
             id: t.videoId,
             title: t.title,
             artist: t.author,
             cover_image: t.videoThumbnails?.[0]?.url || ''
          }))
        }
      } catch (err) {}
    }
    return [] // Wala talagang nasagap
  }

  // ─── THE AUDIO EXTRACTOR (Triple Fallback System) ─────────────────
  const getAudioUrl = async (videoId) => {
    // ATTEMPT 1: Invidious Direct Audio Format
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const res = await fetch(`${instance}/api/v1/videos/${videoId}?fields=adaptiveFormats`, { signal: AbortSignal.timeout(6000) })
        if (res.ok) {
          const json = await res.json()
          const format = json?.adaptiveFormats?.find(f => f.type?.startsWith('audio/'))
          if (format?.url) return format.url
        }
      } catch (err) {}
    }

    // ATTEMPT 2: Piped Audio Streams
    for (const instance of PIPED_INSTANCES) {
      try {
        const res = await fetch(`${instance}/streams/${videoId}`, { signal: AbortSignal.timeout(6000) })
        if (res.ok) {
          const json = await res.json()
          const format = json?.audioStreams?.sort((a,b) => b.bitrate - a.bitrate)[0]
          if (format?.url) return format.url
        }
      } catch (err) {}
    }

    // ATTEMPT 3: The "Final Boss" Converter JSON Parsing (from earlier hack)
    try {
        const res = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=https://www.youtube.com/watch?v=${videoId}`)
        const json = await res.json()
        const rawUrl = json?.data?.dl || json?.data?.url || json?.url
        if (rawUrl) return rawUrl
    } catch (err) {}

    return ''
  }

  // ─── MAIN FETCH ENGINE ──────────────────────────────────────────────────
  const fetchMusic = async (query = 'Hev Abi') => {
    setLoading(true)
    setError('')
    setTracks([])

    try {
      const rawTracks = await searchVideos(query)

      if (!rawTracks.length) {
        setError('Global Network Error. Public servers might be overloaded right now.')
        setLoading(false)
        return
      }

      const results = []
      await Promise.all(
        rawTracks.map(async (track) => {
          if (!track.id) return

          const audioUrl = await getAudioUrl(track.id)
          if (!audioUrl) return

          results.push({
            id: track.id,
            title: (track.title || 'Unknown').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
            artist: track.artist || 'YouTube Artist',
            file_url: audioUrl,
            download_url: audioUrl,
            cover_image: track.cover_image,
          })

          setTracks([...results])
        })
      )

      if (results.length === 0) {
        setError('Found the tracks, but security blocked the audio extraction. Try again.')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('System malfunction. Try refreshing the app.')
    }

    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setFilter('All')
      fetchMusic(searchQuery.trim())
    }
  }

  const handleLike = async (e, track) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const isLiked = savedTracks.some(st => st.track_id === track.id)

    if (isLiked) {
      setSavedTracks(prev => prev.filter(st => st.track_id !== track.id))
      await supabase.from('saved_tracks').delete().match({ user_id: user.id, track_id: track.id })
    } else {
      const newSaved = {
        user_id: user.id,
        track_id: track.id,
        title: track.title,
        artist: track.artist,
        file_url: track.file_url,
        cover_image: track.cover_image,
      }
      setSavedTracks(prev => [newSaved, ...prev])
      await supabase.from('saved_tracks').insert(newSaved)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const displayedItems = filter === 'Favorites'
    ? savedTracks.map(st => ({ ...st, id: st.track_id }))
    : tracks

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-44 overflow-x-hidden selection:bg-orange-500">

      {/* Header */}
      <header className="max-w-5xl mx-auto p-6 flex justify-between items-center animate-in fade-in duration-700">
        <div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{greeting}</p>
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 italic">
            <Disc3 size={24} className="text-orange-500 animate-spin-slow" />
            JAMLIST
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/leaderboard" className="hidden md:flex w-10 h-10 bg-white/5 rounded-xl items-center justify-center hover:border-orange-500/50 transition-colors">
            <Trophy size={18} />
          </Link>
          <Link to="/profile" className="hidden md:flex w-10 h-10 bg-white/5 rounded-xl items-center justify-center hover:border-orange-500/50 transition-colors">
            <User size={18} />
          </Link>
          <button onClick={handleLogout} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95">
            <LogOut size={18} strokeWidth={3} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Search the Underground Network..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-24 py-4 bg-white/[0.02] rounded-2xl border border-white/5 focus:border-orange-500 outline-none text-sm font-bold text-white transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-3 overflow-x-auto py-2 mb-6 no-scrollbar">
          {['All', 'Favorites'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all border 
              ${filter === cat
                ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:border-gray-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Track List */}
        <section>
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 italic">
              {filter === 'Favorites'
                ? 'Your Personal Vault'
                : searchQuery ? `Results for "${searchQuery}"` : 'Trending Hits'}
            </h2>
            <span className="text-[10px] font-black text-gray-700 tracking-widest uppercase">
              {displayedItems.length} TRACKS
            </span>
          </div>

          <div className="space-y-3">
            {/* Loading */}
            {loading && filter === 'All' && tracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
                <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em]">
                  Bypassing Mainframes...
                </p>
              </div>

            /* Error */
            ) : error && displayedItems.length === 0 ? (
              <div className="text-center py-24 bg-white/[0.02] rounded-[2.5rem] border border-red-500/10 border-dashed">
                <Disc3 size={32} className="mx-auto text-red-900 mb-4" />
                <p className="text-red-400 font-black text-[10px] uppercase tracking-widest mb-6">{error}</p>
                <button
                  onClick={() => fetchMusic(searchQuery || 'Hev Abi')}
                  className="px-6 py-2.5 bg-orange-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={12} /> Retry Connection
                </button>
              </div>

            /* Empty Favorites */
            ) : displayedItems.length === 0 && filter === 'Favorites' ? (
              <div className="text-center py-24 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
                <Heart size={32} className="mx-auto text-gray-900 mb-4" />
                <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">
                  No saved tracks yet. Heart a song to save it.
                </p>
              </div>

            /* Tracks */
            ) : displayedItems.map((item, index) => {
              const isPlayingThis = currentTrack?.file_url === item.file_url
              const isLiked = savedTracks.some(st => st.track_id === item.id)

              return (
                <div
                  key={item.id}
                  onClick={() => isPlayingThis ? togglePlay() : playTrack(index, displayedItems)}
                  className={`p-3 rounded-2xl flex items-center justify-between border transition-all cursor-pointer group 
                  ${isPlayingThis
                    ? 'bg-orange-500/10 border-orange-500/20 shadow-xl'
                    : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}
                >
                  {/* Cover + Title */}
                  <div className="flex items-center gap-4 overflow-hidden w-2/3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#111]">
                      {item.cover_image
                        ? <img src={item.cover_image} alt="cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                        : <div className="w-full h-full flex items-center justify-center"><Disc3 size={20} className="text-gray-700" /></div>
                      }
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isPlayingThis && isPlaying
                          ? <Pause size={20} className="text-white drop-shadow-lg" fill="currentColor" />
                          : <Play size={20} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-lg" fill="currentColor" />
                        }
                      </div>
                    </div>

                    <div className="truncate w-full">
                      <h4 className={`text-sm font-black truncate uppercase italic ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 truncate">
                        {item.artist}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 z-10 shrink-0">
                    <button
                      onClick={(e) => handleLike(e, item)}
                      className="p-3 rounded-xl hover:bg-white/5 transition-all active:scale-75"
                    >
                      <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-orange-500' : 'text-gray-500'} />
                    </button>
                    {item.download_url && (
                      <a
                        href={item.download_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Download size={18} />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Streaming in progress indicator */}
            {loading && tracks.length > 0 && (
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="w-4 h-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Bypassing security...</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex justify-around items-center">
        <Link to="/dashboard" className="p-2 text-orange-500"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-700"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-700"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-gray-700"><User size={22} /></Link>
      </nav>
    </div>
  )
}