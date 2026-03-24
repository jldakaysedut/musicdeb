import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    // Eto yung code na nagpapadala ng data sa Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('Account created successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000) // Pupunta sa login page after 2 seconds
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-sm p-8 bg-gray-900 rounded-2xl shadow-lg border border-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
        
        {errorMsg && <p className="text-red-400 text-sm mb-4 text-center">{errorMsg}</p>}
        {successMsg && <p className="text-green-400 text-sm mb-4 text-center">{successMsg}</p>}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
            placeholder="Password (min 6 chars)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button 
            type="submit" 
            className="w-full py-3 mt-2 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-green-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}