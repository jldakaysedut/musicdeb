import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Trash2, Heart, MoreVertical, Plus, X, Radio, Music2, Music, Clock } from 'lucide-react'
import NavLayout from '../components/NavLayout'

const cardColors = [
  'linear-gradient(135deg,#FF6B1A 0%,#8B2500 100%)',
  'linear-gradient(135deg,#2a2a2a 0%,#111 100%)',
  'linear-gradient(135deg,#FF8C4A 0%,#6B2000 100%)',
  'linear-gradient(135deg,#1e1e1e 0%,#0a0a0a 100%)',
  'linear-gradient(135deg,#FF6B1A 0%,#1a1a1a 100%)',
]

export default function Dashboard() {
  const [tracks, setTracks]             = useState([])
  const [radios, setRadios]             = useState([])
  const [filter, setFilter]             = useState('All')
  const [showUpload, setShowUpload]     = useState(false)
  const [openMenuId, setOpenMenuId]     = useState(null)
  const [file, setFile]                 = useState(null)
  const [title, setTitle]               = useState('')
  const [artist, setArtist]             = useState('')
  const [uploading, setUploading]       = useState(false)
  const [fetchingRadio, setFetchingRadio] = useState(false)
  const audioRef                        = useRef(null)
  const [activeList, setActiveList]     = useState('tracks')
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [progress, setProgress]         = useState(0)
  const [isShuffle, setIsShuffle]       = useState(false)
  const [isRepeat, setIsRepeat]         = useState(false)
  const [username, setUsername]         = useState('')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    fetchTracks()
    fetchLiveRadios()
    fetchUsername()
  }, [])

  const fetchUsername = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    if (data?.username) setUsername(data.username)
  }

  const fetchTracks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('tracks').select('*, profiles(username)')
      .or(`status.eq.approved,user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    if (data) setTracks(data)
  }

  const fetchLiveRadios = async () => {
    setFetchingRadio(true)
    try {
      const res = await fetch('https://de1.api.radio-browser.info/json/stations/search?limit=15&country=Philippines&hidebroken=true&order=clickcount')
      const data = await res.json()
      const httpsStations = data.filter(s => s.url_resolved.startsWith('https'))
      setRadios(httpsStations.map(s => ({ id: s.stationuuid, title: s.name.trim(), artist: 'Live Broadcast 📻', file_url: s.url_resolved, is_radio: true })))
    } catch (e) { console.error(e) }
    setFetchingRadio(false)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUploading(true)
    const filePath = `${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('music-bucket').upload(filePath, file)
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('music-bucket').getPublicUrl(filePath)
      await supabase.from('tracks').insert([{ title, artist, file_url: urlData.publicUrl, is_favorite: false, user_id: user.id, status: 'pending' }])
      setTitle(''); setArtist(''); setFile(null); setShowUpload(false); fetchTracks()
    }
    setUploading(false)
  }

  const handleDelete = async (e, id, fileUrl, index) => {
    e.stopPropagation(); setOpenMenuId(null)
    if (!window.confirm('Delete this track from the vault?')) return
    const { error } = await supabase.from('tracks').delete().eq('id', id)
    if (!error) {
      await supabase.storage.from('music-bucket').remove([fileUrl.split('/').pop()])
      if (activeList === 'tracks' && currentTrackIndex === index) { audioRef.current?.pause(); setIsPlaying(false); setCurrentTrackIndex(null) }
      fetchTracks()
    }
  }

  const toggleFavorite = async (e, id, currentStatus) => {
    e.stopPropagation()
    await supabase.from('tracks').update({ is_favorite: !currentStatus }).eq('id', id)
    fetchTracks()
  }

  const playTrack = (index, listType) => {
    setActiveList(listType); setCurrentTrackIndex(index); setIsPlaying(true)
    setTimeout(() => audioRef.current?.play(), 100)
  }
  const togglePlayPause = () => {
    if (!audioRef.current) return
    isPlaying ? audioRef.current.pause() : audioRef.current.play()
    setIsPlaying(!isPlaying)
  }
  const handleNext = () => {
    const arr = activeList === 'tracks' ? tracks : radios
    if (!arr.length) return
    let next = isShuffle ? Math.floor(Math.random() * arr.length) : (currentTrackIndex + 1) % arr.length
    playTrack(next, activeList)
  }
  const handlePrev = () => {
    const arr = activeList === 'tracks' ? tracks : radios
    if (!arr.length) return
    let prev = currentTrackIndex - 1
    if (prev < 0) prev = arr.length - 1
    playTrack(prev, activeList)
  }
  const onTimeUpdate = () => {
    if (!audioRef.current) return
    const d = audioRef.current.duration
    setProgress((d === Infinity || isNaN(d)) ? 100 : (audioRef.current.currentTime / d) * 100)
  }
  const onEnded = () => isRepeat ? audioRef.current.play() : handleNext()

  const currentTrackArray = activeList === 'tracks' ? tracks : radios
  const currentTrack = currentTrackIndex !== null ? currentTrackArray[currentTrackIndex] : null
  const displayedItems = filter === 'Radio' ? radios : tracks.filter(t => filter === 'Favorites' ? t.is_favorite : true)

  return (
    <NavLayout>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 20px 0' }}>

        {/* ── HEADER ── */}
        <div className="anim-fade-up" style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white-30)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>{greeting}{username ? `, ${username}` : ''} 👋</p>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.025em' }}>
            What are we playing today?
          </h1>
        </div>

        {/* ── FEATURED STRIP ── */}
        {filter === 'All' && tracks.length > 0 && (
          <div className="anim-fade-up-1" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                Fresh Uploads <span className="badge" style={{ background: 'var(--orange-dim)', color: 'var(--orange)', border: '1px solid rgba(255,107,26,0.25)', marginLeft: '8px' }}>NEW</span>
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px' }} className="scrollbar-hide">
              {tracks.slice(0, 5).map((track, idx) => {
                const isPlayingThis = currentTrackIndex === idx && activeList === 'tracks'
                return (
                  <div key={track.id} onClick={() => playTrack(idx, 'tracks')}
                       className={`feat-card ${isPlayingThis ? 'playing' : ''}`}
                       style={{ background: cardColors[idx % cardColors.length] }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
                    {isPlayingThis && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2, background: 'var(--orange)', borderRadius: '99px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', color: 'white' }}>
                        ▶ PLAYING
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', zIndex: 1 }}
                         className="feat-overlay">
                    </div>
                    <Music size={22} style={{ position: 'absolute', top: '14px', left: '14px', color: 'rgba(255,255,255,0.25)' }} />
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>@{track.profiles?.username || 'user'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── FILTER CHIPS ── */}
        <div className="anim-fade-up-2" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="scrollbar-hide">
            {[
              { label: 'All Tracks', val: 'All' },
              { label: '❤ Favorites', val: 'Favorites' },
              { label: '📻 Live Radio', val: 'Radio' },
            ].map(({ label, val }) => (
              <button key={val} onClick={() => setFilter(val)} className={`filter-chip ${filter === val ? 'active' : ''}`}>{label}</button>
            ))}
          </div>
        </div>

        {/* ── TRACK LIST ── */}
        <div className="anim-fade-up-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white-30)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              {filter === 'Radio' ? 'Live stations' : 'Public feed'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--white-30)', fontWeight: 500 }}>{displayedItems.length} tracks</p>
          </div>

          {fetchingRadio && filter === 'Radio' ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--orange)' }}>
              <div className="spin" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--black-5)', borderTopColor: 'var(--orange)', margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 600, fontSize: '14px' }}>Scanning PH frequencies...</p>
              <p style={{ fontSize: '12px', color: 'var(--white-30)', marginTop: '6px' }}>Finding the best stations for you</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--black-2)', borderRadius: '20px', border: '2px dashed var(--border)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--black-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Music2 size={28} color="var(--white-30)" />
              </div>
              <p style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>
                {filter === 'Favorites' ? 'No favorites yet.' : 'Your library is quiet...'}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--white-60)', lineHeight: 1.6, marginBottom: '24px' }}>
                {filter === 'Favorites' ? 'Tap the ❤ on any track to save it here.' : "Let's add some music! Share your sound with the world."}
              </p>
              {filter === 'All' && (
                <button onClick={() => setShowUpload(true)} className="btn-orange" style={{ fontSize: '14px', padding: '12px 24px' }}>
                  <Plus size={16} /> Upload Your First Track
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {displayedItems.map((item, index) => {
                const currentListType = filter === 'Radio' ? 'radios' : 'tracks'
                const originalIndex = currentListType === 'tracks' ? tracks.findIndex(t => t.id === item.id) : index
                const isPlayingThis = currentTrackIndex === originalIndex && activeList === currentListType
                const isMenuOpen = openMenuId === item.id

                return (
                  <div key={item.id} onClick={() => playTrack(originalIndex, currentListType)}
                       className={`track-row ${isPlayingThis ? 'active' : ''}`}>

                    {/* Thumb */}
                    <div className="track-thumb">
                      {isPlayingThis && isPlaying ? (
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '18px' }}>
                          <div style={{ width: '3px', background: 'var(--orange)', borderRadius: '2px', minHeight: '4px' }} className="eq-bar-1" />
                          <div style={{ width: '3px', background: 'var(--orange)', borderRadius: '2px', minHeight: '4px' }} className="eq-bar-2" />
                          <div style={{ width: '3px', background: 'var(--orange)', borderRadius: '2px', minHeight: '4px' }} className="eq-bar-3" />
                        </div>
                      ) : item.is_radio ? (
                        <Radio size={18} color="var(--white-30)" />
                      ) : (
                        <Music size={18} color="var(--white-30)" />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: isPlayingThis ? 'var(--orange)' : 'var(--white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '3px' }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--white-30)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.artist}
                        {!item.is_radio && (
                          <>
                            <span style={{ opacity: 0.4 }}>·</span>
                            <span style={{ color: 'var(--orange)', opacity: 0.8 }}>@{item.profiles?.username || 'user'}</span>
                            {item.status === 'pending' && (
                              <span className="badge tag-pending" style={{ fontSize: '10px', padding: '2px 8px' }}>Pending review</span>
                            )}
                          </>
                        )}
                        {item.is_radio && (
                          <span className="badge tag-live" style={{ fontSize: '10px', padding: '2px 8px' }}>LIVE</span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    {!item.is_radio && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button onClick={(e) => toggleFavorite(e, item.id, item.is_favorite)}
                                style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: item.is_favorite ? 'var(--orange)' : 'var(--white-30)' }}
                                title="Add to favorites">
                          <Heart size={17} fill={item.is_favorite ? 'var(--orange)' : 'none'} />
                        </button>
                        <div style={{ position: 'relative' }}>
                          <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : item.id) }}
                                  style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white-30)', transition: 'color 0.2s' }}>
                            <MoreVertical size={17} />
                          </button>
                          {isMenuOpen && (
                            <div className="anim-scale-in" style={{ position: 'absolute', right: 0, top: '40px', width: '160px', background: 'var(--black-3)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow-lg)', zIndex: 20, overflow: 'hidden' }}>
                              <button onClick={(e) => handleDelete(e, item.id, item.file_url, originalIndex)}
                                      style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#FF6060', fontWeight: 700, transition: 'background 0.15s' }}
                                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,96,96,0.08)'}
                                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                <Trash2 size={15} /> Delete track
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── UPLOAD FAB ── */}
      <button onClick={() => setShowUpload(true)}
              style={{ position: 'fixed', bottom: '88px', right: '20px', width: '56px', height: '56px', borderRadius: '18px', background: 'var(--orange)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-orange)', zIndex: 38, transition: 'all 0.2s ease', color: 'white' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.background = 'var(--orange-light)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--orange)' }}
              title="Share your sound with the world">
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* ── UPLOAD MODAL ── */}
      {showUpload && (
        <div className="anim-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}
             onClick={e => e.target === e.currentTarget && setShowUpload(false)}>
          <div className="anim-slide-up" style={{ background: 'var(--black-2)', border: '1px solid var(--border)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '520px', padding: '32px 28px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>Share your sound.</h2>
                <p style={{ fontSize: '13px', color: 'var(--white-60)', marginTop: '4px', lineHeight: 1.5 }}>Your contribution helps the community grow.</p>
              </div>
              <button onClick={() => setShowUpload(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--black-4)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white-60)', flexShrink: 0 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--white-30)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Song Title</label>
                <input type="text" placeholder="e.g. Midnight Drive" required value={title} onChange={e => setTitle(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--white-30)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Artist Name</label>
                <input type="text" placeholder="e.g. DJ Retro" required value={artist} onChange={e => setArtist(e.target.value)} className="input-field" />
              </div>

              {/* File drop zone */}
              <div style={{ position: 'relative', borderRadius: '14px', border: `2px dashed ${file ? 'var(--orange)' : 'var(--border)'}`, padding: '28px 20px', textAlign: 'center', background: file ? 'var(--orange-dim)' : 'var(--black-3)', transition: 'all 0.2s', cursor: 'pointer' }}
                   onMouseEnter={e => { if (!file) e.currentTarget.style.borderColor = 'rgba(255,107,26,0.4)' }}
                   onMouseLeave={e => { if (!file) e.currentTarget.style.borderColor = 'var(--border)' }}>
                <input type="file" accept="audio/*" required onChange={e => setFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <Music size={28} color={file ? 'var(--orange)' : 'var(--white-30)'} style={{ margin: '0 auto 10px' }} />
                <p style={{ fontWeight: 700, fontSize: '14px', color: file ? 'var(--orange)' : 'var(--white-60)', marginBottom: '4px' }}>
                  {file ? file.name : 'Drop your .mp3 or .wav here'}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--white-30)' }}>
                  {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Ready to upload` : 'or tap to browse your files'}
                </p>
              </div>

              <button type="submit" disabled={uploading} className="btn-orange" style={{ width: '100%', fontSize: '15px', padding: '16px', marginTop: '4px' }}>
                {uploading ? (
                  <><span className="spin" style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block' }} /> Processing your upload...</>
                ) : 'Upload for Review →'}
              </button>
              <p style={{ fontSize: '12px', color: 'var(--white-30)', textAlign: 'center' }}>
                <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Tracks are reviewed by our admin team before going live.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ── PLAYER BAR ── */}
      {currentTrack && (
        <div className="player-bar anim-slide-up">
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            {/* Progress */}
            <div className="progress-track" style={{ marginBottom: '10px' }}>
              <div className="progress-fill" style={{ width: currentTrack.is_radio ? '100%' : `${progress}%`, animation: currentTrack.is_radio ? 'none' : undefined, opacity: currentTrack.is_radio ? 0.5 : 1 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              {/* Track info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--white-30)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.artist}</p>
              </div>
              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {!currentTrack.is_radio && (
                  <button onClick={() => setIsShuffle(!isShuffle)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isShuffle ? 'var(--orange)' : 'var(--white-30)', padding: '6px', transition: 'color 0.2s', display: 'none' }} className="md-show">
                    <Shuffle size={17} />
                  </button>
                )}
                <button onClick={handlePrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--white-60)', padding: '6px', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--white-60)'}>
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button onClick={togglePlayPause} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--orange)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-orange)', transition: 'transform 0.15s', color: 'white' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
                </button>
                <button onClick={handleNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--white-60)', padding: '6px', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--white-60)'}>
                  <SkipForward size={20} fill="currentColor" />
                </button>
                {!currentTrack.is_radio && (
                  <button onClick={() => setIsRepeat(!isRepeat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isRepeat ? 'var(--orange)' : 'var(--white-30)', padding: '6px', transition: 'color 0.2s', display: 'none' }} className="md-show">
                    <Repeat size={17} />
                  </button>
                )}
              </div>
            </div>
            <audio ref={audioRef} src={currentTrack.file_url} onTimeUpdate={onTimeUpdate} onEnded={onEnded} />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 640px) { .md-show { display: flex !important; } }
      `}</style>
    </NavLayout>
  )
}