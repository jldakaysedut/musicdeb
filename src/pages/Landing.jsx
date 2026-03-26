import { Link } from 'react-router-dom'
import { Music2, Radio, Trophy, MessageSquare, ChevronRight, Sparkles, Heart } from 'lucide-react'

// ==========================================
// ✨ EDITABLE ZONE (Dito ka mag-eedit anytime!)
// ==========================================
const SPECIAL_SECTION = {
  title: "Dev's Special Corner",
  message: "Shoutout sa pinaka-solid na project partner! Ready na tayo for the big launch. 🚀",
  image: "/src/assets/hero.png", // Palitan mo ito ng image path mo sa assets folder
  tag: "Cute Notice"
}
// ==========================================

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden">
      
      {/* 🔝 FORMAL NAV */}
      <nav className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <Music2 size={24} className="text-black" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">JamList</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="bg-white text-black px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95 shadow-lg shadow-white/5">
            Join Now
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-20">
        {/* 🚀 HERO SECTION (FORMAL) */}
        <div className="text-center mb-32 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 blur-[120px] -z-10"></div>
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.5em] mb-6 animate-pulse">2026 Global Music Network</p>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8">
            Elevate Your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-500 to-white">Sound Experience</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base font-medium leading-relaxed mb-12">
            The ultimate broadcast and music hub. Track your listening time, climb the leaderboard, and connect with other curators in real-time.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full md:w-auto px-12 py-5 bg-orange-500 text-black font-black uppercase italic rounded-2xl hover:bg-orange-400 transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-orange-500/20">
              Start Streaming <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest px-6 py-5 border border-white/5 rounded-2xl italic">
              Available Everywhere
            </div>
          </div>
        </div>

        {/* 🎀 CUTE EDITABLE SECTION (The "Special Corner") */}
        <div className="max-w-4xl mx-auto mb-32 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 relative z-10 overflow-hidden shadow-2xl">
            {/* Image Side */}
            <div className="w-full md:w-1/2 relative">
              <div className="aspect-square bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-inner">
                 <img 
                    src={SPECIAL_SECTION.image} 
                    alt="Special" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    onError={(e) => {e.target.src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop"}}
                 />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-orange-500 p-4 rounded-3xl shadow-2xl shadow-orange-500/40 rotate-12">
                <Sparkles size={24} className="text-black animate-spin-slow" />
              </div>
            </div>

            {/* Text Side */}
            <div className="w-full md:w-1/2 text-left">
              <span className="bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-orange-500/20 mb-6 inline-block">
                {SPECIAL_SECTION.tag}
              </span>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6">{SPECIAL_SECTION.title}</h2>
              <p className="text-gray-400 text-lg leading-relaxed font-medium italic mb-8">
                "{SPECIAL_SECTION.message}"
              </p>
              <div className="flex items-center gap-3 text-orange-500">
                <Heart size={20} fill="currentColor" className="animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Built with love by dkay</span>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 FEATURE GRID (FORMAL) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Radio />, label: "Live Radio", desc: "Access verified podcast and global broadcast frequencies." },
            { icon: <Trophy />, label: "Time King", desc: "Climb the leaderboard based on your total listening hours." },
            { icon: <MessageSquare />, label: "Global Chat", desc: "Real-time interaction with the community of music lovers." }
          ].map((feature, i) => (
            <div key={i} className="p-10 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] hover:border-orange-500/30 transition-all group">
              <div className="text-orange-500 mb-6 group-hover:scale-110 transition-transform inline-block">
                {feature.icon}
              </div>
              <h4 className="text-lg font-black italic uppercase tracking-tighter mb-2">{feature.label}</h4>
              <p className="text-gray-600 text-xs leading-relaxed uppercase font-bold tracking-wider">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* 🏁 FOOTER */}
      <footer className="py-20 border-t border-white/5 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">&copy; 2026 JAMLIST INC. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  )
}