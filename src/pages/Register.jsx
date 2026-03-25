import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, UserPlus, Disc3, ArrowLeft } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMsg(''); setSuccessMsg(''); setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setErrorMsg(error.message); setLoading(false) } 
    else {
      setSuccessMsg('Vault successfully generated! Routing...')
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-[#090909] text-white font-sans relative overflow-hidden">
      
      {/* Back Button */}
      <Link to="/" className="absolute top-8 left-8 p-3 bg-white/5 rounded-full hover:bg-white/10 transition z-20">
        <ArrowLeft size={20} />
      </Link>

      {/* Ambient Glow */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center z-10 animate-in fade-in duration-700">
        <div className="w-full max-w-[400px]">
          
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <UserPlus size={32} className="text-black" />
            </div>
          </div>
          
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black mb-2 tracking-tight">Start Listening.</h2>
            <p className="text-gray-400 font-medium">Create your free account today</p>
          </div>
          
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-sm text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl mb-6 text-sm text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {successMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className={`relative transition-all duration-300 rounded-2xl border ${focusedInput === 'email' ? 'border-green-500 bg-[#141414] shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-[#222] bg-[#111]'}`}>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail size={20} className={focusedInput === 'email' ? 'text-green-500 transition-colors' : 'text-gray-500'} />
              </div>
              <input type="email" placeholder="Email Address" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                className="w-full pl-14 pr-5 py-5 bg-transparent text-white focus:outline-none placeholder-gray-600 font-medium" />
            </div>
            
            <div className={`relative transition-all duration-300 rounded-2xl border ${focusedInput === 'password' ? 'border-green-500 bg-[#141414] shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-[#222] bg-[#111]'}`}>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock size={20} className={focusedInput === 'password' ? 'text-green-500 transition-colors' : 'text-gray-500'} />
              </div>
              <input type="password" placeholder="Password (Min 6 Characters)" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)}
                className="w-full pl-14 pr-5 py-5 bg-transparent text-white focus:outline-none placeholder-gray-600 font-medium" />
            </div>

            <button type="submit" disabled={loading}
              className="group w-full py-5 mt-4 bg-green-500 text-black font-extrabold text-lg rounded-2xl hover:bg-green-400 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.2)] disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? 'Processing...' : (
                <>Create Vault <Disc3 size={20} className="group-hover:rotate-180 transition-transform duration-500" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 font-medium">
            Already a member? <Link to="/login" className="text-white hover:text-gray-300 transition-colors underline underline-offset-4">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}