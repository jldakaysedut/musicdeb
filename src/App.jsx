import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AudioProvider } from './context/AudioContext'
import GlobalPlayer from './components/GlobalPlayer'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Chat from './pages/Chat'
import Admin from './pages/Admin'

function App() {
  return (
    <AudioProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {/* 📻 ITO ANG MAGIC: Lilitaw ang Radio sa lahat ng pages! */}
        <GlobalPlayer />
        
      </Router>
    </AudioProvider>
  )
}

export default App