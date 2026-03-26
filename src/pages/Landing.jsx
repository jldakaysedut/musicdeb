import { Link } from 'react-router-dom'
import { Music2, Radio, Trophy, MessageSquare, ChevronRight, Sparkles, Heart, Star } from 'lucide-react'

// ==========================================
// ✨ THE CUTE EDITABLE ZONE 
// ==========================================
const SHOUTOUT_DATA = {
  title: "Special Note!",
  message: "Shoutout  🌸 Thank you for being part of this journey. We got this! ✨",
  image: "/shoutout.png", // ILAGAY MO ANG IMAGE SA 'PUBLIC' FOLDER!
  sticker: "💖" 
}
// ==========================================

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans">
      
      {/* 🔝 MOBILE NAV */}
      <nav className="w-full px-6 py-6 flex justify-between items-center sticky top-0 bg-[#050505]/80 backdrop-blur-lg z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Music2 size={20} className="text-black" />
          </div>
          <span className="text-sm font-black uppercase tracking-tighter">JAMLIST CPS</span>
        </div>
        <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-orange-500 border border-orange-500/20 px-4 py-2 rounded-xl bg-orange-500/5">
          Login
        </Link>
      </nav>

      <main className="px-6 pb-20">
        {/* 🚀 COMPACT HERO */}
        <section className="py-12 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/10 blur-[80px] -z-10"></div>
          
          <div className="inline-block px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 mb-6">
            <p className="text-orange-500 text-[8px] font-black uppercase tracking-[0.4em]">Capstone 2026</p>
          </div>
          
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-6">
            New Era of <br /> <span className="text-orange-500 underline decoration-2 underline-offset-4">Creative Hub</span>
          </h1>
          
          <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-wider mb-8 max-w-[280px] mx-auto">
            Music discovery, real-time analytics, and community broadcast in one portal.
          </p>

          <Link to="/register" className="w-full flex items-center justify-center gap-3 bg-orange-500 text-black py-5 rounded-2xl font-black uppercase italic text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-orange-500/10">
            Get Started <ChevronRight size={18} />
          </Link>
        </section>

        {/* 🎀 CUTE SHOUTOUT (POLAROID STYLE) */}
        <section className="mt-8 mb-16">
          <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden">
            <Star className="absolute top-4 right-4 text-orange-500/20 animate-pulse" size={20} />
            
            <div className="flex flex-col gap-8">
              {/* Image (Fitted for CP) */}
              <div className="relative mx-auto w-full max-w-[240px]">
                <div className="bg-white p-3 pb-10 rounded-sm shadow-2xl -rotate-2 group">
                  <div className="aspect-[4/5] bg-gray-100 rounded-sm overflow-hidden">
                    <img 
                      src={SHOUTOUT_DATA.image} 
                      alt="Partners" 
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0"
                      onError={(e) => {e.target.src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"}}
                    />
                  </div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-black font-serif italic">
                    CPS Moments ✨
                  </div>
                </div>
                <Heart className="absolute -top-3 -right-3 text-red-500 fill-red-500 animate-bounce" size={24} />
              </div>

              {/* Text Side */}
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Ads
                  </span>
                  <Sparkles size={14} className="text-orange-500 animate-spin-slow" />
                </div>
                
                <h2 className="text-xl font-black italic uppercase tracking-tighter">
                  {SHOUTOUT_DATA.title}
                </h2>
                
                <p className="text-sm font-medium text-gray-400 leading-relaxed italic px-4">
                  "{SHOUTOUT_DATA.message}"
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-xl">
                    {SHOUTOUT_DATA.sticker}
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Dev</p>
                    <p className="font-black italic text-orange-500 uppercase text-sm">dkay</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 📊 FEATURES (Stacked for CP) */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700 text-center mb-6">Core Infrastructure</h3>
          {[
            { title: "Broadcast", desc: "Global radio & podcast frequencies.", icon: <Radio size={20}/> },
            { title: "Engagement", desc: "Live global chat system.", icon: <MessageSquare size={20}/> },
            { title: "Leaderboard", desc: "Real-time listening metrics.", icon: <Trophy size={20}/> }
          ].map((item, i) => (
            <div key={i} className="p-6 bg-[#0A0A0A] border border-white/5 rounded-[2rem] flex items-center gap-5">
              <div className="text-orange-500 shrink-0">{item.icon}</div>
              <div className="text-left">
                <h4 className="text-[12px] font-black uppercase italic tracking-wider mb-1">{item.title}</h4>
                <p className="text-[10px] text-gray-600 font-bold uppercase leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-800 px-6">
          &copy; 2026 JamList Systems &bull; Dakay & Secterria
        </p>
      </footer>
    </div>
  )
}