import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  // Kunin ang mga kanta pag-load ng page
  useEffect(() => {
    fetchTracks()
  }, [])

  const fetchTracks = async () => {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error("Error fetching tracks:", error)
    else setTracks(data)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return alert("Please select an MP3 file!")
    
    setUploading(true)

    // 1. Gumawa ng unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // 2. I-upload ang file sa Supabase Storage (music-bucket)
    const { error: uploadError } = await supabase.storage
      .from('music-bucket')
      .upload(filePath, file)

    if (uploadError) {
      alert("Error uploading file: " + uploadError.message)
      setUploading(false)
      return
    }

    // 3. Kunin ang Public URL ng in-upload na file
    const { data: publicUrlData } = supabase.storage
      .from('music-bucket')
      .getPublicUrl(filePath)

    // 4. I-save ang detalye sa database table (tracks)
    const { error: dbError } = await supabase
      .from('tracks')
      .insert([{ 
        title: title, 
        artist: artist, 
        file_url: publicUrlData.publicUrl 
      }])

    if (dbError) {
      alert("Error saving to database: " + dbError.message)
    } else {
      alert("Song uploaded successfully!")
      setTitle('')
      setArtist('')
      setFile(null)
      fetchTracks() // I-refresh ang listahan
    }
    
    setUploading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-400">My JamList</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900 transition"
        >
          Logout
        </button>
      </div>

      {/* Upload Form */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8">
        <h2 className="text-xl font-bold mb-4">Upload a Track</h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input 
            type="text" placeholder="Song Title" required
            value={title} onChange={(e) => setTitle(e.target.value)}
            className="p-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input 
            type="text" placeholder="Artist" required
            value={artist} onChange={(e) => setArtist(e.target.value)}
            className="p-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input 
            type="file" accept="audio/*" required
            onChange={(e) => setFile(e.target.files[0])}
            className="p-2 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-400"
          />
          <button 
            type="submit" disabled={uploading}
            className="py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Track'}
          </button>
        </form>
      </div>

      {/* Track List */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Your Vault</h2>
        {tracks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tracks uploaded yet.</p>
        ) : (
          tracks.map((track) => (
            <div key={track.id} className="bg-gray-800 p-4 rounded-xl flex flex-col gap-3">
              <div>
                <h3 className="font-bold text-lg text-white">{track.title}</h3>
                <p className="text-sm text-gray-400">{track.artist}</p>
              </div>
              <audio controls className="w-full h-10">
                <source src={track.file_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ))
        )}
      </div>
    </div>
  )
}