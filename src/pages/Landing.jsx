import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Disc3, ArrowRight, Play, Heart, BarChart2, Shield, Smartphone, Zap, Github, Twitter, Instagram } from 'lucide-react'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  // Transition listener for sticky navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mock data for the "Sneak Peek" section based on your reference image
  const trendingPlaylists = [
    { title: "Retro Mix", color: "from-red-500 to-orange-500", plays: "2.4M" },
    { title: "Gym List", color: "from-cyan-500 to-blue-500", plays: "1.8M" },
    { title: "Lofi Study", color: "from-purple-500 to-pink-500", plays: "3.2M" }
  ]

  return (
    <div className="min-h-screen bg-[#090909] text-white font-sans overflow-x-hidden selection:bg-green-500 selection:text-black">
      
      {/* 1. FLOATING NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#090909]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <Disc3 size={24} className="text-black" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">Jam<span className="text-green-500">List</span></span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="hidden md:flex items-center px-6 py-2 rounded-full font-bold text-sm text-gray-300 hover:text-white transition">Sign In</Link>
            <Link to="/register" className="px-6 py-2 rounded-full font-bold text-sm bg-white text-black hover:scale-105 transition-transform shadow-lg">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (Smooth Fade-in) */}
      <section className="relative pt-40 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Now in Beta 2.0</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-tight animate-in slide-in-from-bottom-8 duration-700 delay-100">
          Your Music.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Your Rules.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl font-medium animate-in slide-in-from-bottom-10 duration-700 delay-200">
          Upload your personal audio vault, organize with custom playlists, and experience a premium dark-mode interface built for true audiophiles.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in zoom-in-95 duration-700 delay-300 z-10">
          <Link to="/register" className="group flex items-center justify-center px-8 py-4 rounded-full bg-green-500 text-black font-extrabold text-lg hover:bg-green-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            Open Web Player
            <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={20} />
          </Link>
        </div>
      </section>

      {/* 3. INTERACTIVE APP SNEAK PEEK (Based on your Reference Image) */}
      <section className="relative py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">A UI that hits different.</h2>
          <p className="text-gray-400">Designed purely for immersion.</p>
        </div>

        {/* Mockup Container */}
        <div className="bg-[#121212] border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
          
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-bold">Trending Playlists</h3>
            <span className="text-green-500 text-sm font-bold cursor-pointer hover:underline">See all</span>
          </div>

          {/* Horizontal Scroll Area */}
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
            {trendingPlaylists.map((playlist, i) => (
              <div key={i} className="min-w-[280px] group/card snap-center cursor-pointer">
                <div className={`h-40 rounded-3xl bg-gradient-to-br ${playlist.color} p-6 flex flex-col justify-end relative overflow-hidden transition-transform duration-500 group-hover/card:scale-105 shadow-xl`}>
                  {/* Glass Play Button on hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover/card:scale-100 transition-transform duration-300">
                      <Play size={24} className="ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-white relative z-10">{playlist.title}</h4>
                  <p className="text-white/80 text-sm font-medium relative z-10">{playlist.plays} Plays</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 hover:border-green-500/50 transition-colors duration-300 group">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
              <Zap size={28} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-gray-400 leading-relaxed">Powered by Vite and Supabase, your tracks load instantly with zero buffering.</p>
          </div>
          
          <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 hover:border-green-500/50 transition-colors duration-300 group">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
              <Smartphone size={28} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Mobile Optimized</h3>
            <p className="text-gray-400 leading-relaxed">A flawless responsive design. Controls feel native whether on desktop or mobile.</p>
          </div>

          <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 hover:border-green-500/50 transition-colors duration-300 group">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
              <Shield size={28} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Vault</h3>
            <p className="text-gray-400 leading-relaxed">Your files are encrypted and locked behind enterprise-grade authentication.</p>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-white/10 mt-20 bg-[#050505] pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Disc3 size={24} className="text-green-500" />
            <span className="text-xl font-black tracking-tight">JamList.</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Crafted for Audiophiles. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-green-400 transition"><Github size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-green-400 transition"><Twitter size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-green-400 transition"><Instagram size={20} /></a>
          </div>
        </div>
      </footer>

    </div>
  )
}