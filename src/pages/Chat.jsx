import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MessageSquare, User, Home, Trophy, Users } from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // 🟢 NEW: Epic 4 States for Real-time Features
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const channelRef = useRef(null) 
  const typingTimeoutRef = useRef({})

  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkUserAndFetch()
  }, [])

  // 🟢 NEW: Initialize Complex WebSockets only AFTER we have the user profile
  useEffect(() => {
    if (!userProfile) return

    // 1. Create a specialized channel for the Global Lounge
    const room = supabase.channel('global_lounge', {
      config: {
        presence: { key: userProfile.username },
        broadcast: { self: false }
      }
    })

    // 2. PRESENCE: Sync who is online
    room.on('presence', { event: 'sync' }, () => {
      const state = room.presenceState()
      // Extract unique usernames from the presence state
      const usersOnline = Object.keys(state).map(key => state[key][0].username)
      setOnlineUsers(usersOnline)
    })

    // 3. BROADCAST: Listen for typing events
    room.on('broadcast', { event: 'typing' }, ({ payload }) => {
      const typist = payload.username
      
      setTypingUsers(prev => prev.includes(typist) ? prev : [...prev, typist])

      // Clear the user from typing list after 2 seconds of silence
      if (typingTimeoutRef.current[typist]) clearTimeout(typingTimeoutRef.current[typist])
      typingTimeoutRef.current[typist] = setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u !== typist))
      }, 2000)
    })

    // 4. POSTGRES: Listen for actual new messages
    room.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
      fetchMessages() 
    })

    // Subscribe and announce presence
    room.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await room.track({ username: userProfile.username, avatar_url: userProfile.avatar_url })
      }
    })

    channelRef.current = room

    return () => {
      supabase.removeChannel(room)
      Object.values(typingTimeoutRef.current).forEach(clearTimeout)
    }
  }, [userProfile])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  const checkUserAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    setCurrentUser(user)

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

  // 🟢 NEW: Send typing broadcast when user types
  const handleType = (e) => {
    setNewMessage(e.target.value)
    if (channelRef.current && e.target.value.trim() !== '') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { username: userProfile.username }
      }).catch(err => console.error(err))
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content) return

    setNewMessage('')

    // Optimistic UI Update
    const optimisticMsg = {
      id: Date.now(),
      content: content,
      user_id: currentUser.id,
      created_at: new Date().toISOString(),
      profiles: {
        username: userProfile?.username || 'You',
        avatar_url: userProfile?.avatar_url || null
      }
    }
    setMessages(prev => [...prev, optimisticMsg])

    // Background Save
    const { error } = await supabase.from('messages').insert([
      { content: content, user_id: currentUser.id }
    ])

    if (error) fetchMessages()
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white font-sans selection:bg-orange-500 selection:text-black">
      
      {/* 1. STICKY HEADER WITH ONLINE STATUS */}
      <header className="bg-black/80 backdrop-blur-2xl border-b border-white/5 p-5 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white/5 rounded-full hover:text-orange-500 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">Global <span className="text-orange-500">Lounge</span></h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{onlineUsers.length} Online Now</span>
              </div>
            </div>
          </div>
          
          {/* Avatar Stack for Online Users */}
          <div className="hidden md:flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 3).map((user, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-[#111] border-2 border-black flex items-center justify-center text-[8px] font-black text-orange-500 uppercase z-10">
                  {user.substring(0, 2)}
                </div>
              ))}
              {onlineUsers.length > 3 && (
                <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-[8px] font-black text-white z-0">
                  +{onlineUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full flex flex-col gap-6 pb-40 no-scrollbar relative">
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
        
        {/* 🟢 NEW: Typing Indicator Bubble */}
        {typingUsers.length > 0 && (
          <div className="flex gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-9 h-9 rounded-xl border border-white/5 shrink-0 bg-white/[0.02] flex items-center justify-center">
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            </div>
            <div className="flex items-end">
               <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest italic">
                 {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} syncing...
               </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} /> 
      </main>

      {/* 3. INPUT AREA WITH BROADCAST TRIGGER */}
      <div className="fixed bottom-24 w-full z-40 px-4">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex items-center gap-3 bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] shadow-2xl shadow-orange-500/5">
          <input 
            type="text" 
            value={newMessage} 
            onChange={handleType} // Trigger broadcast
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

      {/* 4. NAVIGATION */}
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