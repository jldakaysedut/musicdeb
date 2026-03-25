import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Disc3, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      // 1. VALIDATION: Check if Username already exists in the 'profiles' table
      const { data: userCheck, error: userCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle()

      if (userCheck) {
        throw new Error("This username is already claimed in the vault.")
      }

      // 2. SIGN UP: Attempt to register via Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { display_name: username }
        }
      })

      // 3. EMAIL VALIDATION: Handle if email is already taken
      // Note: Supabase might return an empty user object if 'Confirm Email' is ON and email exists.
      if (authError) throw authError
      
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error("This email is already linked to an existing vault.")
      }

      // 4. PROFILE CREATION: Create the record in 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: data.user.id, 
          username: username, 
          role: 'user' 
        }])

      if (profileError) throw profileError

      alert("Registration successful! Access your vault now.")
      navigate('/login')

    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col p-6 relative overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* Background Ambient Glows */}
      <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      <header className="z-20">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-all font-bold text-sm group">
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-orange-500/10">
            <ArrowLeft size={18} />
          </div>
          Back to Home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center z-10">
        <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-700">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 mb-6 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <Disc3 size={32} className="text-black animate-spin-slow" />
            </div>
            <h1 className="text-4xl font-black tracking-tightest mb-2 uppercase italic">Join the <span className="text-orange-500">Vault</span></h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Create your professional curator identity.</p>
          </div>
          
          {/* HIGH-END ERROR VALIDATION MESSAGE */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-xs font-black flex items-center gap-3 animate-in slide-in-from-top-2 uppercase tracking-widest">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username Input */}
            <div className={`group relative transition-all duration-300 rounded-2xl border ${focusedInput === 'username' ? 'border-orange-500 bg-white/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-white/5 bg-white/[0.02]'}`}>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <User size={18} className={focusedInput === 'username' ? 'text-orange-500' : 'text-gray-600'} />
              </div>
              <input 
                type="text" 
                placeholder="Unique Username" 
                required
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedInput('username')} 
                onBlur={() => setFocusedInput(null)}
                className="w-full pl-14 pr-5 py-5 bg-transparent text-white focus:outline-none placeholder-gray-800 font-bold text-sm" 
              />
            </div>

            {/* Email Input */}
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
                className="w-full pl-14 pr-5 py-5 bg-transparent text-white focus:outline-none placeholder-gray-800 font-bold text-sm" 
              />
            </div>
            
            {/* Password Input */}
            <div className={`group relative transition-all duration-300 rounded-2xl border ${focusedInput === 'password' ? 'border-orange-500 bg-white/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-white/5 bg-white/[0.02]'}`}>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock size={18} className={focusedInput === 'password' ? 'text-orange-500' : 'text-gray-600'} />
              </div>
              <input 
                type="password" 
                placeholder="Secure Password" 
                required
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')} 
                onBlur={() => setFocusedInput(null)}
                className="w-full pl-14 pr-5 py-5 bg-transparent text-white focus:outline-none placeholder-gray-800 font-bold text-sm" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 mt-2 bg-orange-500 text-black font-black text-sm rounded-2xl hover:bg-orange-400 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(249,115,22,0.2)] uppercase tracking-widest"
            >
              {loading ? 'Validating...' : (
                <>Join the Vault <UserPlus size={18} strokeWidth={3} /></>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">
              Already a member? <Link to="/login" className="text-orange-500 hover:underline underline-offset-8">Access Vault</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center py-6">
         <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.4em] italic">
          Designed by <span className="text-white">Dakay</span>
        </p>
      </footer>
    </div>
  )
}