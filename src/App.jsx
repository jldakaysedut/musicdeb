import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import natin yung mga pages na ginawa mo
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Router>
      {/* Balot natin sa isang div na may dark background para pasok sa aesthetic natin */}
      <div className="min-h-screen bg-[#121212] text-white font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Route (Sa ngayon open muna, lalagyan natin ng lock later) */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App