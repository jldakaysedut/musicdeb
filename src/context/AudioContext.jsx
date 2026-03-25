import { createContext, useContext, useState, useRef, useEffect } from 'react'

const AudioContext = createContext()

export function AudioProvider({ children }) {
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // This reference holds the background audio player
  const audioRef = useRef(new Audio())

  const currentTrack = currentIndex !== null ? queue[currentIndex] : null

  useEffect(() => {
    const audio = audioRef.current
    
    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }
    
    const handleEnded = () => playNext()

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentIndex, queue])

  const playTrack = (index, trackList) => {
    setQueue(trackList)
    setCurrentIndex(index)
    const track = trackList[index]

    audioRef.current.src = track.file_url
    audioRef.current.play().catch(e => console.error("Playback error:", e))
    setIsPlaying(true)
  }

  const togglePlay = () => {
    if (!currentTrack) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(e => console.error("Playback error:", e))
    }
    setIsPlaying(!isPlaying)
  }

  const playNext = () => {
    if (currentIndex === null || queue.length === 0) return
    const nextIndex = (currentIndex + 1) % queue.length
    playTrack(nextIndex, queue)
  }

  const playPrev = () => {
    if (currentIndex === null || queue.length === 0) return
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length
    playTrack(prevIndex, queue)
  }

  return (
    <AudioContext.Provider value={{
      currentTrack, isPlaying, progress,
      playTrack, togglePlay, playNext, playPrev, queue
    }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => useContext(AudioContext)