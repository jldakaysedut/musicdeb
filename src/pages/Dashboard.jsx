import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { Play, Pause, LogOut, Search, Download, Heart, Disc3, User, Trophy, MessageSquare, Home, LayoutGrid } from 'lucide-react'

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [savedTracks, setSavedTracks] = useState([])
  const [searchQuery, setSearchQuery] = useState('') 
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  useEffect(() => { 
    fetchAppleMusic('Hev Abi') 
    fetchSavedTracks() 
  }, [])

  const fetchSavedTracks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('saved_tracks').select('*').eq('user_id', user.id)
    if (data) setSavedTracks(data)
  }

  const fetchAppleMusic = async (query = 'Hev Abi') => {
    setLoading(true)
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=25`)
      const json = await response.json()
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

  const handleDownload = async (e, track) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Update Score
    const { data: profile } = await supabase.from('profiles').select('download_count').eq('id', user.id).single()
    await supabase.from('profiles').update({ download_count: (profile?.download_count || 0) + 1 }).eq('id', user.id)
    
    // Trigger Download
    const link = document.createElement('a')
    link.href = track.download_url
    link.download = `${track.title}.m4a`
    link.click()
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
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-44 selection:bg-orange-500">
      {/* Navbar Desktop */}
      <header className="max-w-6xl mx-auto p-6 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <Disc3 size={24} className="text-black animate-spin-slow" />
          </div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">JAMLIST</h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <Link to="/leaderboard" className="text-xs font-black uppercase tracking-widest hover:text-orange-500 transition-colors flex items-center gap-2"><Trophy size={14}/> Ranking</Link>
           <Link to="/profile" className="text-xs font-black uppercase tracking-widest hover:text-orange-500 transition-colors flex items-center gap-2"><User size={14}/> Vault</Link>
           <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="bg-red-500/10 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10">
        <div className="mb-12">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Explore <span className="text-orange-500 text-stroke-white">Vibes</span></h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Global Network • Real-time Streaming</p>
        </div>

        {/* Improved Search Bar */}
        <form onSubmit={(e) => { e.preventDefault(); fetchAppleMusic(searchQuery) }} className="mb-10 relative flex gap-3">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
            <input type="text" placeholder="Search mainstream hits..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/[0.03] rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold text-sm transition-all" />
          </div>
          <button type="submit" className="px-8 bg-orange-500 text-black font-black uppercase italic rounded-2xl hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/20">Find</button>
        </form>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 gap-3">
          {loading ? (
            <div className="text-center py-20 bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed">
              <Disc3 size={40} className="animate-spin text-orange-500/20 mx-auto mb-4" />
              <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Bypassing Mainframes...</p>
            </div>
          ) : 
            tracks.map((item, index) => {
              const isPlayingThis = currentTrack?.file_url === item.file_url
              return (
                <div key={item.id} onClick={() => playTrack(index, tracks)} 
                  className={`p-4 rounded-3xl flex items-center justify-between border transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99]
                  ${isPlayingThis ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10 shadow-xl'}`}>
                  <div className="flex items-center gap-5 truncate flex-1">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-black">
                      <img src={item.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                         {isPlayingThis && isPlaying ? <Pause size={20}/> : <Play size={20}/>}
                      </div>
                    </div>
                    <div className="truncate">
                      <h4 className={`text-sm font-black uppercase italic truncate ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>{item.title}</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{item.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => handleLike(e, item)} className="p-3 bg-white/5 rounded-xl hover:bg-orange-500/20 transition-all">
                      <Heart size={18} className={savedTracks.some(st => st.track_id === item.id) ? "text-orange-500 fill-orange-500" : "text-gray-600"} />
                    </button>
                    <button onClick={(e) => handleDownload(e, item)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-gray-600 hover:text-white transition-all">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              )
            })
          }
        </div>
      </main>

      {/* Mobile Footer Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] z-50 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 flex justify-around shadow-2xl items-center">
        <Link to="/dashboard" className="p-3 text-orange-500"><Home size={22} /></Link>
        <Link to="/chat" className="p-3 text-gray-700 hover:text-white transition-colors"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-3 text-gray-700 hover:text-white transition-colors"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-3 text-gray-700 hover:text-white transition-colors"><User size={22} /></Link>
      </nav>
    </div>
  )
}