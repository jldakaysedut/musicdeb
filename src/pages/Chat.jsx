import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MessageSquare, User, Home, Trophy } from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkUserAndFetch()

    // REAL-TIME SUBSCRIPTION: Auto-updates without refresh
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // Kapag may bagong message mula sa iba, i-sync natin ang listahan
        fetchMessages() 
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkUserAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    setCurrentUser(user)

    // Kunin ang profile para sa Optimistic UI
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setUserProfile(profile)

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

  // OPTIMISTIC SEND: This makes it work with NO DELAY
  const sendMessage = async (e) => {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content) return

    // 1. I-clear agad ang input para ready na ulit
    setNewMessage('')

    // 2. OPTIMISTIC UPDATE: I-display agad sa screen bago pa ma-save sa DB
    const optimisticMsg = {
      id: Date.now(), // temporary ID
      content: content,
      user_id: currentUser.id,
      created_at: new Date().toISOString(),
      profiles: {
        username: userProfile?.username || 'You',
        avatar_url: userProfile?.avatar_url || null
      }
    }
    
    setMessages(prev => [...prev, optimisticMsg])

    // 3. BACKGROUND SAVE: I-save sa Supabase nang hindi pinaghihintay ang user
    const { error } = await supabase.from('messages').insert([
      { content: content, user_id: currentUser.id }
    ])

    if (error) {
      console.error("Message failed to send:", error)
      // Kung nag-error, pwede mong i-remove ang optimistic message o mag-alert
      fetchMessages() // Re-sync to actual DB state
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white font-sans selection:bg-orange-500 selection:text-black">
      
      {/* 1. STICKY HEADER */}
      <header className="bg-black/80 backdrop-blur-2xl border-b border-white/5 p-5 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white/5 rounded-full hover:text-orange-500 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">Global <span className="text-orange-500">Lounge</span></h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Live Frequency</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full flex flex-col gap-6 pb-40 no-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUser?.id

          return (
            <div key={msg.id} className={`flex gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-9 h-9 rounded-xl border border-white/10 shrink-0 overflow-hidden bg-[#111] ${isMe ? 'border-orange-500/40' : ''}`}>
                {msg.profiles?.avatar_url ? (
                  <img src={msg.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-800"><User size={18} /></div>
                )}
              </div>

              <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1.5 px-1">@{msg.profiles?.username}</span>}
                
                <div className={`px-5 py-3.5 rounded-2xl shadow-2xl leading-relaxed ${isMe ? 'bg-orange-500 text-black font-bold rounded-tr-none' : 'bg-white/[0.04] text-gray-200 border border-white/5 rounded-tl-none'}`}>
                  <p className="text-sm font-medium">{msg.content}</p>
                </div>
                
                <span className="text-[8px] font-black text-gray-700 uppercase mt-2 tracking-widest">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} /> 
      </main>

      {/* 3. NO-DELAY INPUT */}
      <div className="fixed bottom-24 w-full z-40 px-4">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex items-center gap-3 bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] shadow-2xl shadow-orange-500/5">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Broadcast your thoughts..." 
            className="flex-1 bg-transparent px-5 py-3 focus:outline-none text-white font-bold text-sm placeholder-gray-800"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black disabled:opacity-10 transition-all hover:scale-105 active:scale-90 shadow-lg shrink-0"
          >
            <Send size={18} strokeWidth={3} className="ml-0.5" />
          </button>
        </form>
      </div>

      {/* 4. NAVIGATION CONSISTENCY */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex justify-around items-center">
        <Link to="/dashboard" className="p-2 text-gray-600"><Home size={22} /></Link>
        <Link to="/chat" className="p-2 text-orange-500"><MessageSquare size={22} /></Link>
        <Link to="/leaderboard" className="p-2 text-gray-600"><Trophy size={22} /></Link>
        <Link to="/profile" className="p-2 text-gray-600"><User size={22} /></Link>
      </nav>

      <footer className="hidden md:block absolute bottom-8 right-12 opacity-20">
         <p className="text-[8px] font-black uppercase tracking-[0.5em] italic">
          Handcrafted by <span className="text-white">Dakay</span>
        </p>
      </footer>
    </div>
  )
}