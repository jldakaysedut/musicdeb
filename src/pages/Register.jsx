import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMsg(''); setSuccessMsg('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setErrorMsg(error.message) } 
    else {
      setSuccessMsg('Account created! Redirecting...')
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center bg-fixed"
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}>
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md -z-10"></div>

      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
            <UserPlus size={28} className="text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2 text-center text-white">Join JamList</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">Create your personal audio vault</p>
        
        {errorMsg && <p className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm text-center">{errorMsg}</p>}
        {successMsg && <p className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-6 text-sm text-center">{successMsg}</p>}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full p-4 bg-black/40 text-white rounded-xl border border-white/10 focus:outline-none focus:border-white transition" />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full p-4 bg-black/40 text-white rounded-xl border border-white/10 focus:outline-none focus:border-white transition" />
          
          <button type="submit" 
            className="w-full py-4 mt-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition shadow-lg">
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-white font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}