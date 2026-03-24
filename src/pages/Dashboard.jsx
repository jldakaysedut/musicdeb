import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, UploadCloud, LogOut, Trash2 } from 'lucide-react'

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  // --- AUDIO PLAYER STATE ---
  const audioRef = useRef(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)

  useEffect(() => { fetchTracks() }, [])

  const fetchTracks = async () => {
    const { data } = await supabase.from('tracks').select('*').order('created_at', { ascending: false })
    if (data) setTracks(data)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return alert("Select a file bro!")
    setUploading(true)
    const filePath = `${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('music-bucket').upload(filePath, file)
    
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('music-bucket').getPublicUrl(filePath)
      await supabase.from('tracks').insert([{ title, artist, file_url: publicUrlData.publicUrl }])
      setTitle(''); setArtist(''); setFile(null); setShowUpload(false); fetchTracks()
    }
    setUploading(false)
  }

  // --- DELETE LOGIC ---
  const handleDelete = async (e, id, fileUrl, index) => {
    e.stopPropagation() // Pumipigil na mag-play yung kanta pag kinlick mo yung delete button
    
    const confirmDelete = window.confirm("Are you sure you want to delete this track from your vault?")
    if (!confirmDelete) return

    // 1. Burahin sa Database
    const { error: dbError } = await supabase.from('tracks').delete().eq('id', id)
    
    if (!dbError) {
      // 2. Kunin ang filename galing sa URL at burahin sa Storage
      const fileName = fileUrl.split('/').pop()
      await supabase.storage.from('music-bucket').remove([fileName])

      // 3. Kung yung kanta na binura ay yung naka-play ngayon, i-stop ang music player
      if (currentTrackIndex === index) {
        if (audioRef.current) audioRef.current.pause()
        setIsPlaying(false)
        setCurrentTrackIndex(null)
      }

      // 4. I-refresh ang listahan
      fetchTracks()
    } else {
      alert("Error deleting track: " + dbError.message)
    }
  }

  // --- PLAYER LOGIC ---
  const playTrack = (index) => {
    setCurrentTrackIndex(index)
    setIsPlaying(true)
    setTimeout(() => { if (audioRef.current) audioRef.current.play() }, 100)
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (tracks.length === 0) return
    let nextIndex = currentTrackIndex + 1
    if (isShuffle) nextIndex = Math.floor(Math.random() * tracks.length)
    else if (nextIndex >= tracks.length) nextIndex = 0
    playTrack(nextIndex)
  }

  const handlePrev = () => {
    if (tracks.length === 0) return
    let prevIndex = currentTrackIndex - 1
    if (prevIndex < 0) prevIndex = tracks.length - 1
    playTrack(prevIndex)
  }

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime
      const duration = audioRef.current.duration
      setProgress((current / duration) * 100)
    }
  }

  const onEnded = () => {
    if (isRepeat) audioRef.current.play()
    else handleNext()
  }

  const handleLogout = async () => await supabase.auth.signOut()

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed text-white pb-32" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}>
      
      <div className="fixed inset-0 bg-black/40 backdrop-blur-3xl -z-10"></div>

      <div className="p-5 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8 pt-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Jam<span className="text-green-400">List</span></h1>
          <div className="flex gap-2">
            <button onClick={() => setShowUpload(!showUpload)} className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition">
              <UploadCloud size={20} />
            </button>
            <button onClick={handleLogout} className="p-3 bg-red-500/10 text-red-400 backdrop-blur-md rounded-full border border-red-500/20 hover:bg-red-500/20 transition">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {showUpload && (
          <div className="mb-6 p-5 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-bold mb-4">Add New Track</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <input type="text" placeholder="Song Title" required value={title} onChange={(e) => setTitle(e.target.value)}
                className="p-3 bg-black/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm border border-white/10" />
              <input type="text" placeholder="Artist" required value={artist} onChange={(e) => setArtist(e.target.value)}
                className="p-3 bg-black/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm border border-white/10" />
              <input type="file" accept="audio/*" required onChange={(e) => setFile(e.target.files[0])}
                className="p-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/20 file:text-white" />
              <button type="submit" disabled={uploading}
                className="mt-2 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                {uploading ? 'Uploading...' : 'Save to Vault'}
              </button>
            </form>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {tracks.map((track, index) => {
            const isPlayingThis = currentTrackIndex === index
            return (
              <div key={track.id} 
                   onClick={() => playTrack(index)}
                   className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 border backdrop-blur-md group
                    ${isPlayingThis ? 'bg-white/20 border-green-400/50 shadow-lg scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 
                    ${isPlayingThis ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-black/40 text-gray-400'}`}>
                    {isPlayingThis && isPlaying ? <div className="flex gap-1 items-end h-4">
                      <div className="w-1 bg-black h-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 bg-black h-2/3 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 bg-black h-1/2 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div> : <Play size={20} className="ml-1" />}
                  </div>

                  <div className="overflow-hidden">
                    <h3 className={`font-bold truncate ${isPlayingThis ? 'text-green-400' : 'text-white'}`}>{track.title}</h3>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                  </div>
                </div>

                {/* DELETE BUTTON */}
                <button 
                  onClick={(e) => handleDelete(e, track.id, track.file_url, index)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete Track"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {currentTrack && (
        <div className="fixed bottom-4 left-4 right-4 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-10">
          <div className="w-full h-1 bg-gray-600 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-green-400 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-1/3 truncate">
              <h4 className="font-bold text-sm text-white truncate">{currentTrack.title}</h4>
              <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setIsShuffle(!isShuffle)} className={`${isShuffle ? 'text-green-400' : 'text-gray-400'}`}><Shuffle size={18} /></button>
              <button onClick={handlePrev} className="text-white hover:text-green-400"><SkipBack size={24} /></button>
              <button onClick={togglePlayPause} className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full shadow-lg hover:scale-105 transition-transform">
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
              <button onClick={handleNext} className="text-white hover:text-green-400"><SkipForward size={24} /></button>
              <button onClick={() => setIsRepeat(!isRepeat)} className={`${isRepeat ? 'text-green-400' : 'text-gray-400'}`}><Repeat size={18} /></button>
            </div>
            <audio ref={audioRef} src={currentTrack.file_url} onTimeUpdate={onTimeUpdate} onEnded={onEnded} className="hidden" />
          </div>
        </div>
      )}
    </div>
  )
}