import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' 
import { Play, Pause, Search, Download, Disc3, Home, MessageSquare, Radio, Trophy, User } from 'lucide-react'

export default function RadioHub() {
  const [tracks, setTracks] = useState([])
  const [searchQuery, setSearchQuery] = useState('') 
  const [loading, setLoading] = useState(false)
  
  const { currentTrack, isPlaying, playTrack } = useAudio()

  const fetchMusic = async (e) => {
    e.preventDefault()
    if(!searchQuery.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=30`)
      const json = await res.json()
      if (json.results) {
        setTracks(json.results.map(t => ({
          id: t.trackId.toString(), title: t.trackName, artist: t.artistName, file_url: t.previewUrl, download_url: t.previewUrl, cover_image: t.artworkUrl100?.replace('100x100bb', '600x600bb')
        })))
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleDownload = async (e, track) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('download_count').eq('id', user.id).single()
    await supabase.from('profiles').update({ download_count: (profile?.download_count || 0) + 1 }).eq('id', user.id)
    window.open(track.download_url, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-44">
      <header className="max-w-6xl mx-auto p-6 pt-10 flex flex-col items-center">
        <Radio size={40} className="text-orange-500 mb-4 animate-pulse" />
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-center">Global <span className="text-orange-500">Radio</span></h1>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Search the network</p>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-4">
        <form onSubmit={fetchMusic} className="mb-8 flex gap-2">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500" />
            <input type="text" placeholder="Search any song to play & download..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold" />
          </div>
          <button type="submit" className="px-6 bg-orange-500 text-black font-black uppercase rounded-2xl hover:bg-orange-400">Tune In</button>
        </form>

        <div className="space-y-3">
          {loading ? <div className="text-center py-20 text-orange-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Scanning Frequencies...</div> : 
            tracks.map((item, index) => (
              <div key={item.id} onClick={() => playTrack(index, tracks)} className="p-3 bg-[#0A0A0A] rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 cursor-pointer">
                <div className="flex items-center gap-4 truncate">
                  <div className="relative w-12 h-12 rounded-xl bg-black overflow-hidden shrink-0">
                    <img src={item.cover_image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      {currentTrack?.file_url === item.file_url && isPlaying ? <Pause size={18}/> : <Play size={18}/>}
                    </div>
                  </div>
                  <div className="truncate text-left">
                    <h4 className={`text-sm font-black uppercase italic truncate ${currentTrack?.file_url === item.file_url ? 'text-orange-500' : 'text-white'}`}>{item.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{item.artist}</p>
                  </div>
                </div>
                <button onClick={(e) => handleDownload(e, item)} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"><Download size={18} /></button>
              </div>
            ))
          }
        </div>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] md:w-[400px] z-40 bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-6 py-3 flex justify-between shadow-2xl items-center">
        <Link to="/dashboard" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><MessageSquare size={24} /></Link>
        <Link to="/radio" className="p-4 bg-orange-500 text-black rounded-full -mt-10 border-4 border-[#050505] shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all"><Radio size={24} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><User size={24} /></Link>
      </nav>
    </div>
  )
}