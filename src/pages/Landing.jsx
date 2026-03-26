import { Link } from 'react-router-dom'
import { 
  Music2, Radio, Trophy, MessageSquare, ChevronRight, 
  Sparkles, Heart, Star, ShieldCheck, Zap, Layers 
} from 'lucide-react'

// ==========================================
// ✨ THE EDITABLE ZONE (Formal & Cute)
// ==========================================
const SHOUTOUT_DATA = {
  title: "Dev's Acknowledgement",
  message: "This system is a result of dedicated research and creative development. Thank you for being a part of this journey. We are just getting started! ✨",
  image: "/shoutout.png", // Must be in the 'public' folder!
  sticker: "🚀" 
}
// ==========================================

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans">
      
      {/* 🔝 SLIM MOBILE NAV */}
      <nav className="w-full px-6 py-5 flex justify-between items-center sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 transition-transform active:scale-90">
            <Music2 size={20} className="text-black" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-[14px] font-black uppercase tracking-tighter">JAMLIST</span>
            <span className="text-[7px] font-bold text-orange-500 uppercase tracking-[0.4em]">CPS PROJECT</span>
          </div>
        </div>
        <Link to="/login" className="text-[9px] font-black uppercase tracking-widest bg-white text-black px-5 py-2.5 rounded-xl active:scale-95 transition-all">
          Login
        </Link>
      </nav>

      <main className="px-6 pb-20">
        {/* 🚀 FORMAL HERO SECTION */}
        <section className="py-14 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-500/10 blur-[80px] -z-10"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8">
            <ShieldCheck size={10} className="text-orange-500" />
            <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.5em]">System Version 2026.1</p>
          </div>
          
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8">
            The New <br /> <span className="text-orange-500">Music Infra</span>
          </h1>
          
          <p className="text-gray-500 text-[11px] font-medium leading-relaxed uppercase tracking-widest mb-10 max-w-[280px] mx-auto">
            High-performance architecture for broadcast, real-time analytics, and creative synchronization.
          </p>

          <Link to="/register" className="w-full flex items-center justify-center gap-3 bg-orange-500 text-black py-5 rounded-2xl font-black uppercase italic text-sm shadow-xl shadow-orange-500/10 active:scale-95 transition-all group">
            Initialize Access <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

        {/* 🎀 CUTE POLAROID SECTION (Centerpiece) */}
        <section className="mt-4 mb-20">
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
            <Star className="absolute top-6 right-6 text-orange-500/10 animate-pulse" size={24} />
            
            <div className="flex flex-col items-center">
              {/* Polaroid Image Container */}
              <div className="relative mb-10 w-full max-w-[210px]">
                <div className="bg-white p-3 pb-12 rounded-sm shadow-2xl -rotate-3 transition-transform hover:rotate-0 duration-700">
                  <div className="aspect-[4/5] bg-[#f5f5f5] rounded-xs overflow-hidden">
                    <img 
                      src={SHOUTOUT_DATA.image} 
                      alt="Project Showcase" 
                      className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                      onError={(e) => {e.target.src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"}}
                    />
                  </div>
                  <div className="absolute bottom-4 left-0 w-full text-center text-[9px] text-black/30 font-serif italic tracking-wider uppercase">
                    CPS Archives • MMXXVI
                  </div>
                </div>
                {/* Floaties */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg rotate-12 ring-4 ring-[#050505]">
                   <Zap size={20} className="text-black" />
                </div>
                <Heart className="absolute -bottom-6 -left-4 text-red-500 fill-red-500 animate-bounce" size={24} />
              </div>

              {/* Text Side */}
              <div className="text-center space-y-5">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={14} className="text-orange-500" />
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                    {SHOUTOUT_DATA.title}
                  </h2>
                </div>
                
                <p className="text-[13px] font-medium text-gray-400 leading-relaxed italic px-2">
                  "{SHOUTOUT_DATA.message}"
                </p>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-xl">
                    {SHOUTOUT_DATA.sticker}
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600">Lead Dev</p>
                    <p className="font-black italic text-orange-500 uppercase text-sm tracking-tight">dkay</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 📊 CAPABILITIES (Bento Grid) */}
        <section className="space-y-4">
          <div className="px-2 mb-2 flex items-center gap-3 opacity-20">
            <div className="h-[1px] flex-1 bg-white"></div>
            <Layers size={12} />
            <div className="h-[1px] flex-1 bg-white"></div>
          </div>

          {[
            { title: "Broadcast", desc: "Digital airwave scanning and global podcast sync.", icon: <Radio size={22}/> },
            { title: "Analytics", desc: "User listening metrics and real-time rank data.", icon: <Trophy size={22}/> },
            { title: "Connectivity", desc: "End-to-end encrypted global communication.", icon: <MessageSquare size={22}/> }
          ].map((item, i) => (
            <div key={i} className="p-7 bg-[#0A0A0A] border border-white/5 rounded-[2.2rem] flex items-center gap-6 group hover:border-orange-500/20 transition-all active:scale-[0.98]">
              <div className="text-orange-500 bg-orange-500/5 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black uppercase italic tracking-wider text-white mb-1">{item.title}</h4>
                <p className="text-[10px] text-gray-600 font-bold uppercase leading-tight tracking-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* 🏁 MINIMAL FOOTER */}
      <footer className="py-16 border-t border-white/5 text-center px-8">
        <div className="flex justify-center gap-5 mb-6 opacity-10">
            <Star size={14}/>
            <Music2 size={14}/>
            <Star size={14}/>
        </div>
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-800 leading-loose">
          Proprietary CPS Framework &bull; dkay Solutions &bull; MMXXVI
        </p>
      </footer>
    </div>
  )
}