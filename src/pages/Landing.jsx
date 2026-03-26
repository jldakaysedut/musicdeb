import { Link } from 'react-router-dom'
import { 
  Heart, Radio, Trophy, MessageSquare, ChevronRight, 
  Sparkles, Star, Music, Coffee, Smile, Moon, Sun, Leaf
} from 'lucide-react'

// ==========================================
// ✨ CUTE EDITABLE ZONE (English Only)
// ==========================================
const SHOUTOUT_DATA = {
  title: "A Message from dkay! ✨",
  message: "I built JamList to be a cozy corner on the internet where we can just relax and enjoy good vibes together. Thank you for being here! 🌸",
  image: "/shoutout.png", // Must be in 'public' folder
  sticker: "🍯" 
}
// ==========================================

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans antialiased">
      
      {/* 🔝 CLEAN TOP NAV */}
      <nav className="w-full px-6 py-6 flex justify-between items-center sticky top-0 bg-[#080808]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(249,115,22,0.2)] transition-transform active:scale-90">
            <Music size={22} className="text-black" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-sm font-black uppercase tracking-tight">JamList</span>
            <span className="text-[7px] font-bold text-orange-500 uppercase tracking-[0.4em]">CPS 2026</span>
          </div>
        </div>
        <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-orange-500 border border-orange-500/20 px-5 py-2.5 rounded-xl hover:bg-orange-500 hover:text-white transition-all">
          Sign In
        </Link>
      </nav>

      <main className="px-7 pb-24">
        {/* 🚀 COMFY HERO SECTION */}
        <section className="py-16 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/5 blur-[100px] -z-10 rounded-full"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 mb-8">
            <Leaf size={12} className="text-orange-500" />
            <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.5em]">Simple • Friendly • Local</p>
          </div>
          
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            Your New <br /> <span className="text-orange-500 underline decoration-white/10">Favorite</span> <br /> Space
          </h1>
          
          <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-wider mb-10 max-w-[280px] mx-auto opacity-70">
            Listen to live radio, chat with friends, and keep all your favorite songs in one place.
          </p>

          <Link to="/register" className="w-full flex items-center justify-center gap-3 bg-white text-black py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-[0.97] transition-all group">
            Start My Journey <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

        {/* 🎀 THE POLAROID (Special Mention) */}
        <section className="mb-20">
          <div className="bg-[#0D0D0D] border border-white/5 rounded-[3.5rem] p-8 relative overflow-hidden">
            <div className="flex flex-col items-center">
              
              {/* Polaroid Frame */}
              <div className="relative mb-12 group">
                <div className="bg-white p-3 pb-12 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.4)] -rotate-3 group-hover:rotate-0 transition-all duration-700">
                  <div className="aspect-[4/5] w-[190px] bg-[#EAEAEA] rounded-xs overflow-hidden">
                    <img 
                      src={SHOUTOUT_DATA.image} 
                      alt="Special Memory" 
                      className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-1000"
                      onError={(e) => {e.target.src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2070&auto=format&fit=crop"}}
                    />
                  </div>
                  <div className="absolute bottom-4 left-0 w-full text-center">
                    <span className="text-[9px] text-black/20 font-black uppercase tracking-[0.3em]">Project Vibe ✨</span>
                  </div>
                </div>
                {/* Floating Heart Button */}
                <div className="absolute -top-5 -right-5 w-14 h-14 bg-orange-500 rounded-3xl flex items-center justify-center shadow-xl rotate-12 ring-[8px] ring-[#0D0D0D]">
                   <Heart size={24} className="text-black fill-black" />
                </div>
              </div>

              {/* The Note */}
              <div className="text-center space-y-5">
                <div className="flex items-center justify-center gap-3">
                   <div className="h-[1px] w-6 bg-orange-500/20"></div>
                   <h2 className="text-xs font-black uppercase tracking-[0.4em] text-orange-500">{SHOUTOUT_DATA.title}</h2>
                   <div className="h-[1px] w-6 bg-orange-500/20"></div>
                </div>
                <p className="text-[15px] font-medium text-gray-400 leading-relaxed italic px-2">
                  "{SHOUTOUT_DATA.message}"
                </p>
                <div className="flex flex-col items-center gap-3 pt-6">
                  <span className="text-3xl animate-bounce">{SHOUTOUT_DATA.sticker}</span>
                  <div className="text-center">
                    <p className="text-[7px] font-black uppercase tracking-[0.6em] text-gray-700 mb-1">Developed by</p>
                    <p className="font-black italic text-white uppercase text-lg tracking-tighter underline decoration-orange-500/50">dkay solutions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🛠️ THE ESSENTIALS (Mobile-Optimized Grid) */}
        <section className="space-y-4">
          <div className="flex items-center gap-4 px-2 mb-8 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] whitespace-nowrap">What's Inside</p>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Essential 1 */}
            <div className="p-7 bg-white/[0.02] border border-white/[0.05] rounded-[2.8rem] flex flex-col items-center text-center gap-4 transition-all active:scale-95">
              <div className="text-orange-500 p-3 bg-orange-500/5 rounded-2xl"><Radio size={24}/></div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Live Radio</h4>
              <p className="text-[9px] text-gray-600 font-bold leading-tight uppercase tracking-tighter">Listen to global shows & podcasts.</p>
            </div>
            {/* Essential 2 */}
            <div className="p-7 bg-white/[0.02] border border-white/[0.05] rounded-[2.8rem] flex flex-col items-center text-center gap-4 transition-all active:scale-95">
              <div className="text-orange-500 p-3 bg-orange-500/5 rounded-2xl"><Trophy size={24}/></div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Top Fans</h4>
              <p className="text-[9px] text-gray-600 font-bold leading-tight uppercase tracking-tighter">See who spends the most time listening.</p>
            </div>
            {/* Essential 3 */}
            <div className="p-7 bg-white/[0.02] border border-white/[0.05] rounded-[2.8rem] flex flex-col items-center text-center gap-4 transition-all active:scale-95">
              <div className="text-orange-500 p-3 bg-orange-500/5 rounded-2xl"><MessageSquare size={24}/></div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Talk Box</h4>
              <p className="text-[9px] text-gray-600 font-bold leading-tight uppercase tracking-tighter">Chat with others while you jam.</p>
            </div>
            {/* Essential 4 */}
            <div className="p-7 bg-white/[0.02] border border-white/[0.05] rounded-[2.8rem] flex flex-col items-center text-center gap-4 transition-all active:scale-95">
              <div className="text-orange-500 p-3 bg-orange-500/5 rounded-2xl"><Heart size={24}/></div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-white">The Vault</h4>
              <p className="text-[9px] text-gray-600 font-bold leading-tight uppercase tracking-tighter">A private place for your saved songs.</p>
            </div>
          </div>

          {/* Special Experience Card */}
          <div className="mt-6 p-7 bg-orange-500 rounded-[2.5rem] flex items-center justify-between group active:scale-[0.98] transition-all">
             <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-orange-500 shadow-2xl shadow-black/20">
                  <Coffee size={22}/>
                </div>
                <div className="text-left">
                  <h4 className="text-[13px] font-black uppercase tracking-wider text-black leading-none mb-1">Daily Mood</h4>
                  <p className="text-[9px] text-black/50 font-black uppercase tracking-[0.2em]">Pick your vibe for today</p>
                </div>
             </div>
             <ChevronRight size={22} className="text-black/30 group-hover:text-black transition-colors" />
          </div>
        </section>
      </main>

      {/* 🏁 MINIMAL FOOTER */}
      <footer className="py-20 border-t border-white/[0.03] text-center px-10">
        <div className="flex justify-center gap-6 mb-10 opacity-10 text-orange-500">
            <Sun size={14}/><Moon size={14}/><Star size={14}/>
        </div>
        <p className="text-[7px] font-black uppercase tracking-[0.8em] text-gray-800 leading-loose">
          JamList CPS 2026 • Built with care by dkay
        </p>
      </footer>
    </div>
  )
}