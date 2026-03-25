import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioContext' // 🎧 CONNECTED TO GLOBAL ENGINE
import { 
  Play, Pause, LogOut, Plus, X, Search,
  Disc3, Music, User, Trophy, MessageSquare, Home
} from 'lucide-react'

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [radios, setRadios] = useState([])
  const [filter, setFilter] = useState('All') 
  const [searchQuery, setSearchQuery] = useState('') 
  const [showUpload, setShowUpload] = useState(false)
  
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [uploading, setUploading] = useState(false)
  
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // 🎧 GLOBAL AUDIO STATE
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  useEffect(() => { 
    fetchTracks() 
    fetchLiveRadios()
  }, [])

  const fetchTracks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }

    const { data } = await supabase
      .from('tracks')
      .select('*, profiles(username)')
      .or(`status.eq.approved,user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (data) setTracks(data)
  }

  const fetchLiveRadios = async () => {
    try {
      const res = await fetch('https://de1.api.radio-browser.info/json/stations/search?limit=15&country=Philippines&hidebroken=true&order=clickcount')
      const data = await res.json()
      const httpsStations = data.filter(s => s.url_resolved.startsWith('https'))
      const formattedRadios = httpsStations.map(s => ({
        id: s.stationuuid, title: s.name.trim(), artist: 'Live Broadcast 📻', file_url: s.url_resolved, is_radio: true
      }))
      setRadios(formattedRadios)
    } catch (e) { console.error("Radio fetch error:", e) }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) navigate('/login')
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return alert("Select a file to share your sound.")
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const filePath = `${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('music-bucket').upload(filePath, file)
    
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('music-bucket').getPublicUrl(filePath)
      await supabase.from('tracks').insert([{ 
        title, artist, file_url: urlData.publicUrl,
        user_id: user.id, status: 'pending' 
      }])
      setTitle(''); setArtist(''); setFile(null); setShowUpload(false); fetchTracks()
    }
    setUploading(false)
  }

  const displayedItems = filter === 'Radio' 
    ? radios.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tracks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              t.artist.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filter === 'Favorites' ? t.is_favorite : true
        return matchesSearch && matchesFilter
      })

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-44 overflow-x-hidden selection:bg-orange-500">
      
      {/* 1. TOP HEADER */}
      <header className="max-w-5xl mx-auto p-6 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{greeting}</p>
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 italic">
            <Disc3 size={24} className="text-orange-500 animate-spin-slow" />
            JAMLIST
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <Link to="/leaderboard" className="hidden md:flex w-10 h-10 bg-white/5 rounded-xl items-center justify-center border border-white/5 hover:border-orange-500/50 transition-colors"><Trophy size={18} /></Link>
           <Link to="/profile" className="hidden md:flex w-10 h-10 bg-white/5 rounded-xl items-center justify-center border border-white/5 hover:border-orange-500/50 transition-colors"><User size={18} /></Link>
           <button onClick={handleLogout} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90">
             <LogOut size={18} strokeWidth={3} />
           </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        
        {/* 2. INSTANT SEARCH BAR */}
        <div className="mb-4 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Search vaults by title or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/[0.02] rounded-2xl border border-white/5 focus:border-orange-500 outline-none text-sm font-bold text-white transition-all placeholder-gray-800"
          />
        </div>

        {/* 3. CATEGORY PILLS */}
        <div className="flex gap-3 overflow-x-auto py-4 no-scrollbar">
          {['All', 'Favorites', 'Radio'].map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} 
              className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all border 
              ${filter === cat ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-gray-400 border-white/5 hover:border-gray-600'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* 4. TRENDING CAROUSEL */}
        {filter === 'All' && tracks.length > 0 && !searchQuery && (
          <section className="mt-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 px-1 italic">Trending Vaults</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
              {tracks.slice(0, 4).map((track, i) => {
                const isPlayingThis = currentTrack?.id === track.id
                return (
                  <div key={track.id} onClick={() => isPlayingThis ? togglePlay() : playTrack(i, tracks)}
                    className={`min-w-[160px] h-[160px] border rounded-[2rem] p-5 flex flex-col justify-end relative overflow-hidden group cursor-pointer snap-center shadow-2xl transition-all ${isPlayingThis ? 'bg-orange-500/10 border-orange-500/50' : 'bg-[#0A0A0A] border-white/5'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {isPlayingThis && isPlaying ? (
                       <Pause size={20} className="absolute top-5 right-5 text-orange-500" />
                    ) : (
                       <Music size={20} className={`absolute top-5 right-5 ${isPlayingThis ? 'text-orange-500' : 'text-orange-500/20'}`} />
                    )}
                    <h3 className={`font-black text-sm truncate leading-tight uppercase italic ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>{track.title}</h3>
                    <p className="text-[9px] font-bold text-gray-600 uppercase mt-1 truncate">@{track.profiles?.username}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 5. MAIN FEED */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 italic">
              {searchQuery ? 'Search Results' : (filter === 'Radio' ? 'Global Stations' : 'Public Feed')}
            </h2>
            <span className="text-[10px] font-black text-gray-700 tracking-widest uppercase">{displayedItems.length} ITEMS</span>
          </div>

          <div className="space-y-3">
            {displayedItems.length === 0 ? (
              <div className="text-center py-24 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
                <Disc3 size={32} className="mx-auto text-gray-900 mb-4" />
                <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">
                  {searchQuery ? "No matches found." : "Vault Empty."}
                </p>
              </div>
            ) : (
              displayedItems.map((item, index) => {
                const listToPlay = filter === 'Radio' ? radios : tracks
                const realIndex = listToPlay.findIndex(t => t.id === item.id)
                const isPlayingThis = currentTrack?.id === item.id
                
                return (
                  <div key={item.id} onClick={() => isPlayingThis ? togglePlay() : playTrack(realIndex, listToPlay)}
                    className={`p-4 rounded-2xl flex items-center justify-between border transition-all cursor-pointer group 
                    ${isPlayingThis ? 'bg-orange-500/10 border-orange-500/20 shadow-xl' : 'bg-white/[0.03] border-transparent hover:border-white/5'}`}>
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 ${isPlayingThis ? 'bg-orange-500 text-black' : 'bg-[#111]'}`}>
                        {isPlayingThis && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className={isPlayingThis ? "" : "text-gray-700"} />}
                      </div>
                      <div className="truncate">
                        <h4 className={`text-sm font-black truncate uppercase italic ${isPlayingThis ? 'text-orange-500' : 'text-white'}`}>{item.title}</h4>
                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">{item.artist}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>

      {/* 6. UPLOAD FAB */}
      <button onClick={() => setShowUpload(true)} 
        className="fixed bottom-32 right-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-black shadow-[0_10px_30px_rgba(249,115,22,0.4)] z-40 active:scale-90 transition-transform">
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* 7. MODAL: UPLOAD */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm p-8 rounded-[2.5rem] relative shadow-2xl">
            <button onClick={() => setShowUpload(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-2 tracking-tighter italic uppercase">Upload to <span className="text-orange-500">Vault.</span></h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <input type="text" placeholder="Song Title" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 focus:border-orange-500 outline-none text-sm font-bold placeholder-gray-800" />
              <input type="text" placeholder="Artist Name" required value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 focus:border-orange-500 outline-none text-sm font-bold placeholder-gray-800" />
              <div className="relative border-2 border-dashed border-white/5 rounded-2xl p-8 text-center bg-white/[0.02] hover:bg-white/5 transition-colors">
                <input type="file" accept="audio/*" required onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Music size={24} className="mx-auto mb-2 text-gray-800" />
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{file ? file.name : "Select MP3 Vault File"}</p>
              </div>
              <button type="submit" disabled={uploading} className="w-full py-5 bg-orange-500 text-black font-black rounded-2xl hover:bg-orange-400 disabled:opacity-50 transition-all shadow-lg text-sm uppercase tracking-widest">
                {uploading ? 'SYNCING...' : 'CONFIRM UPLOAD'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex justify-around items-center">
        <Link to="/dashboard" className="p-2 text-orange-500"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-700"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-700"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-gray-700"><User size={22} /></Link>
      </nav>

      <div className="hidden md:block absolute bottom-8 right-12 opacity-30">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 italic">
          Designed by <span className="text-white">Dakay</span>
        </p>
      </div>
    </div>
  )
}