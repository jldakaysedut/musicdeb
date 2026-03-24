import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setErrorMsg(error.message); setLoading(false) } 
    else { navigate('/dashboard') }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center bg-fixed"
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}>
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md -z-10"></div>

      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-green-500/20 rounded-2xl border border-green-500/30">
            <LogIn size={28} className="text-green-400" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-2 text-center text-white">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">Log in to access your JamList</p>
        
        {errorMsg && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm text-center backdrop-blur-sm">{errorMsg}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full p-4 bg-black/40 text-white rounded-xl border border-white/10 focus:outline-none focus:border-green-400 transition" />
          </div>
          <div>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full p-4 bg-black/40 text-white rounded-xl border border-white/10 focus:outline-none focus:border-green-400 transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 mt-2 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 text-sm">
          Don't have an account? <Link to="/register" className="text-green-400 font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}