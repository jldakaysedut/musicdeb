import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, LogOut, Trash2, Heart, MoreVertical, Plus, X, Radio, Disc3, Music, User } from 'lucide-react'

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [radios, setRadios] = useState([])
  const [filter, setFilter] = useState('All') 
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
  const [activeList, setActiveList] = useState('tracks') 
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

  // --- MATALINONG FETCH TRACKS (PUBLIC FEED FILTER) ---
  const fetchTracks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Kukunin lang ang APPROVED, o kaya ang PENDING na ikaw mismo ang nag-upload
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

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return alert("Select a file bro!")
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert("You must be logged in to upload!")

    setUploading(true)
    const filePath = `${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('music-bucket').upload(filePath, file)
    
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('music-bucket').getPublicUrl(filePath)
      
      await supabase.from('tracks').insert([{ 
        title, 
        artist, 
        file_url: urlData.publicUrl, 
        is_favorite: false,
        user_id: user.id,
        status: 'pending' 
      }])
      
      setTitle(''); setArtist(''); setFile(null); setShowUpload(false); fetchTracks()
    }
    setUploading(false)
  }

  const handleDelete = async (e, id, fileUrl, index) => {
    e.stopPropagation(); setOpenMenuId(null)
    if (!window.confirm("Delete this track from the vault?")) return
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

  const playTrack = (index, listType) => {
    setActiveList(listType); setCurrentTrackIndex(index); setIsPlaying(true)
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
      if (duration === Infinity || isNaN(duration)) setProgress(100)
      else setProgress((audioRef.current.currentTime / duration) * 100)
    }
  }

  const onEnded = () => isRepeat ? audioRef.current.play() : handleNext()
  const handleLogout = async () => await supabase.auth.signOut()

  const currentTrackArray = activeList === 'tracks' ? tracks : radios
  const currentTrack = currentTrackIndex !== null ? currentTrackArray[currentTrackIndex] : null
  const displayedItems = filter === 'Radio' ? radios : tracks.filter(t => filter === 'Favorites' ? t.is_favorite : true)

  const cardGradients = [
    "from-green-500 to-emerald-900", "from-[#222] to-[#0a0a0a]", "from-green-600 to-black", 
    "from-[#1a1a1a] to-[#050505]", "from-emerald-600 to-[#111]"
  ]

  return (
    <div className="min-h-screen bg-[#090909] text-white font-sans pb-40 overflow-x-hidden selection:bg-green-500 selection:text-black">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md md:max-w-4xl mx-auto p-6">
        
        <div className="flex justify-between items-center mb-10 pt-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <p className="text-gray-400 text-sm font-medium tracking-wider uppercase mb-1">{greeting}</p>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <Disc3 size={28} className="text-green-500" />
              JamList
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile" className="w-12 h-12 bg-[#121212] rounded-full border border-[#222] flex items-center justify-center hover:border-green-500/50 hover:text-green-500 transition-colors shadow-lg">
              <User size={20} />
            </Link>
            <button onClick={handleLogout} className="w-12 h-12 bg-[#121212] rounded-full border border-[#222] flex items-center justify-center hover:border-red-500/50 hover:text-red-400 transition-colors shadow-lg">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {filter === 'All' && tracks.length > 0 && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              Explore New <span className="text-green-500 text-xs px-2 py-1 bg-green-500/10 rounded-full">LATEST</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {tracks.slice(0, 5).map((track, idx) => {
                const isPlayingThis = currentTrackIndex === idx && activeList === 'tracks'
                const grad = cardGradients[idx % cardGradients.length]
                return (
                  <div key={track.id} onClick={() => playTrack(idx, 'tracks')} 
                       className={`min-w-[160px] h-[180px] rounded-3xl p-5 flex flex-col justify-end relative overflow-hidden cursor-pointer transition-transform duration-300 snap-center shadow-xl group
                        ${isPlayingThis ? 'border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-[1.02]' : 'border border-white/5 hover:scale-105'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-80 mix-blend-overlay`}></div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10">
                      <div className="w-12 h-12 bg-green-500 text-black rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-300">
                        {isPlayingThis && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
                      </div>
                    </div>
                    <Music size={24} className="text-white/30 absolute top-4 right-4" />
                    <div className="relative z-10">
                      <h3 className="font-black text-white text-lg leading-tight mb-1 truncate">{track.title}</h3>
                      <p className="text-xs text-green-400 font-medium truncate mt-1">@{track.profiles?.username || 'user'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setFilter('All')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border ${filter === 'All' ? 'bg-green-500 text-black border-green-400 shadow-[0_5px_15px_rgba(34,197,94,0.3)]' : 'bg-[#121212] text-gray-300 border-[#222] hover:border-gray-500'}`}>All Tracks</button>
            <button onClick={() => setFilter('Favorites')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border flex items-center gap-2 ${filter === 'Favorites' ? 'bg-green-500 text-black border-green-400 shadow-[0_5px_15px_rgba(34,197,94,0.3)]' : 'bg-[#121212] text-gray-300 border-[#222] hover:border-gray-500'}`}><Heart size={16} className={filter === 'Favorites' ? 'fill-black' : ''} /> Favorites</button>
            <button onClick={() => setFilter('Radio')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border flex items-center gap-2 ${filter === 'Radio' ? 'bg-green-500 text-black border-green-400 shadow-[0_5px_15px_rgba(34,197,94,0.3)]' : 'bg-[#121212] text-gray-300 border-[#222] hover:border-gray-500'}`}><Radio size={16} /> Live Radio</button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-10 animate-in fade-in duration-1000">
          <div className="flex justify-between items-center mb-2 px-2">
            <span className="text-gray-400 text-sm font-medium">{filter === 'Radio' ? 'Trending Stations' : 'Public Feed'}</span>
            <span className="text-gray-600 text-sm">{displayedItems.length} items</span>
          </div>

          {fetchingRadio && filter === 'Radio' ? (
            <div className="text-center py-12 animate-pulse text-green-500 font-bold">Scanning frequencies...</div>
          ) : displayedItems.length === 0 ? (
            <div className="text-center py-16 bg-[#121212] rounded-3xl border border-[#222] border-dashed">
              <Disc3 size={40} className="mx-auto text-[#333] mb-4 animate-spin-slow" />
              <p className="text-gray-400 font-medium">Your feed is empty.</p>
            </div>
          ) : (
            displayedItems.map((item, index) => {
              const currentListType = filter === 'Radio' ? 'radios' : 'tracks'
              const originalIndex = currentListType === 'tracks' ? tracks.findIndex(t => t.id === item.id) : index
              const isPlayingThis = currentTrackIndex === originalIndex && activeList === currentListType
              const isMenuOpen = openMenuId === item.id

              return (
                <div key={item.id} onClick={() => playTrack(originalIndex, currentListType)}
                     className={`relative p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 border group
                      ${isPlayingThis ? 'bg-[#1a1a1a] border-green-500/50 shadow-lg' : 'bg-[#121212] border-transparent hover:border-[#333]'}`}>
                  
                  <div className="flex items-center gap-4 overflow-hidden w-full">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#1a1a1a] to-[#050505] border border-[#222]
                      ${isPlayingThis ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : ''}`}>
                      {isPlayingThis && isPlaying ? (
                        <div className="flex gap-[3px] items-end h-4">
                          <div className="w-1 bg-green-500 h-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 bg-green-500 h-2/3 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 bg-green-500 h-1/2 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      ) : (
                        item.is_radio ? <Radio size={20} className="text-gray-500 group-hover:text-green-500 transition-colors" /> : <Play size={20} className="ml-1 text-gray-500 group-hover:text-white transition-colors" />
                      )}
                    </div>

                    <div className="overflow-hidden pr-2">
                      <h3 className={`font-bold text-base truncate ${isPlayingThis ? 'text-green-500' : 'text-white'}`}>{item.title}</h3>
                      <p className={`text-xs truncate mt-0.5 font-medium flex items-center gap-2 ${item.is_radio ? 'text-green-500/70' : 'text-gray-500'}`}>
                        {item.artist} 
                        {!item.is_radio && (
                          <>
                            <span>•</span>
                            <span className="text-green-500/80">@{item.profiles?.username || 'user'}</span>
                            {item.status === 'pending' && <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] rounded-full">Pending</span>}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {!item.is_radio && (
                    <div className="flex items-center gap-2 shrink-0 pr-2">
                      <button onClick={(e) => toggleFavorite(e, item.id, item.is_favorite)} className="p-2 transition-transform hover:scale-110 active:scale-90">
                        <Heart size={20} className={item.is_favorite ? "fill-green-500 text-green-500" : "text-gray-600 hover:text-gray-400"} />
                      </button>
                      <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : item.id) }} className="p-2 text-gray-600 hover:text-white transition-colors">
                          <MoreVertical size={20} />
                        </button>
                        {isMenuOpen && (
                          <div className="absolute right-0 mt-2 w-36 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95">
                            <button onClick={(e) => handleDelete(e, item.id, item.file_url, originalIndex)} 
                                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 font-bold flex items-center gap-3 transition-colors">
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

      <button onClick={() => setShowUpload(true)} className="fixed bottom-[140px] md:bottom-32 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(34,197,94,0.4)] hover:scale-105 hover:bg-green-400 transition-all z-40 text-black">
        <Plus size={28} strokeWidth={3} />
      </button>

      {showUpload && (
        <div className="fixed inset-0 bg-[#090909]/90 backdrop-blur-md z-50 flex items-center justify-center p-5 animate-in fade-in duration-300">
          <div className="bg-[#121212] border border-[#222] w-full max-w-sm p-8 rounded-[2rem] shadow-2xl relative">
            <button onClick={() => setShowUpload(false)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors bg-[#1a1a1a] rounded-full"><X size={20} /></button>
            <h2 className="text-2xl font-black mb-6 text-white tracking-tight">Add Track.</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <input type="text" placeholder="Song Title" required value={title} onChange={(e) => setTitle(e.target.value)} className="p-4 bg-[#1a1a1a] rounded-2xl focus:outline-none border border-[#222] focus:border-green-500 text-white font-medium transition-colors" />
              <input type="text" placeholder="Artist" required value={artist} onChange={(e) => setArtist(e.target.value)} className="p-4 bg-[#1a1a1a] rounded-2xl focus:outline-none border border-[#222] focus:border-green-500 text-white font-medium transition-colors" />
              <div className="relative border-2 border-dashed border-[#333] rounded-2xl p-8 text-center bg-[#141414] hover:border-green-500/50 hover:bg-[#1a1a1a] transition-all group">
                <input type="file" accept="audio/*" required onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Music size={32} className="mx-auto mb-2 text-gray-500 group-hover:text-green-500 transition-colors" />
                <p className="text-sm text-gray-400 font-medium group-hover:text-white transition-colors">{file ? file.name : "Tap to browse .mp3"}</p>
              </div>
              <button type="submit" disabled={uploading} className="mt-6 py-4 bg-green-500 text-black font-extrabold text-lg rounded-2xl hover:bg-green-400 transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(34,197,94,0.2)]">
                {uploading ? 'Processing...' : 'Upload Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {currentTrack && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-2xl bg-[#121212]/95 backdrop-blur-3xl border border-[#222] rounded-[2rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in slide-in-from-bottom-10">
          <div className="w-full h-1.5 bg-[#222] rounded-full mb-4 overflow-hidden">
            <div className={`h-full transition-all duration-300 relative ${currentTrack.is_radio ? 'bg-green-500/50 w-full animate-pulse' : 'bg-green-500'}`} style={{ width: currentTrack.is_radio ? '100%' : `${progress}%` }}></div>
          </div>
          <div className="flex items-center justify-between px-2">
            <div className="w-1/3 truncate">
              <h4 className="font-bold text-base text-white truncate leading-tight">{currentTrack.title}</h4>
              <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{currentTrack.artist}</p>
            </div>
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {!currentTrack.is_radio && <button onClick={() => setIsShuffle(!isShuffle)} className={`${isShuffle ? 'text-green-500' : 'text-gray-600'} hover:text-white transition`}><Shuffle size={18} /></button>}
              <button onClick={handlePrev} className="text-gray-300 hover:text-green-500 transition"><SkipBack size={24} fill="currentColor" /></button>
              <button onClick={togglePlayPause} className="w-14 h-14 flex items-center justify-center bg-green-500 text-black rounded-full shadow-[0_5px_15px_rgba(34,197,94,0.4)] hover:scale-105 transition-transform">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={handleNext} className="text-gray-300 hover:text-green-500 transition"><SkipForward size={24} fill="currentColor" /></button>
              {!currentTrack.is_radio && <button onClick={() => setIsRepeat(!isRepeat)} className={`${isRepeat ? 'text-green-500' : 'text-gray-600'} hover:text-white transition`}><Repeat size={18} /></button>}
            </div>
            <div className="w-1/3 flex justify-end">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[#222]"><Music size={14} className="text-green-500" /></div>
            </div>
            <audio ref={audioRef} src={currentTrack.file_url} onTimeUpdate={onTimeUpdate} onEnded={onEnded} className="hidden" />
          </div>
        </div>
      )}
    </div>
  )
}