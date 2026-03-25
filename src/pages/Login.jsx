import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Disc3, ArrowLeft, ShieldCheck } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    
    if (authError) { 
      setErrorMsg(authError.message)
      setLoading(false) 
    } else { 
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profile && profile.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col p-6 relative overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* Background Ambient Glow */}
      <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[10%] -left-[10%] w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header / Back Navigation */}
      <header className="z-20 mb-8 md:mb-0">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-all font-bold text-sm group">
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-orange-500/10">
            <ArrowLeft size={18} />
          </div>
          Return to Home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center z-10">
        <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-700">
          
          {/* Logo & Branding */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 mb-6 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <Disc3 size={32} className="text-black animate-spin-slow" />
            </div>
            <h1 className="text-4xl font-black tracking-tightest mb-2 uppercase italic">Access the <span className="text-orange-500">Vault</span></h1>
            <p className="text-gray-500 font-medium">Enter your credentials to unlock your library.</p>
          </div>
          
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Input Group */}
            <div className={`group relative transition-all duration-300 rounded-2xl border ${focusedInput === 'email' ? 'border-orange-500 bg-white/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-white/5 bg-white/[0.02]'}`}>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail size={18} className={focusedInput === 'email' ? 'text-orange-500' : 'text-gray-600'} />
              </div>
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')} 
                onBlur={() => setFocusedInput(null)}
                className="w-full pl-14 pr-5 py-5 bg-transparent text-white focus:outline-none placeholder-gray-700 font-bold text-sm" 
              />
            </div>
            
            {/* Password Input Group */}
            <div className={`group relative transition-all duration-300 rounded-2xl border ${focusedInput === 'password' ? 'border-orange-500 bg-white/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-white/5 bg-white/[0.02]'}`}>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock size={18} className={focusedInput === 'password' ? 'text-orange-500' : 'text-gray-600'} />
              </div>
              <input 
                type="password" 
                placeholder="Password" 
                required
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')} 
                onBlur={() => setFocusedInput(null)}
                className="w-full pl-14 pr-5 py-5 bg-transparent text-white focus:outline-none placeholder-gray-700 font-bold text-sm" 
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 mt-4 bg-orange-500 text-black font-black text-lg rounded-2xl hover:bg-orange-400 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(249,115,22,0.2)]"
            >
              {loading ? 'AUTHENTICATING...' : (
                <>UNLOCK VAULT <LogIn size={20} strokeWidth={3} /></>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-10 text-center">
            <p className="text-gray-500 font-bold text-sm mb-6">
              Don't have an account? <Link to="/register" className="text-orange-500 hover:text-orange-400 transition-colors underline underline-offset-8">Join the community</Link>
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 opacity-50">
              <ShieldCheck size={14} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Enterprise-Grade Security</span>
            </div>
          </div>

        </div>
      </main>

      {/* Signature Footer */}
      <footer className="text-center py-6 z-10">
         <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
          Handcrafted by <span className="text-gray-400">Dakay</span>
        </p>
      </footer>
    </div>
  )
}