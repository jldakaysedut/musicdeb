import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    // Ito 'yung magche-check kung tama ba 'yung ginawa mong account kanina
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      // Kapag success, ibabato ka niya sa Dashboard!
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-sm p-8 bg-gray-900 rounded-2xl shadow-lg border border-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-400">Welcome Back</h2>
        
        {errorMsg && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-2 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account? <Link to="/register" className="text-green-400 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}