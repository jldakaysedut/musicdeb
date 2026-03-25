import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Save, Camera } from 'lucide-react'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState(null) // Para sa local image file
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUser(user)

      const { data, error } = await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
      if (error) throw error
      if (data) {
        setUsername(data.username || '')
        setAvatarUrl(data.avatar_url || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    
    try {
      let finalAvatarUrl = avatarUrl

      // Kung may piniling bagong picture yung user, i-upload muna natin!
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `${user.id}-${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile)

        if (uploadError) throw uploadError

        // Kunin yung public link ng in-upload na picture
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
        finalAvatarUrl = urlData.publicUrl
      }

      // I-save sa database yung profile details (wala nang updated_at dito)
      const updates = {
        id: user.id,
        username,
        avatar_url: finalAvatarUrl
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error

      setAvatarUrl(finalAvatarUrl)
      setAvatarFile(null) // i-clear yung file input pagkatapos
      setMessage('Profile updated successfully!')
    } catch (error) {
      setMessage('Error updating profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#090909] flex items-center justify-center text-green-500 font-bold">Loading vault identity...</div>

  return (
    <div className="min-h-screen bg-[#090909] text-white font-sans p-6 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-md mx-auto pt-10 z-10 relative">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors mb-8">
          <ArrowLeft size={20} /> Back to Vault
        </Link>

        <h1 className="text-4xl font-black mb-2 tracking-tight">Your Identity.</h1>
        <p className="text-gray-400 font-medium mb-8">Customize your public profile</p>

        {message && (
          <div className={`p-4 rounded-2xl mb-6 text-sm font-bold text-center ${message.includes('Error') ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
            {message}
          </div>
        )}

        <form onSubmit={updateProfile} className="flex flex-col gap-6">
          {/* Avatar Preview */}
          <div className="flex justify-center mb-2">
            <div className="w-32 h-32 rounded-full bg-[#121212] border-2 border-[#222] overflow-hidden flex items-center justify-center shadow-2xl relative group">
              {avatarFile ? (
                <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full object-cover" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-[#333]" />
              )}
            </div>
          </div>

          {/* Local Image Uploader */}
          <div className="relative border-2 border-dashed border-[#333] rounded-2xl p-4 text-center bg-[#141414] hover:border-green-500/50 hover:bg-[#1a1a1a] transition-all group">
            <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="flex items-center justify-center gap-2">
              <Camera size={20} className="text-gray-500 group-hover:text-green-500 transition-colors" />
              <p className="text-sm text-gray-400 font-medium group-hover:text-white transition-colors">
                {avatarFile ? avatarFile.name : "Tap to upload picture"}
              </p>
            </div>
          </div>

          <div className="relative">
            <label className="text-sm font-bold text-gray-400 mb-2 block">Username</label>
            <div className="relative">
              <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" required
                className="w-full pl-12 pr-4 py-4 bg-[#141414] rounded-2xl focus:outline-none border border-[#222] focus:border-green-500 text-white font-medium transition-colors" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-4 mt-4 bg-green-500 text-black font-extrabold text-lg rounded-2xl hover:bg-green-400 transition-all shadow-[0_10px_20px_rgba(34,197,94,0.2)] disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={20} /> {saving ? 'Uploading & Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}