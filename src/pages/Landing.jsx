import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Disc3, ArrowRight, Play, Shield, Smartphone, Zap, Home, LayoutGrid, User } from 'lucide-react'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    { title: "Lightning Sync", desc: "Your tracks load instantly with zero lag.", icon: <Zap size={24} /> },
    { title: "Mobile Optimized", desc: "Experience a native feel on any device.", icon: <Smartphone size={24} /> },
    { title: "Encrypted Vault", desc: "Your audio is secured with enterprise-grade auth.", icon: <Shield size={24} /> }
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500 selection:text-black overflow-x-hidden pb-24 md:pb-0">
      
      {/* 1. DESKTOP NAVIGATION (Hidden on Mobile) */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 hidden md:block px-8 py-4 ${scrolled ? 'bg-black/60 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <Disc3 size={24} className="text-black animate-spin-slow" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">Jam<span className="text-orange-500">List</span></span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-2 rounded-full font-bold text-sm text-gray-400 hover:text-white transition">Sign In</Link>
            <Link to="/register" className="px-8 py-2 rounded-full font-black text-sm bg-orange-500 text-black hover:scale-105 transition-all shadow-lg shadow-orange-500/20">GET STARTED</Link>
          </div>
        </div>
      </nav>

      {/* 2. MOBILE FLOATING NAVIGATION (Bottom Nav for CP) */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex justify-around items-center">
        <Link to="/" className="p-2 text-orange-500 flex flex-col items-center gap-1">
          <Home size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </Link>
        <Link to="/login" className="p-2 text-gray-500 flex flex-col items-center gap-1">
          <LayoutGrid size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Vault</span>
        </Link>
        <Link to="/register" className="p-2 text-gray-500 flex flex-col items-center gap-1">
          <User size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Join</span>
        </Link>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center">
        {/* Aesthetic Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Personal Branding Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Created by Dakay</span>
        </div>

        <h1 className="text-5xl md:text-[100px] font-black mb-6 tracking-tightest leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          YOUR SOUND. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">THE VAULT.</span>
        </h1>
        
        {/* UX Copy Improvement */}
        <p className="text-base md:text-2xl text-gray-400 mb-10 max-w-3xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-400">
          Share your sound with the world. JamList is the high-performance audio sanctuary for curators and listeners. 
          <span className="block mt-4 text-orange-500 text-sm font-bold tracking-widest uppercase">Your contribution helps the community grow.</span>
        </p>

        <Link to="/register" className="group flex items-center justify-center px-12 py-5 rounded-[2rem] bg-orange-500 text-black font-black text-lg hover:scale-105 transition-all shadow-[0_15px_40px_rgba(249,115,22,0.4)] active:scale-95 animate-in zoom-in-95 duration-1000 delay-600">
          ENTER THE VAULT
          <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={22} />
        </Link>
      </section>

      {/* 4. PREMIUM BENTO FEATURES */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="p-10 bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 hover:border-orange-500/30 transition-all group cursor-default">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8 text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-black transition-all duration-500">
              {f.icon}
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">{f.title}</h3>
            <p className="text-gray-500 font-medium text-base leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* 5. FOOTER */}
      <footer className="py-20 border-t border-white/5 px-6 bg-[#030303]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <Disc3 size={28} className="text-orange-500" />
            <span className="font-black text-2xl tracking-tighter uppercase italic">JamList</span>
          </div>
          <p className="text-gray-500 text-xs font-black tracking-[0.3em] uppercase">
            Designed for Audiophiles by <span className="text-white">Dakay</span>
          </p>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <a href="#" className="hover:text-orange-500 transition-colors">Twitter</a>
            <a href="#" className="hover:text-orange-500 transition-colors">GitHub</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Discord</a>
          </div>
        </div>
      </footer>

    </div>
  )
}