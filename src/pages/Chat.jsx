import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { useAudio } from '../context/AudioContext'
import { Home, MessageSquare, Trophy, User, Send, ChevronLeft, Radio } from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  const { currentTrack } = useAudio()

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUser(user)

      const { data } = await supabase
        .from('messages')
        .select(`*, profiles:user_id (username, avatar_url)`)
        .order('created_at', { ascending: true })
        .limit(50)

      if (data) setMessages(data)
      setLoading(false)
    }
    fetchUserAndMessages()

    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const { data: profileData } = await supabase.from('profiles').select('username, avatar_url').eq('id', payload.new.user_id).single()
        setMessages(prev => [...prev, { ...payload.new, profiles: profileData }])
      }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return
    const msg = newMessage.trim()
    setNewMessage('')
    await supabase.from('messages').insert([{ user_id: currentUser.id, content: msg }])
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-[280px] relative">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between p-6 sticky top-0 bg-black/80 backdrop-blur-xl z-40 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-500 hover:text-black transition-all text-gray-400"><ChevronLeft size={20}/></Link>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter">Global <span className="text-orange-500">Lounge</span></h1>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</p>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {loading ? <div className="text-center py-20 text-gray-600 uppercase font-black tracking-widest text-[10px]">Loading Lounge...</div> : messages.length === 0 ? (
             <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed"><MessageSquare size={32} className="mx-auto text-gray-700 mb-3" /><p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">No messages yet.</p></div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.user_id === currentUser?.id
              return (
                <div key={msg.id || index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                      {msg.profiles?.avatar_url ? <img src={msg.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="text-gray-500" />}
                    </div>
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 mx-1 italic">{msg.profiles?.username || 'User'}</span>
                      <div className={`p-4 text-sm font-medium leading-relaxed ${isMe ? 'bg-orange-500 text-black rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm shadow-[0_5px_15px_rgba(249,115,22,0.15)]' : 'bg-[#141414] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-2xl border border-white/5'}`}>
                        {msg.content || msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </main>
      </div>

      <div className={`fixed left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-40 transition-all duration-300 ${currentTrack ? 'bottom-[180px]' : 'bottom-[100px]'}`}>
        <form onSubmit={handleSendMessage} className="bg-[#141414]/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[2rem] flex items-center gap-2 shadow-2xl">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Send a message..." className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm font-medium text-white placeholder-gray-600" />
          <button type="submit" disabled={!newMessage.trim()} className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black hover:bg-orange-400 disabled:opacity-50 disabled:bg-white/10 disabled:text-gray-600 transition-all shrink-0"><Send size={18} className="ml-1" /></button>
        </form>
      </div>

      {/* 🧭 FIXED BOTTOM NAV WITH CENTER RADIO BUTTON */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] md:w-[400px] z-50 bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-6 py-3 flex justify-between shadow-2xl items-center">
        <Link to="/dashboard" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><Home size={24} /></Link>
        <Link to="/chat" className="p-2 text-orange-500 transition-colors"><MessageSquare size={24} /></Link>
        
        <Link to="/dashboard" className="p-4 bg-orange-500 text-black rounded-full -mt-10 border-4 border-[#050505] shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all">
          <Radio size={24} />
        </Link>

        <Link to="/leaderboard" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><Trophy size={24} /></Link>
        <Link to="/profile" className="p-2 text-gray-500 hover:text-orange-400 transition-colors"><User size={24} /></Link>
      </nav>
    </div>
  )
}