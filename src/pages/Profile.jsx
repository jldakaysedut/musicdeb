import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { User, Camera, Save } from 'lucide-react'
import NavLayout from '../components/NavLayout'

function LoadingScreen({ text }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div className="spin" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--black-5)', borderTopColor: 'var(--orange)' }} />
      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--white-30)' }}>{text}</p>
    </div>
  )
}

export default function Profile() {
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [user, setUser]             = useState(null)
  const [username, setUsername]     = useState('')
  const [avatarUrl, setAvatarUrl]   = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [message, setMessage]       = useState(null)
  const navigate = useNavigate()

  useEffect(() => { getProfile() }, [])

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUser(user)
      const { data } = await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
      if (data) { setUsername(data.username || ''); setAvatarUrl(data.avatar_url || '') }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const updateProfile = async (e) => {
    e.preventDefault(); setSaving(true); setMessage(null)
    try {
      let finalAvatarUrl = avatarUrl
      if (avatarFile) {
        const filePath = `${user.id}-${Math.random()}.${avatarFile.name.split('.').pop()}`
        const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, avatarFile)
        if (uploadErr) throw uploadErr
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
        finalAvatarUrl = urlData.publicUrl
      }
      const { error } = await supabase.from('profiles').upsert({ id: user.id, username, avatar_url: finalAvatarUrl })
      if (error) throw error
      setAvatarUrl(finalAvatarUrl); setAvatarFile(null)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (e) {
      setMessage({ type: 'error', text: 'Error: ' + e.message })
    } finally { setSaving(false) }
  }

  if (loading) return <NavLayout><LoadingScreen text="Loading your profile..." /></NavLayout>

  const avatarSrc = avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl

  return (
    <NavLayout>
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '28px 20px' }}>
        <div className="anim-fade-up" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>Your Profile</h1>
          <p style={{ fontSize: '14px', color: 'var(--white-60)' }}>Customize how the community sees you.</p>
        </div>

        {message && (
          <div className="anim-scale-in" style={{ padding: '14px 18px', borderRadius: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600,
            background: message.type === 'success' ? 'rgba(80,200,120,0.1)' : 'rgba(255,80,80,0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(80,200,120,0.25)' : 'rgba(255,80,80,0.25)'}`,
            color: message.type === 'success' ? '#50C878' : '#FF6060' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
            {message.text}
          </div>
        )}

        <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--black-4)', border: '3px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
              {avatarSrc ? <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="var(--white-30)" />}
            </div>
            <label style={{ position: 'relative', cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} style={{ position: 'absolute', opacity: 0, inset: 0 }} />
              <span className="btn-ghost" style={{ fontSize: '13px', padding: '10px 20px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={15} /> {avatarFile ? avatarFile.name : 'Change Photo'}
              </span>
            </label>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--white-30)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--white-30)', pointerEvents: 'none' }} />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a unique username" required className="input-field" style={{ paddingLeft: '44px' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--white-30)', marginTop: '8px' }}>This is how other members will find and recognize you.</p>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--white-30)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Email Address</label>
            <input type="email" value={user?.email || ''} disabled className="input-field" style={{ opacity: 0.4, cursor: 'not-allowed' }} />
            <p style={{ fontSize: '12px', color: 'var(--white-30)', marginTop: '8px' }}>Email cannot be changed from this page.</p>
          </div>

          <button type="submit" disabled={saving} className="btn-orange" style={{ width: '100%', fontSize: '15px', padding: '16px' }}>
            {saving ? (<><span className="spin" style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block' }} /> Saving...</>) : <><Save size={17} /> Save Profile</>}
          </button>
        </form>
      </div>
    </NavLayout>
  )
}