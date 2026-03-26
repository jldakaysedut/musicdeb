import { Routes, Route, Navigate } from 'react-router-dom'
import { AudioProvider } from './context/AudioContext'
import GlobalPlayer from './components/GlobalPlayer'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import RadioHub from './pages/RadioHub' // 👈 BAGONG IMPORT
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Chat from './pages/Chat'
import Admin from './pages/Admin'

function App() {
  return (
    <AudioProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/radio" element={<RadioHub />} /> {/* 👈 BAGONG ROUTE */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <GlobalPlayer />
    </AudioProvider>
  )
}

export default App