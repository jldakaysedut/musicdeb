import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Disc3, ArrowLeft } from 'lucide-react'

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
    
    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    
    if (authError) { 
      setErrorMsg(authError.message)
      setLoading(false) 
    } else { 
      // 2. Check the user's role from the profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      // 3. Route them based on their role
      if (profile && profile.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-[#090909] text-white font-sans relative overflow-hidden">
      
      {/* Back Button */}
      <Link to="/" className="absolute top-8 left-8 p-3 bg-white/5 rounded-full hover:bg-white/10 transition z-20">
        <ArrowLeft size={20} />
      </Link>

      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center z-10 animate-in fade-in duration-700">
        <div className="w-full max-w-[400px]">
          
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] flex items-center justify-center shadow-xl">
              <Disc3 size={32} className="text-green-500" />
            </div>
          </div>
          
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black mb-2 tracking-tight">Welcome Back.</h2>
            <p className="text-gray-400 font-medium">Log in to access your vault</p>
          </div>
          
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-sm text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Animated Email Input */}
            <div className={`relative transition-all duration-300 rounded-2xl border ${focusedInput === 'email' ? 'border-green-500 bg-[#141414] shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-[#222] bg-[#111]'}`}>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail size={20} className={focusedInput === 'email' ? 'text-green-500 transition-colors' : 'text-gray-500'} />
              </div>
              <input type="email" placeholder="Email Address" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                className="w-full pl-14 pr-5 py-5 bg-transparent text-white focus:outline-none placeholder-gray-600 font-medium" />
            </div>
            
            {/* Animated Password Input */}
            <div className={`relative transition-all duration-300 rounded-2xl border ${focusedInput === 'password' ? 'border-green-500 bg-[#141414] shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-[#222] bg-[#111]'}`}>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock size={20} className={focusedInput === 'password' ? 'text-green-500 transition-colors' : 'text-gray-500'} />
              </div>
              <input type="password" placeholder="Password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)}
                className="w-full pl-14 pr-5 py-5 bg-transparent text-white focus:outline-none placeholder-gray-600 font-medium" />
            </div>

            <button type="submit" disabled={loading}
              className="group w-full py-5 mt-4 bg-white text-black font-extrabold text-lg rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? 'Authenticating...' : (
                <>Enter Vault <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 font-medium">
            Don't have an account? <Link to="/register" className="text-green-400 hover:text-green-300 transition-colors underline underline-offset-4">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}