import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // I-check agad kung may naka-login pagka-open ng app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Bantayan kung maglo-login o maglo-logout yung user
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-green-500 selection:text-black">
        <Routes>
          {/* Kung naka-login na, ibato sa dashboard. Kung hindi, ipakita ang Landing/Login */}
          <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" />} />
          
          {/* Kung hindi naka-login, bawal pumasok dito. Ibato sa login page. */}
          <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App