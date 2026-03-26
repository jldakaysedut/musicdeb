import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { Disc3, User, Lock, Mail, ChevronRight } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Gawa ng account sa Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // 2. I-save ang Username sa Profiles Table (Dito nangyayari yung error mo dati)
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id, 
              username: username || email.split('@')[0], // Default sa email prefix kung walang username
              role: 'user',
              download_count: 0
            }
          ])

        if (profileError) {
          console.error("Profile Insert Error:", profileError)
          throw new Error("Account created, but failed to save profile details.")
        }

        // Kapag success, lipad agad sa Dashboard!
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center p-6 selection:bg-orange-500">
      
      <div className="w-full max-w-md bg-[#0A0A0A] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Glow Effect sa likod */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <Disc3 size={32} className="text-black animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Join <span className="text-orange-500">JamList</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">Create your curator account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative group">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
            <input type="text" placeholder="Username (e.g., dkay)" value={username} onChange={(e) => setUsername(e.target.value)} required
              className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold text-sm transition-all" />
          </div>

          <div className="relative group">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold text-sm transition-all" />
          </div>

          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
            <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold text-sm transition-all" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-orange-500 text-black font-black uppercase italic tracking-widest rounded-2xl hover:bg-orange-400 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-orange-500/20">
            {loading ? <Disc3 className="animate-spin" size={20} /> : <><ChevronRight size={20}/> Create Account</>}
          </button>
        </form>

        <p className="text-center mt-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">
          Already a curator? <Link to="/login" className="text-orange-500 hover:text-white transition-colors">Login here</Link>
        </p>
      </div>
    </div>
  )
}