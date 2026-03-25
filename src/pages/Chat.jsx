import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MessageSquare, User } from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkUserAndFetch()

    // THE REAL-TIME MAGIC: Nakikinig sa mga bagong chat!
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchMessages() // Pag may pumasok na bagong chat, i-refresh ang listahan
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Auto-scroll pababa kapag may bagong message
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
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: true }) // Oldest to newest para parang Messenger
    
    if (data) setMessages(data)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { error } = await supabase.from('messages').insert([
      { content: newMessage, user_id: currentUser.id }
    ])

    if (!error) {
      setNewMessage('') // I-clear ang textbox pagka-send
    } else {
      console.error("Error sending message:", error)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#090909] flex items-center justify-center text-green-500 font-bold">Connecting to Lounge...</div>

  return (
    <div className="min-h-screen flex flex-col bg-[#090909] text-white font-sans relative">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="bg-[#121212]/90 backdrop-blur-xl border-b border-[#222] p-4 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-[#1a1a1a] rounded-full hover:bg-[#222] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <MessageSquare size={24} className="text-green-500" />
              <h1 className="text-xl font-black tracking-tight">Global Lounge</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full flex flex-col gap-4 pb-24 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 my-20">
            <MessageSquare size={48} className="mb-4" />
            <p className="font-medium">The lounge is quiet.<br/>Be the first to say hi!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === currentUser?.id

            return (
              <div key={msg.id} className={`flex gap-3 w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                
                {/* Avatar ng nag-chat (sa kaliwa lang kung hindi ikaw) */}
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] shrink-0 overflow-hidden flex items-center justify-center">
                    {msg.profiles?.avatar_url ? (
                      <img src={msg.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-gray-500" />
                    )}
                  </div>
                )}

                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-xs text-gray-400 font-bold mb-1 ml-1">@{msg.profiles?.username || 'user'}</span>}
                  
                  <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-green-500 text-black rounded-tr-sm shadow-[0_5px_15px_rgba(34,197,94,0.2)]' : 'bg-[#1a1a1a] text-white border border-[#222] rounded-tl-sm'}`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                  </div>
                  
                  <span className="text-[10px] text-gray-500 mt-1 mr-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

              </div>
            )
          })
        )}
        {/* Ito 'yung invisble div na tina-target nung auto-scroll */}
        <div ref={messagesEndRef} /> 
      </div>

      {/* INPUT AREA */}
      <div className="fixed bottom-0 w-full bg-[#090909]/90 backdrop-blur-xl border-t border-[#222] p-4 z-20">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex items-center gap-2">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..." 
            className="flex-1 bg-[#141414] border border-[#222] rounded-full px-5 py-4 focus:outline-none focus:border-green-500 text-white font-medium transition-colors"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-black disabled:opacity-50 disabled:bg-[#222] disabled:text-gray-500 hover:bg-green-400 transition-colors shadow-lg shrink-0">
            <Send size={20} className="ml-1" />
          </button>
        </form>
      </div>

    </div>
  )
}