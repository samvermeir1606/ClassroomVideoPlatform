import React, { useEffect, useState, useRef } from 'react';

export default function SafePlayer({ videoId, isTheatre = false, onToggleTheatre }) {
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState(-1); // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  // Fullscreen covers the video AND our own controls (YouTube's controls are disabled)
  const canFullscreen = typeof document !== 'undefined' &&
    !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);

  useEffect(() => {
    const onFullscreenChange = () => {
      const fsElement = document.fullscreenElement || document.webkitFullscreenElement;
      setIsFullscreen(!!fsElement && fsElement === wrapperRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      const request = el.requestFullscreen || el.webkitRequestFullscreen;
      if (request) {
        const result = request.call(el);
        if (result && result.catch) {
          result.catch((e) => console.error("Fullscreen failed:", e));
        }
      }
    }
  };

  // Load YouTube IFrame API and initialize player
  useEffect(() => {
    let checkYT;
    setIsReady(false);
    setPlayerState(-1);
    setCurrentTime(0);
    setDuration(0);

    function initPlayer() {
      if (!window.YT || !window.YT.Player) return;

      // Clean up previous player instance if it exists
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying player:", e);
        }
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 0, // Disable fullscreen button inside iframe to preserve shield
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            setDuration(event.target.getDuration());
            setIsReady(true);
            event.target.setVolume(volume);
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unmute();
            }
            // Attempt autoplay
            event.target.playVideo();
          },
          onStateChange: (event) => {
            setPlayerState(event.data);
            if (event.data === 1 && event.target.getDuration) {
              setDuration(event.target.getDuration());
            }
          }
        }
      });
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Inject script if not already present in document
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      // Check for YT readiness
      checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT);
          initPlayer();
        }
      }, 100);
    }

    return () => {
      if (checkYT) clearInterval(checkYT);
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // Polling current time while playing
  useEffect(() => {
    let timeInterval;
    if (isReady && playerState === 1) { // Playing
      timeInterval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 250);
    }
    return () => clearInterval(timeInterval);
  }, [isReady, playerState]);

  // Sync mute state
  const handleToggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unmute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  // Sync volume level
  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (!playerRef.current) return;
    playerRef.current.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      playerRef.current.unmute();
      setIsMuted(false);
    }
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (playerState === 1) { // Playing
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleScrub = (e) => {
    const seekVal = parseFloat(e.target.value);
    setCurrentTime(seekVal);
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seekVal, true);
    }
  };

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === null) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const isPlaying = playerState === 1;
  const isBuffering = playerState === 3;

  return (
    <div
      ref={wrapperRef}
      className={`w-full flex flex-col items-center ${
        isFullscreen ? 'h-screen bg-neutral-900 p-3 md:p-4' : ''
      }`}
    >
      {/* 1. Shielded Video Player Box */}
      <div 
        ref={containerRef}
        className={`relative w-full bg-neutral-900 overflow-hidden group ${
          isFullscreen
            ? 'flex-1 min-h-0 rounded-2xl'
            : 'aspect-video rounded-3xl shadow-kid-xl border-[8px] border-amber-300 md:border-[12px]'
        }`}
      >
        {/* Mount point of YouTube API */}
        <div id="youtube-player" className="w-full h-full absolute inset-0 z-0"></div>

        {/* THE SHIELD: Essential transparent layer protecting from external clicks, link-clicks or recommendations */}
        <div className="absolute inset-0 w-full h-full z-10 bg-transparent cursor-pointer" onClick={handlePlayPause}></div>

        {/* Big visual overlay if paused, unstarted, or ended */}
        {(!isPlaying && !isBuffering && isReady) && (
          <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center pointer-events-none transition-all duration-300 animate-fade-in">
            <button className="w-24 h-24 rounded-full bg-brand-pink border-4 border-white flex items-center justify-center shadow-lg text-white text-5xl hover:scale-110 transition-transform">
              ▶️
            </button>
          </div>
        )}

        {/* Loading/Buffering State */}
        {(!isReady || isBuffering) && (
          <div className="absolute inset-0 bg-neutral-900 z-30 flex flex-col items-center justify-center text-white font-bold text-xl space-y-4">
            <div className="animate-spin text-5xl">🎈</div>
            <div className="text-amber-300 animate-pulse tracking-wide">Even geduld... 🎈</div>
          </div>
        )}
      </div>

      {/* 2. Custom kid-friendly Control Dashboard */}
      <div className={`w-full bg-white border-4 border-amber-300 rounded-3xl shadow-kid-lg flex flex-col ${
        isFullscreen ? 'mt-3 p-3 md:p-4 space-y-3' : 'mt-6 p-4 md:p-6 space-y-4 md:space-y-6'
      }`}>
        
        {/* Scrubbing Timeline */}
        <div className="flex items-center space-x-3 w-full">
          <span className="text-sm md:text-base font-extrabold text-brand-pink w-12 text-right select-none">
            {formatTime(currentTime)}
          </span>
          
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleScrub}
            className="flex-grow h-4 bg-amber-100 rounded-full appearance-none cursor-pointer accent-brand-pink focus:outline-none transition-all border-2 border-amber-200"
            style={{
              background: `linear-gradient(to right, #FF6B6B 0%, #FF6B6B ${(currentTime / (duration || 100)) * 100}%, #FEF3C7 ${(currentTime / (duration || 100)) * 100}%, #FEF3C7 100%)`
            }}
          />
          
          <span className="text-sm md:text-base font-extrabold text-blue-500 w-12 select-none">
            {formatTime(duration)}
          </span>
        </div>

        {/* Playback Controls & Volume Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          {/* Main Action Button */}
          <button
            onClick={handlePlayPause}
            className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-white font-black text-xl flex items-center justify-center space-x-3 btn-bounce ${
              isPlaying 
                ? 'bg-brand-pink shadow-[0_4px_0_0_#D14F4F] border-2 border-red-300' 
                : 'bg-brand-green shadow-[0_4px_0_0_#4E9B58] border-2 border-green-300'
            }`}
          >
            <span className="text-2xl">{isPlaying ? '⏸️' : '▶️'}</span>
            <span>{isPlaying ? 'PAUZE' : 'SPEEL!'}</span>
          </button>

          {/* Volume and Status Indicators */}
          <div className="flex items-center space-x-4 w-full sm:w-auto bg-amber-50 p-2 px-4 rounded-2xl border-2 border-amber-100">
            <button
              onClick={handleToggleMute}
              className="text-2xl btn-bounce p-1 select-none"
              title={isMuted ? "Geluidsdemper" : "Geluid"}
            >
              {isMuted || volume === 0 ? '🔇' : '🔊'}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 md:w-32 h-2.5 bg-amber-200 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-sm font-black text-slate-600 select-none w-8 text-center">
              {isMuted ? 0 : volume}%
            </span>
          </div>

          {/* Screen size buttons: theatre mode + fullscreen */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onToggleTheatre && !isFullscreen && (
              <button
                onClick={onToggleTheatre}
                className={`hidden lg:inline-flex flex-1 sm:flex-none items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-black border-2 btn-bounce select-none ${
                  isTheatre
                    ? 'bg-blue-500 text-white border-blue-300 shadow-[0_4px_0_0_#2563EB]'
                    : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                }`}
                title={isTheatre ? "Normale weergave" : "Theatermodus"}
              >
                <span className="text-xl">🎬</span>
                <span>{isTheatre ? 'Klein' : 'Groot'}</span>
              </button>
            )}
            {canFullscreen && (
              <button
                onClick={handleToggleFullscreen}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-black border-2 btn-bounce select-none bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                title={isFullscreen ? "Volledig scherm sluiten" : "Volledig scherm"}
              >
                <span className="text-xl">{isFullscreen ? '↩️' : '📺'}</span>
                <span>{isFullscreen ? 'Sluiten' : 'Volledig scherm'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
