import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, LogOut, Trash2, Heart, MoreVertical, Plus, X, Radio } from 'lucide-react'

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [radios, setRadios] = useState([])
  const [filter, setFilter] = useState('All') // 'All', 'Favorites', or 'Radio'
  const [showUpload, setShowUpload] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)

  // Upload States
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [uploading, setUploading] = useState(false)
  const [fetchingRadio, setFetchingRadio] = useState(false)

  // Player States
  const audioRef = useRef(null)
  const [activeList, setActiveList] = useState('tracks') // 'tracks' or 'radios'
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => { 
    fetchTracks() 
    fetchLiveRadios()
  }, [])

  const fetchTracks = async () => {
    const { data } = await supabase.from('tracks').select('*').order('created_at', { ascending: false })
    if (data) setTracks(data)
  }

  // --- FETCH LIVE RADIO API ---
  const fetchLiveRadios = async () => {
    setFetchingRadio(true)
    try {
      // Kukuha tayo ng Top 15 stations sa Pilipinas
      const res = await fetch('https://de1.api.radio-browser.info/json/stations/search?limit=15&country=Philippines&hidebroken=true&order=clickcount')
      const data = await res.json()
      
      // Fini-filter natin yung HTTPS lang para hindi i-block ni Vercel
      const httpsStations = data.filter(s => s.url_resolved.startsWith('https'))
      
      const formattedRadios = httpsStations.map(s => ({
        id: s.stationuuid,
        title: s.name.trim(),
        artist: 'Live Broadcast 📻',
        file_url: s.url_resolved,
        is_radio: true
      }))
      setRadios(formattedRadios)
    } catch (e) {
      console.error("Radio fetch error:", e)
    }
    setFetchingRadio(false)
  }

  // --- CRUD OPERATIONS ---
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return alert("Select a file bro!")
    setUploading(true)
    const filePath = `${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('music-bucket').upload(filePath, file)
    
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('music-bucket').getPublicUrl(filePath)
      await supabase.from('tracks').insert([{ title, artist, file_url: urlData.publicUrl, is_favorite: false }])
      setTitle(''); setArtist(''); setFile(null); setShowUpload(false); fetchTracks()
    }
    setUploading(false)
  }

  const handleDelete = async (e, id, fileUrl, index) => {
    e.stopPropagation(); setOpenMenuId(null)
    if (!window.confirm("Delete this track?")) return

    const { error } = await supabase.from('tracks').delete().eq('id', id)
    if (!error) {
      const fileName = fileUrl.split('/').pop()
      await supabase.storage.from('music-bucket').remove([fileName])
      if (activeList === 'tracks' && currentTrackIndex === index) {
        audioRef.current?.pause(); setIsPlaying(false); setCurrentTrackIndex(null)
      }
      fetchTracks()
    }
  }

  const toggleFavorite = async (e, id, currentStatus) => {
    e.stopPropagation()
    const { error } = await supabase.from('tracks').update({ is_favorite: !currentStatus }).eq('id', id)
    if (!error) fetchTracks()
  }

  // --- PLAYER LOGIC ---
  const playTrack = (index, listType) => {
    setActiveList(listType)
    setCurrentTrackIndex(index)
    setIsPlaying(true)
    setTimeout(() => { audioRef.current?.play() }, 100)
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return
    isPlaying ? audioRef.current.pause() : audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    const currentArray = activeList === 'tracks' ? tracks : radios
    if (currentArray.length === 0) return
    let next = currentTrackIndex + 1
    if (isShuffle) next = Math.floor(Math.random() * currentArray.length)
    else if (next >= currentArray.length) next = 0
    playTrack(next, activeList)
  }

  const handlePrev = () => {
    const currentArray = activeList === 'tracks' ? tracks : radios
    if (currentArray.length === 0) return
    let prev = currentTrackIndex - 1
    if (prev < 0) prev = currentArray.length - 1
    playTrack(prev, activeList)
  }

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration
      // Pinoprotektahan nito yung app sa 'Infinity' duration ng Live Radio
      if (duration === Infinity || isNaN(duration)) {
        setProgress(100)
      } else {
        setProgress((audioRef.current.currentTime / duration) * 100)
      }
    }
  }

  const onEnded = () => isRepeat ? audioRef.current.play() : handleNext()
  const handleLogout = async () => await supabase.auth.signOut()

  const currentTrackArray = activeList === 'tracks' ? tracks : radios
  const currentTrack = currentTrackIndex !== null ? currentTrackArray[currentTrackIndex] : null
  
  // Logic kung ano i-di-display sa list
  const displayedItems = filter === 'Radio' 
    ? radios 
    : tracks.filter(t => filter === 'Favorites' ? t.is_favorite : true)

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed text-white pb-40 font-sans" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}>
      
      <div className="fixed inset-0 bg-black/50 backdrop-blur-3xl -z-10"></div>

      <div className="p-5 max-w-2xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-6 pt-4">
          <div>
            <p className="text-gray-400 text-sm font-medium">{greeting}</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Your <span className="text-green-400">Vault</span>
            </h1>
          </div>
          <button onClick={handleLogout} className="p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-red-500/20 hover:text-red-400 transition shadow-lg">
            <LogOut size={20} />
          </button>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setFilter('All')} 
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap border ${filter === 'All' ? 'bg-green-500 text-black border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}>
            All Tracks
          </button>
          <button onClick={() => setFilter('Favorites')} 
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap border flex items-center gap-2 ${filter === 'Favorites' ? 'bg-green-500 text-black border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}>
            <Heart size={16} className={filter === 'Favorites' ? 'fill-black' : ''} /> Favorites
          </button>
          <button onClick={() => setFilter('Radio')} 
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap border flex items-center gap-2 ${filter === 'Radio' ? 'bg-green-500 text-black border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}>
            <Radio size={16} /> Live Radio
          </button>
        </div>

        {/* LIST SECTION */}
        <div className="flex flex-col gap-3">
          {fetchingRadio && filter === 'Radio' ? (
            <div className="text-center py-10 animate-pulse text-green-400">Tuning in to frequencies...</div>
          ) : displayedItems.length === 0 ? (
            <div className="text-center py-10 bg-white/5 rounded-3xl border border-white/10 border-dashed">
              <p className="text-gray-400">No tracks found here.</p>
            </div>
          ) : (
            displayedItems.map((item, index) => {
              const currentListType = filter === 'Radio' ? 'radios' : 'tracks'
              
              // Find exact index in original array for correct player logic
              const originalIndex = currentListType === 'tracks' 
                ? tracks.findIndex(t => t.id === item.id) 
                : index
                
              const isPlayingThis = currentTrackIndex === originalIndex && activeList === currentListType
              const isMenuOpen = openMenuId === item.id

              return (
                <div key={item.id} onClick={() => playTrack(originalIndex, currentListType)}
                     className={`relative p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 border backdrop-blur-md group
                      ${isPlayingThis ? 'bg-white/20 border-green-400/50 shadow-lg scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                  
                  <div className="flex items-center gap-4 overflow-hidden w-full">
                    {/* Visualizer Art */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-gray-800 to-black
                      ${isPlayingThis ? 'shadow-[0_0_15px_rgba(34,197,94,0.5)] border border-green-500/50' : ''}`}>
                      {isPlayingThis && isPlaying ? (
                        <div className="flex gap-1 items-end h-4">
                          <div className="w-1 bg-green-400 h-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 bg-green-400 h-2/3 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 bg-green-400 h-1/2 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      ) : (
                        item.is_radio ? <Radio size={20} className="text-green-400 opacity-80" /> : <Play size={20} className="ml-1 text-white opacity-50" />
                      )}
                    </div>

                    <div className="overflow-hidden pr-2">
                      <h3 className={`font-bold text-base truncate ${isPlayingThis ? 'text-green-400' : 'text-white'}`}>{item.title}</h3>
                      <p className={`text-xs truncate mt-0.5 ${item.is_radio ? 'text-green-400/70' : 'text-gray-400'}`}>{item.artist}</p>
                    </div>
                  </div>

                  {/* Actions Area */}
                  {!item.is_radio && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={(e) => toggleFavorite(e, item.id, item.is_favorite)} className="p-2 transition-transform active:scale-75">
                        <Heart size={20} className={item.is_favorite ? "fill-green-400 text-green-400" : "text-gray-400"} />
                      </button>
                      <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : item.id) }} className="p-2 text-gray-400 hover:text-white">
                          <MoreVertical size={20} />
                        </button>
                        {isMenuOpen && (
                          <div className="absolute right-0 mt-2 w-32 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95">
                            <button onClick={(e) => handleDelete(e, item.id, item.file_url, originalIndex)} 
                                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-2">
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button onClick={() => setShowUpload(true)}
              className="fixed bottom-32 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:scale-110 hover:bg-green-400 transition-all z-40 text-black">
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* UPLOAD MODAL */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-5 animate-in fade-in duration-300">
          <div className="bg-white/10 border border-white/20 w-full max-w-sm p-6 rounded-[2rem] shadow-2xl relative">
            <button onClick={() => setShowUpload(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-black/20 rounded-full">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white">New Track</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <input type="text" placeholder="Song Title" required value={title} onChange={(e) => setTitle(e.target.value)}
                className="p-4 bg-black/40 rounded-xl focus:outline-none border border-white/10 text-white focus:border-green-400 transition" />
              <input type="text" placeholder="Artist" required value={artist} onChange={(e) => setArtist(e.target.value)}
                className="p-4 bg-black/40 rounded-xl focus:outline-none border border-white/10 text-white focus:border-green-400 transition" />
              
              <div className="relative border-2 border-dashed border-white/20 rounded-xl p-6 text-center bg-black/20 hover:border-green-400/50 transition">
                <input type="file" accept="audio/*" required onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <p className="text-sm text-gray-300 font-medium">{file ? file.name : "Tap here to select .mp3"}</p>
              </div>

              <button type="submit" disabled={uploading}
                className="mt-4 py-4 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition disabled:opacity-50 shadow-lg">
                {uploading ? 'Uploading to Vault...' : 'Upload Track'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* THE AUDIO PLAYER */}
      {currentTrack && (
        <div className="fixed bottom-4 left-4 right-4 bg-black/70 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-bottom-10">
          <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div className={`h-full transition-all duration-300 relative ${currentTrack.is_radio ? 'bg-green-500/50 w-full animate-pulse' : 'bg-gradient-to-r from-green-500 to-emerald-400'}`} style={{ width: currentTrack.is_radio ? '100%' : `${progress}%` }}>
              {!currentTrack.is_radio && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-1/3 truncate">
              <h4 className="font-bold text-sm text-white truncate">{currentTrack.title}</h4>
              <p className="text-xs text-green-400 truncate">{currentTrack.artist}</p>
            </div>
            <div className="flex items-center justify-center gap-5">
              {!currentTrack.is_radio && <button onClick={() => setIsShuffle(!isShuffle)} className={`${isShuffle ? 'text-green-400' : 'text-gray-500'} hover:text-white transition`}><Shuffle size={18} /></button>}
              <button onClick={handlePrev} className="text-white hover:text-green-400 transition"><SkipBack size={24} fill="currentColor" /></button>
              <button onClick={togglePlayPause} className="w-14 h-14 flex items-center justify-center bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={handleNext} className="text-white hover:text-green-400 transition"><SkipForward size={24} fill="currentColor" /></button>
              {!currentTrack.is_radio && <button onClick={() => setIsRepeat(!isRepeat)} className={`${isRepeat ? 'text-green-400' : 'text-gray-500'} hover:text-white transition`}><Repeat size={18} /></button>}
            </div>
            <div className="w-1/3 flex justify-end"></div>
            <audio ref={audioRef} src={currentTrack.file_url} onTimeUpdate={onTimeUpdate} onEnded={onEnded} className="hidden" />
          </div>
        </div>
      )}
    </div>
  )
}