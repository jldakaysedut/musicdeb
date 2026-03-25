// 2. 🌐 THE BULLETPROOF ENGINE: Fetching from Apple iTunes API
  const fetchUndergroundMusic = async (query = 'Hev Abi') => {
    setLoading(true)
    try {
      // Gumagamit tayo ng official Apple endpoint para walang crash
      const endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=30`
      const response = await fetch(endpoint)
      const json = await response.json()
      
      if (json.results && json.results.length > 0) {
        const appleTracks = json.results.map(track => ({
          id: track.trackId.toString(),
          title: track.trackName,
          artist: track.artistName,
          file_url: track.previewUrl,       // 30-sec HD audio preview
          download_url: track.previewUrl,   // Direct file link
          // Developer Hack: Pinapalitan natin ang 100x100 pixel limit ng Apple para maging 500x500 HD Cover!
          cover_image: track.artworkUrl100.replace('100x100bb', '500x500bb') 
        }))
        
        setTracks(appleTracks)
      } else {
        setTracks([]) // Walang nahanap
      }
    } catch (error) {
      console.error("Apple API Fetch Error:", error)
      setTracks([])
    }
    setLoading(false)
  }