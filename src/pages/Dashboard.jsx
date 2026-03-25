import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Play, Pause, SkipForward, SkipBack, 
  LogOut, Plus, X, Radio, 
  Disc3, Music, User, Trophy, MessageSquare, Home
} from 'lucide-react'

export default function Dashboard() {
  // --- STATE MANAGEMENT ---
  const [tracks, setTracks] = useState([])
  const [radios, setRadios] = useState([])
  const [filter, setFilter] = useState('All') 
  const [showUpload, setShowUpload] = useState(false)
  
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [uploading, setUploading] = useState(false)
  const [fetchingRadio, setFetchingRadio] = useState(false)

  const audioRef = useRef(null)
  const [activeList, setActiveList] = useState('tracks') 
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

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
    setFetchingRadio(true)
    try {
      const res = await fetch('https://de1.api.radio-browser.info/json/stations/search?limit=15&country=Philippines&hidebroken=true&order=clickcount')
      const data = await res.json()
      const httpsStations = data.filter(s => s.url_resolved.startsWith('https'))
      const formattedRadios = httpsStations.map(s => ({
        id: s.stationuuid, title: s.name.trim(), artist: 'Live Broadcast 📻', file_url: s.url_resolved, is_radio: true
      }))
      setRadios(formattedRadios)
    } catch (e) { console.error("Radio fetch error:", e) }
    setFetchingRadio(false)
  }

  // --- LOGOUT LOGIC ---
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

  const togglePlayPause = () => {
    if (!audioRef.current) return
    isPlaying ? audioRef.current.pause() : audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const playTrack = (index, listType) => {
    setActiveList(listType); setCurrentTrackIndex(index); setIsPlaying(true)
    setTimeout(() => { audioRef.current?.play() }, 100)
  }

  const onTimeUpdate = () => {
    if (audioRef.current) setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
  }

  const currentTrackArray = activeList === 'tracks' ? tracks : radios
  const currentTrack = currentTrackIndex !== null ? currentTrackArray[currentTrackIndex] : null

  const handleNext = () => {
    if (currentTrackIndex === null || currentTrackArray.length === 0) return
    const nextIndex = (currentTrackIndex + 1) % currentTrackArray.length
    playTrack(nextIndex, activeList)
  }

  const handlePrev = () => {
    if (currentTrackIndex === null || currentTrackArray.length === 0) return
    const prevIndex = (currentTrackIndex - 1 + currentTrackArray.length) % currentTrackArray.length
    playTrack(prevIndex, activeList)
  }

  const displayedItems = filter === 'Radio' ? radios : tracks.filter(t => filter === 'Favorites' ? t.is_favorite : true)

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-44 overflow-x-hidden selection:bg-orange-500">
      
      {/* 1. TOP HEADER (Added Logout Button) */}
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
           
           {/* LOGOUT BUTTON */}
           <button onClick={handleLogout} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90">
             <LogOut size={18} strokeWidth={3} />
           </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {/* 2. CATEGORY PILLS */}
        <div className="flex gap-3 overflow-x-auto py-4 no-scrollbar">
          {['All', 'Favorites', 'Radio'].map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} 
              className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all border 
              ${filter === cat ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-gray-400 border-white/5 hover:border-gray-600'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* 3. TRENDING CAROUSEL */}
        {filter === 'All' && tracks.length > 0 && (
          <section className="mt-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 px-1 italic">Trending Vaults</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
              {tracks.slice(0, 4).map((track, i) => (
                <div key={track.id} onClick={() => playTrack(i, 'tracks')}
                  className="min-w-[160px] h-[160px] bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-5 flex flex-col justify-end relative overflow-hidden group cursor-pointer snap-center shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Music size={20} className="absolute top-5 right-5 text-orange-500/20" />
                  <h3 className="font-black text-sm truncate leading-tight uppercase italic">{track.title}</h3>
                  <p className="text-[9px] font-bold text-gray-600 uppercase mt-1 truncate">@{track.profiles?.username}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. MAIN FEED */}
        <section className="mt-10">
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 italic">
              {filter === 'Radio' ? 'Global Stations' : 'Public Feed'}
            </h2>
            <span className="text-[10px] font-black text-gray-700 tracking-widest uppercase">{displayedItems.length} ITEMS</span>
          </div>

          <div className="space-y-3">
            {displayedItems.length === 0 ? (
              <div className="text-center py-24 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
                <Disc3 size={32} className="mx-auto text-gray-900 mb-4" />
                <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Vault Empty.</p>
              </div>
            ) : (
              displayedItems.map((item, index) => {
                const isPlayingThis = currentTrackIndex === index && activeList === (filter === 'Radio' ? 'radios' : 'tracks')
                return (
                  <div key={item.id} onClick={() => playTrack(index, filter === 'Radio' ? 'radios' : 'tracks')}
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

      {/* 5. UPLOAD FAB */}
      <button onClick={() => setShowUpload(true)} 
        className="fixed bottom-32 right-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-black shadow-[0_10px_30px_rgba(249,115,22,0.4)] z-40 active:scale-90 transition-transform">
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* 6. MODAL: UPLOAD */}
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

      {/* 7. PREMIUM BOTTOM PLAYER */}
      {currentTrack && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-2xl z-40 animate-in slide-in-from-bottom-10">
          <div className="w-full h-1 bg-white/5 rounded-full mb-5 overflow-hidden">
            <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg">
                <Music size={20} className="text-black" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-black truncate uppercase italic tracking-tight">{currentTrack.title}</h4>
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] truncate">{currentTrack.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={handlePrev} className="text-gray-500 hover:text-white transition-colors"><SkipBack size={22} fill="currentColor" /></button>
              <button onClick={togglePlayPause} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform">
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={handleNext} className="text-gray-500 hover:text-white transition-colors"><SkipForward size={22} fill="currentColor" /></button>
            </div>
            <audio ref={audioRef} src={currentTrack.file_url} onTimeUpdate={onTimeUpdate} onEnded={handleNext} className="hidden" />
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

      {/* FOOTER BRANDING */}
      <div className="hidden md:block absolute bottom-8 right-12 opacity-30">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 italic">
          Designed by <span className="text-white">Dakay</span>
        </p>
      </div>
    </div>
  )
}