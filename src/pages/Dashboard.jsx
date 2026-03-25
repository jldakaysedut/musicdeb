import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { Play, Pause, LogOut, Search, Download, Heart, Disc3, User, Trophy, MessageSquare, Home } from 'lucide-react'

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [savedTracks, setSavedTracks] = useState([])
  const [searchQuery, setSearchQuery] = useState('') 
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  useEffect(() => { 
    fetchMusic('Hev Abi') 
    fetchSavedTracks() 
  }, [])

  const fetchSavedTracks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('saved_tracks').select('*').eq('user_id', user.id)
    if (data) setSavedTracks(data)
  }

  const fetchMusic = async (query = 'Hev Abi') => {
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
    } catch (err) { console.error("Search error:", err) }
    setLoading(false)
  }

  const handleDownloadAction = async (e, track) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Update score in DB
    const { data: profile } = await supabase.from('profiles').select('download_count').eq('id', user.id).single()
    await supabase.from('profiles').update({ download_count: (profile?.download_count || 0) + 1 }).eq('id', user.id)
    
    // Trigger the actual file download
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
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-44 selection:bg-orange-500">
      <header className="max-w-6xl mx-auto p-6 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Disc3 size={24} className="text-orange-500 animate-spin-slow" />
          <h1 className="text-xl font-black italic tracking-tighter uppercase">JAMLIST</h1>
        </div>
        <div className="flex gap-4">
           <Link to="/leaderboard" className="p-2 hover:text-orange-500 transition-colors"><Trophy size={20} /></Link>
           <Link to="/profile" className="p-2 hover:text-orange-500 transition-colors"><User size={20} /></Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <form onSubmit={(e) => { e.preventDefault(); fetchMusic(searchQuery) }} className="mb-10 relative flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" placeholder="Search mainstream hits..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold" />
          </div>
          <button type="submit" className="px-6 bg-orange-500 text-black font-black uppercase rounded-2xl hover:bg-orange-400 transition-all">Find</button>
        </form>

        <div className="space-y-3">
          {loading ? <div className="text-center py-20 animate-pulse text-gray-500 font-black uppercase tracking-widest">Searching Network...</div> : 
            tracks.map((item, index) => {
              const isPlayingThis = currentTrack?.file_url === item.file_url
              return (
                <div key={item.id} onClick={() => playTrack(index, tracks)} 
                  className={`p-3 rounded-2xl flex items-center justify-between border transition-all cursor-pointer group ${isPlayingThis ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}>
                  <div className="flex items-center gap-4 truncate">
                    <img src={item.cover_image} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="truncate text-left">
                      <h4 className={`text-sm font-black uppercase italic truncate ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>{item.title}</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">{item.artist}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={(e) => handleLike(e, item)} className="p-3"><Heart size={18} className={savedTracks.some(st => st.track_id === item.id) ? "text-orange-500 fill-orange-500" : "text-gray-600"} /></button>
                    <button onClick={(e) => handleDownloadAction(e, item)} className="p-3 text-gray-600 hover:text-white"><Download size={18} /></button>
                  </div>
                </div>
              )
            })
          }
        </div>
      </main>

      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 flex justify-around shadow-2xl">
        <Link to="/dashboard" className="p-2 text-orange-500"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-700"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-700"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-gray-700"><User size={22} /></Link>
      </nav>
    </div>
  )
}