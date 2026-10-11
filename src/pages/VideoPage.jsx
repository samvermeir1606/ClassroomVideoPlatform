import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import SafePlayer from '../components/SafePlayer';
import VideoTitle from '../components/VideoTitle';

export default function VideoPage({ playlists }) {
  const { videoId } = useParams();
  const location = useLocation();

  // Theatre mode: bigger video, playlist moves below. Remembered between visits.
  const [isTheatre, setIsTheatre] = useState(() => {
    try {
      return localStorage.getItem('theatre-mode') === '1';
    } catch {
      return false;
    }
  });

  const handleToggleTheatre = () => {
    setIsTheatre(prev => {
      const next = !prev;
      try {
        localStorage.setItem('theatre-mode', next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Parse playlist ID from query parameters
  const queryParams = new URLSearchParams(location.search);
  let playlistId = queryParams.get('playlist');

  // Fallback: If playlistId is missing, find the first playlist that contains this video
  let playlist = null;
  if (playlistId) {
    playlist = playlists?.find(p => p.id === playlistId);
  }
  
  if (!playlist) {
    playlist = playlists?.find(p => p.videos && p.videos.some(v => v.id === videoId));
    if (playlist) {
      playlistId = playlist.id;
    }
  }

  return (
    <div className={`${isTheatre ? 'lg:max-w-[1800px]' : ''} max-w-7xl mx-auto px-4 py-4 md:py-8`}>
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        {playlist ? (
          <Link 
            to={`/playlist/${playlistId}`}
            className="inline-flex items-center justify-center h-12 w-16 bg-white border-4 border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white font-black rounded-2xl shadow-kid-sm btn-bounce text-xl"
            title="Terug"
          >
            ⬅️
          </Link>
        ) : (
          <Link 
            to="/"
            className="inline-flex items-center justify-center h-12 w-16 bg-white border-4 border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white font-black rounded-2xl shadow-kid-sm btn-bounce text-xl"
            title="Terug"
          >
            ⬅️
          </Link>
        )}

        {/* Home/Start Button */}
        <Link 
          to="/"
          className="inline-flex items-center justify-center h-12 w-16 bg-white border-4 border-brand-green text-brand-green hover:bg-brand-green hover:text-white font-black rounded-2xl shadow-kid-sm btn-bounce text-xl"
          title="Start"
        >
          🏠
        </Link>
      </div>

      {/* Main Two-Column Layout (Video Player + Sidebar) */}
      <div className={`grid grid-cols-1 gap-8 items-start ${isTheatre ? '' : 'lg:grid-cols-3'}`}>
        
        {/* Left Column: Player (Takes 2 columns on large screen, full width in theatre mode) */}
        <div
          className={isTheatre ? 'w-full mx-auto' : 'lg:col-span-2'}
          // In theatre mode, keep video + controls within the screen height
          style={isTheatre ? { maxWidth: 'max(640px, calc((100vh - 260px) * 16 / 9))' } : undefined}
        >
          {/* Safe Player Wrapper */}
          <SafePlayer videoId={videoId} isTheatre={isTheatre} onToggleTheatre={handleToggleTheatre} />
        </div>

        {/* Right Column: Playlist Lesson Queue (Up Next) */}
        {playlist && (
          <div className={`bg-white border-4 border-brand-pink rounded-[2.5rem] p-6 shadow-kid-lg flex flex-col overflow-hidden ${
            isTheatre ? '' : 'h-full max-h-[600px] lg:max-h-[700px]'
          }`}>
            
            {/* Sidebar Title */}
            <div className="pb-3 border-b-4 border-dashed border-slate-100 flex items-center space-x-2 mb-4">
              <span className="text-2xl">🎒</span>
              <div>
                <h3 className="font-black text-lg text-slate-800 leading-tight">Volgende</h3>
              </div>
            </div>

            {/* Scrolling Queue */}
            <div className={`pr-1 flex-grow scrollbar-thin ${
              isTheatre
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'overflow-y-auto space-y-4'
            }`}>
              {playlist.videos.map((item, idx) => {
                const isCurrent = item.id === videoId;
                
                return (
                  <Link 
                    key={item.id} 
                    to={`/video/${item.id}?playlist=${playlistId}`}
                    className={`flex items-center space-x-3 p-3 rounded-2xl border-2 transition-all block ${
                      isCurrent 
                        ? 'bg-amber-100 border-amber-400 shadow-sm' 
                        : 'bg-slate-50 hover:bg-slate-100 border-transparent hover:border-brand-pink'
                    }`}
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black border border-slate-200">
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-brand-pink/20 flex items-center justify-center">
                          <span className="text-lg animate-pulse">📺</span>
                        </div>
                      )}
                    </div>

                    {/* Lesson Meta */}
                    <div className="flex-grow min-w-0">
                      <span className={`block text-[10px] font-black tracking-wider ${isCurrent ? 'text-brand-pink' : 'text-slate-400'}`}>
                        {isCurrent ? '⭐ NU BEZIG' : `VIDEO ${idx + 1}`}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-700 leading-tight truncate">
                        <VideoTitle videoId={item.id} fallback={item.title} />
                      </h4>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
