import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { Play, Pause, LogOut, Search, Download, Heart, Disc3, User, Trophy, MessageSquare, Home } from 'lucide-react'

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [savedTracks, setSavedTracks] = useState([])
  const [filter, setFilter] = useState('All') 
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
      const json = await res.json()
      if (json.results) {
        setTracks(json.results.map(t => ({
          id: t.trackId.toString(),
          title: t.trackName,
          artist: t.artistName,
          file_url: t.previewUrl,
          download_url: t.previewUrl,
          cover_image: t.artworkUrl100?.replace('100x100bb', '500x500bb')
        })))
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  // 🔥 THE TRACKER: Increments user's download count in DB
  const handleDownloadTrack = async (track) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Get current count and add 1
    const { data: profile } = await supabase.from('profiles').select('download_count').eq('id', user.id).single()
    const newCount = (profile?.download_count || 0) + 1
    
    await supabase.from('profiles').update({ download_count: newCount }).eq('id', user.id)
    window.open(track.download_url, '_blank') // Open download link
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
      <header className="max-w-5xl mx-auto p-6 flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
          <Disc3 size={24} className="text-orange-500 animate-spin-slow" /> JAMLIST
        </h1>
        <div className="flex gap-3">
           <Link to="/leaderboard" className="p-3 bg-white/5 rounded-xl hover:text-orange-500 transition-all"><Trophy size={18} /></Link>
           <Link to="/profile" className="p-3 bg-white/5 rounded-xl hover:text-orange-500 transition-all"><User size={18} /></Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        <form onSubmit={(e) => { e.preventDefault(); fetchAppleMusic(searchQuery) }} className="mb-8 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
          <input type="text" placeholder="Search for tracks to download..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/[0.02] rounded-2xl border border-white/5 focus:border-orange-500 outline-none font-bold" />
        </form>

        <div className="space-y-3">
          {loading ? <div className="text-center py-10">Searching...</div> : 
            tracks.map((item, index) => (
              <div key={item.id} onClick={() => playTrack(index, tracks)} className="p-3 bg-[#0A0A0A] rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                <div className="flex items-center gap-4 truncate">
                  <img src={item.cover_image} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="truncate"><h4 className="text-sm font-black uppercase italic truncate">{item.title}</h4><p className="text-[10px] text-gray-500 uppercase">{item.artist}</p></div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => handleLike(e, item)} className="p-3"><Heart size={18} className={savedTracks.some(st => st.track_id === item.id) ? "text-orange-500 fill-orange-500" : "text-gray-500"} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDownloadTrack(item) }} className="p-3 text-gray-500 hover:text-white"><Download size={18} /></button>
                </div>
              </div>
            ))
          }
        </div>
      </main>

      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 flex justify-around shadow-2xl">
        <Link to="/dashboard" className="p-2 text-orange-500"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-700"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-700"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-gray-700"><User size={22} /></Link>
      </nav>
    </div>
  )
}