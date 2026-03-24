import { Link } from 'react-router-dom'
import { Music, ArrowRight } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center bg-fixed"
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}>
      
      {/* Dark Blur Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-10"></div>

      <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-20 h-20 mb-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
          <Music size={40} className="text-green-400" />
        </div>
        
        <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
          Jam<span className="text-green-400">List</span>
        </h1>
        
        <p className="text-gray-300 mb-10 max-w-sm text-lg font-medium">
          Your personal glass-vault for audio. Upload, organize, and play your tracks anywhere.
        </p>
        
        <div className="flex flex-col w-full max-w-xs gap-4">
          <Link to="/login" className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-black bg-green-500 hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]">
            Enter Vault
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
          
          <Link to="/register" className="w-full py-4 px-4 text-sm font-bold rounded-2xl text-white bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md transition-all text-center">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}