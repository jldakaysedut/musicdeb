import { Routes, Route, Navigate } from 'react-router-dom'
import { AudioProvider } from './context/AudioContext'
import GlobalPlayer from './components/GlobalPlayer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'

function App() {
  return (
    <AudioProvider>
      <div className="page-transition">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {/* This makes the player float above ALL pages! */}
        <GlobalPlayer />
      </div>
    </AudioProvider>
  )
}

export default App