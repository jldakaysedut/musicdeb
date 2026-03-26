import { Link } from 'react-router-dom'
import { Music2, Radio, Trophy, MessageSquare, ChevronRight, Sparkles, Heart, Star, Cloud } from 'lucide-react'

// ==========================================
// ✨ THE CUTE EDITABLE ZONE (Dito ka mag-eedit anytime!)
// ==========================================
const SHOUTOUT_DATA = {
  title: "Special Note for You!",
  message: "Shoutout to my Waguri,🌸. We got this! ✨",
  image: "/src/assets/waguri2.webp", // Siguraduhin na nandoon ang image sa assets!
  sticker: "💖" 
}
// ==========================================

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-hidden font-sans">
      
      {/* 🔝 PREMIUM NAV (Formal) */}
      <nav className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
            <Music2 size={26} className="text-black" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black italic tracking-tighter uppercase">CPS</span>
            <span className="text-[8px] font-black text-orange-500 uppercase tracking-[0.4em]">Project System</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Portal Login</Link>
          <Link to="/register" className="bg-white text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95 shadow-2xl shadow-white/5">
            Get Access
          </Link>
        </div>
      </nav>

      <main className="relative">
        {/* 🚀 HERO SECTION (High-Focus on CPS) */}
        <section className="max-w-6xl mx-auto px-8 py-24 text-center relative">
          {/* Abstract background glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 blur-[150px] -z-10 rounded-full"></div>
          
          <div className="inline-block px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 mb-8">
            <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.6em]">Capstone Integration 2026</p>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85] mb-10">
            The New <br /> Standard of <br /> <span className="text-orange-500">Creative Systems</span>
          </h1>
          
          <div className="max-w-2xl mx-auto mb-16">
            <p className="text-gray-500 text-lg font-medium leading-relaxed uppercase tracking-wide">
              A high-performance system built for music discovery, real-time analytics, and community broadcast.
            </p>
          </div>

          <Link to="/register" className="inline-flex items-center gap-4 bg-orange-500 text-black px-12 py-6 rounded-[2rem] font-black uppercase italic text-lg hover:bg-orange-400 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(249,115,22,0.2)] group">
            Launch Project <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </section>

        {/* 🎀 THE CUTE ZONE (The "Ready to Edit" Special Mention) */}
        <section className="max-w-5xl mx-auto px-8 py-20">
          <div className="relative">
            {/* Cute floating decorations */}
            <Cloud className="absolute -top-10 -left-10 text-white/10 animate-bounce" size={40} />
            <Star className="absolute -bottom-5 right-10 text-orange-500/30 animate-pulse" size={32} />
            
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[4rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
              
              {/* Image Placement (Cute Polaroid Style) */}
              <div className="w-full md:w-2/5 relative">
                <div className="bg-white p-4 pb-14 rounded-lg shadow-2xl rotate-[-4deg] hover:rotate-0 transition-transform duration-500 group">
                  <div className="aspect-[4/5] bg-gray-100 rounded-sm overflow-hidden relative">
                    <img 
                      src={SHOUTOUT_DATA.image} 
                      alt="Special Photo" 
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                      onError={(e) => {e.target.src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"}}
                    />
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-black font-serif italic opacity-60">
                    Ads ✨
                  </div>
                </div>
                {/* Floating Hearts */}
                <Heart className="absolute -top-6 -right-6 text-pink-500 fill-pink-500 animate-bounce delay-75" size={32} />
                <Heart className="absolute top-1/2 -left-8 text-orange-500 fill-orange-500 animate-pulse" size={24} />
              </div>

              {/* Text Side (Cute & Warm) */}
              <div className="w-full md:w-3/5 text-left space-y-6">
                <div className="flex items-center gap-3">
                  <span className="bg-orange-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Dev Message
                  </span>
                  <Sparkles size={18} className="text-orange-500 animate-spin-slow" />
                </div>
                
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                  {SHOUTOUT_DATA.title}
                </h2>
                
                <p className="text-2xl font-medium text-gray-400 leading-relaxed italic pr-10">
                  "{SHOUTOUT_DATA.message}"
                </p>

                <div className="pt-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <span className="text-2xl">{SHOUTOUT_DATA.sticker}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Mentioned By</p>
                    <p className="font-black italic text-orange-500 uppercase tracking-tighter text-xl">Dakay</p>
                  </div>
                </div>
              </div>

              {/* Subtle Cute Pattern Overlay */}
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(9)].map((_, i) => <Heart key={i} size={12} fill="currentColor" />)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 📊 CPS FEATURES (Formal) */}
        <section className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Core System", title: "Smart Discovery", icon: <Radio size={32}/> },
            { label: "Engagement", title: "Real-time Chat", icon: <MessageSquare size={32}/> },
            { label: "Analytics", title: "Leaderboard Metrics", icon: <Trophy size={32}/> }
          ].map((item, i) => (
            <div key={i} className="group p-12 bg-[#0A0A0A] border border-white/5 rounded-[3rem] hover:border-orange-500/20 transition-all relative overflow-hidden">
               <div className="absolute -bottom-10 -right-10 text-white/[0.02] group-hover:text-orange-500/5 transition-colors">
                  {item.icon}
               </div>
               <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] mb-4">{item.label}</p>
               <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4 group-hover:text-orange-500 transition-colors">{item.title}</h3>
               <div className="w-12 h-1 bg-white/10 group-hover:w-24 group-hover:bg-orange-500 transition-all duration-500"></div>
            </div>
          ))}
        </section>
      </main>

      {/* 🏁 FOOTER */}
      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-700">
          Developed & Maintained by John Lhoyde Dakay &bull; 2026
        </p>
      </footer>
    </div>
  )
}