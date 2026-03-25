import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MessageSquare, User, Home, Trophy, LayoutGrid } from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkUserAndFetch()

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchMessages()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkUserAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    setCurrentUser(user)
    await fetchMessages()
    setLoading(false)
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: true })
    
    if (data) setMessages(data)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { error } = await supabase.from('messages').insert([
      { content: newMessage, user_id: currentUser.id }
    ])

    if (!error) setNewMessage('')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Connecting to Frequency...</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white font-sans relative overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* 1. STICKY GLASS HEADER */}
      <header className="bg-black/60 backdrop-blur-2xl border-b border-white/5 p-5 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white/5 rounded-full hover:bg-orange-500/10 hover:text-orange-500 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                <MessageSquare size={20} className="text-orange-500" />
                Global Lounge
              </h1>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Broadcasting Live</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </header>

      {/* 2. REAL-TIME MESSAGE FEED */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-3xl mx-auto w-full flex flex-col gap-6 pb-40 scrollbar-hide no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 my-20">
            <MessageSquare size={48} className="mb-4" />
            <h3 className="text-lg font-black uppercase tracking-tighter">The lounge is quiet...</h3>
            <p className="text-sm font-bold">Start the conversation below.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === currentUser?.id

            return (
              <div key={msg.id} className={`flex gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* User Avatar */}
                <div className={`w-9 h-9 rounded-xl border border-white/10 shrink-0 overflow-hidden flex items-center justify-center bg-[#111] ${isMe ? 'border-orange-500/50' : ''}`}>
                  {msg.profiles?.avatar_url ? (
                    <img src={msg.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-gray-600" />
                  )}
                </div>

                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1.5 px-1">@{msg.profiles?.username}</span>}
                  
                  <div className={`px-5 py-3.5 rounded-2xl shadow-xl leading-relaxed ${isMe ? 'bg-orange-500 text-black font-bold rounded-tr-none' : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'}`}>
                    <p className="text-sm font-medium">{msg.content}</p>
                  </div>
                  
                  <span className="text-[8px] font-black text-gray-600 uppercase mt-2 tracking-widest">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

              </div>
            )
          })
        )}
        <div ref={messagesEndRef} /> 
      </main>

      {/* 3. INPUT BROADCAST BAR */}
      <div className="fixed bottom-24 md:bottom-8 w-full z-40 px-4">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex items-center gap-3 bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] shadow-2xl">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Broadcast your thoughts..." 
            className="flex-1 bg-transparent px-5 py-3 focus:outline-none text-white font-bold text-sm placeholder-gray-700"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black disabled:opacity-20 disabled:grayscale transition-all hover:scale-105 active:scale-90 shadow-lg shadow-orange-500/20 shrink-0"
          >
            <Send size={18} strokeWidth={3} className="ml-0.5" />
          </button>
        </form>
      </div>

      {/* 4. MOBILE NAVIGATION (Bottom Nav Consistency) */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex justify-around items-center">
        <Link to="/dashboard" className="p-2 text-gray-500"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-orange-500"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-500"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-gray-500"><User size={22} /></Link>
      </nav>

      {/* 5. FOOTER BRANDING */}
      <div className="hidden md:block absolute bottom-4 right-8 opacity-20">
         <p className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-400">
          Created by <span className="text-white">Dakay</span>
        </p>
      </div>

    </div>
  )
}