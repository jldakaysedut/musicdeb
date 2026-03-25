import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Save, Camera, Home, MessageSquare, Trophy, LayoutGrid, Sparkles } from 'lucide-react'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
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
      console.error('Profile fetch error:', error.message)
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

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `${user.id}-${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
        finalAvatarUrl = urlData.publicUrl
      }

      const updates = {
        id: user.id,
        username,
        avatar_url: finalAvatarUrl
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error

      setAvatarUrl(finalAvatarUrl)
      setAvatarFile(null)
      setMessage('Identity updated successfully.')
    } catch (error) {
      setMessage('Update failed: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Loading Identity...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-40 relative overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-md mx-auto pt-10 z-10 relative">
        
        {/* Header Navigation */}
        <header className="mb-10">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-all font-bold text-sm group mb-8">
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-orange-500/10">
              <ArrowLeft size={18} />
            </div>
            Exit to Vault
          </Link>
          <h1 className="text-4xl font-black tracking-tightest uppercase italic">Your <span className="text-orange-500">Identity</span></h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Choose how the vault sees you.</p>
        </header>

        {/* Feedback Message */}
        {message && (
          <div className={`p-4 rounded-2xl mb-8 text-xs font-black text-center uppercase tracking-widest animate-in fade-in slide-in-from-top-2 border ${message.includes('failed') ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
            {message}
          </div>
        )}

        <form onSubmit={updateProfile} className="space-y-8">
          
          {/* Avatar Management */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-[#111] border-2 border-white/5 overflow-hidden flex items-center justify-center shadow-2xl transition-all group-hover:border-orange-500/50">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-gray-800" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-black shadow-lg border-4 border-[#050505]">
                <Camera size={18} strokeWidth={3} />
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Tap the camera to update photo</p>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Display Name</label>
            <div className="relative group">
              <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Unique Username" 
                required
                className="w-full pl-14 pr-6 py-5 bg-white/[0.02] rounded-2xl border border-white/5 focus:border-orange-500 outline-none text-sm font-bold text-white transition-all" 
              />
            </div>
          </div>

          {/* Update Action */}
          <div className="pt-4">
            <button type="submit" disabled={saving}
              className="w-full py-5 bg-orange-500 text-black font-black text-lg rounded-2xl hover:bg-orange-400 hover:scale-[1.02] transition-all shadow-[0_15px_30px_rgba(249,115,22,0.2)] disabled:opacity-50 flex items-center justify-center gap-3">
              <Save size={20} strokeWidth={3} />
              {saving ? 'SYNCING DATA...' : 'SAVE IDENTITY'}
            </button>
          </div>

        </form>

        {/* User Stats / Badge */}
        <div className="mt-16 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tighter">Premium Member</h4>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Part of the original curators</p>
          </div>
        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex justify-around items-center">
        <Link to="/dashboard" className="p-2 text-gray-500"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-gray-500"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-500"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-orange-500"><User size={22} /></Link>
      </nav>

      {/* Footer Branding */}
      <footer className="text-center py-10 opacity-30">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">
          Handcrafted by <span className="text-white">Dakay</span>
        </p>
      </footer>
    </div>
  )
}