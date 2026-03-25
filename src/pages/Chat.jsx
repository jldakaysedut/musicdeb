import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Send, MessageSquare, User } from 'lucide-react'
import NavLayout from '../components/NavLayout'

function LoadingScreen({ text }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div className="spin" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--black-5)', borderTopColor: 'var(--orange)' }} />
      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--white-30)' }}>{text}</p>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages]       = useState([])
  const [newMessage, setNewMessage]   = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading]         = useState(true)
  const messagesEndRef                = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkUserAndFetch()
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const checkUserAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    setCurrentUser(user)
    await fetchMessages()
    setLoading(false)
  }

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*, profiles(username, avatar_url)').order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    await supabase.from('messages').insert([{ content: newMessage, user_id: currentUser.id }])
    setNewMessage('')
  }

  if (loading) return <NavLayout><LoadingScreen text="Connecting to the Lounge..." /></NavLayout>

  return (
    <NavLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 68px)', maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'var(--orange-dim)', border: '1px solid rgba(255,107,26,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MessageSquare size={18} color="var(--orange)" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.01em', marginBottom: '2px' }}>Global Lounge</h2>
            <p style={{ fontSize: '12px', color: 'var(--white-30)', fontWeight: 500 }}>Open to all MusicDep members · Say hi!</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--orange)', background: 'var(--orange-dim)', padding: '5px 12px', borderRadius: '99px', border: '1px solid rgba(255,107,26,0.25)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--orange)', display: 'inline-block', animation: 'pulse-orange 2s ease-in-out infinite' }} />
            Live
          </div>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="scrollbar-hide">
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.45, padding: '60px 0' }}>
              <MessageSquare size={52} color="var(--white-30)" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>The lounge is quiet.</p>
              <p style={{ fontSize: '14px', color: 'var(--white-60)', lineHeight: 1.6 }}>Be the first to say hi! The community is waiting. 👋</p>
            </div>
          ) : messages.map((msg) => {
            const isMe = msg.user_id === currentUser?.id
            return (
              <div key={msg.id} style={{ display: 'flex', gap: '10px', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}>
                {!isMe && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--black-4)', border: '1px solid var(--border)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {msg.profiles?.avatar_url ? <img src={msg.profiles.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={14} color="var(--white-30)" />}
                  </div>
                )}
                <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  {!isMe && (
                    <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--white-30)', marginBottom: '4px', paddingLeft: '4px' }}>
                      @{msg.profiles?.username || 'user'}
                    </p>
                  )}
                  <div style={{
                    padding: '11px 15px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe ? 'var(--orange)' : 'var(--black-3)',
                    border: isMe ? 'none' : '1px solid var(--border)',
                    boxShadow: isMe ? '0 4px 16px rgba(255,107,26,0.25)' : 'none',
                  }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: 'white' }}>{msg.content}</p>
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--white-30)', marginTop: '4px', padding: '0 4px', fontWeight: 500 }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--black-2)', flexShrink: 0 }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Say something to the community..."
              className="input-field"
              style={{ flex: 1, borderRadius: '14px' }}
            />
            <button type="submit" disabled={!newMessage.trim()} className="btn-orange"
                    style={{ width: '48px', height: '48px', padding: 0, borderRadius: '14px', flexShrink: 0 }}>
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      </div>
    </NavLayout>
  )
}