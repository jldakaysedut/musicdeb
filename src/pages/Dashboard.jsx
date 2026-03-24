import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchTracks()
  }, [])

  const fetchTracks = async () => {
    const { data, error } = await supabase.from('tracks').select('*').order('created_at', { ascending: false })
    if (!error) setTracks(data)
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
      setTitle(''); setArtist(''); setFile(null); fetchTracks()
    }
    setUploading(false)
  }

  const handleLogout = async () => await supabase.auth.signOut()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Modern Header */}
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 tracking-tight">
            JamList
          </h1>
          <button onClick={handleLogout} className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition backdrop-blur-md">
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Upload Section (Left Col on Desktop, Top on Mobile) */}
          <div className="md:col-span-1 h-fit bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-lg shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              Upload Track
            </h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <input type="text" placeholder="Song Title" required value={title} onChange={(e) => setTitle(e.target.value)}
                className="p-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-green-500 transition text-sm" />
              <input type="text" placeholder="Artist Name" required value={artist} onChange={(e) => setArtist(e.target.value)}
                className="p-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-green-500 transition text-sm" />
              
              <div className="relative border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-green-400/50 transition bg-black/20">
                <input type="file" accept="audio/*" required onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <p className="text-sm text-gray-400 font-medium">
                  {file ? file.name : "Tap to select .mp3 file"}
                </p>
              </div>

              <button type="submit" disabled={uploading}
                className="mt-2 py-3 w-full bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                {uploading ? 'Uploading to vault...' : 'Save to JamList'}
              </button>
            </form>
          </div>

          {/* Playlist Section (Right Col on Desktop, Bottom on Mobile) */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Your Vault</h2>
            <div className="flex flex-col gap-3">
              {tracks.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                  <p className="text-gray-400">Your vault is empty. Upload some tracks!</p>
                </div>
              ) : (
                tracks.map((track) => (
                  <div key={track.id} className="group bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 hover:border-white/10 transition backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 truncate">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shrink-0 shadow-inner">
                        <svg className="w-6 h-6 text-green-400 opacity-80" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path></svg>
                      </div>
                      <div className="truncate">
                        <h3 className="font-bold text-white text-lg truncate">{track.title}</h3>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                    {/* Native Audio Player with custom dark styling filters */}
                    <audio controls className="w-full md:w-64 h-10 outline-none grayscale invert-[0.8] contrast-[1.2] opacity-80 group-hover:opacity-100 transition">
                      <source src={track.file_url} type="audio/mpeg" />
                    </audio>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}