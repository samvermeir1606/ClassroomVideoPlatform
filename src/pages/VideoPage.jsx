import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import SafePlayer from '../components/SafePlayer';
import playlistsData from '../data/playlists.json';

export default function VideoPage() {
  const { videoId } = useParams();
  const location = useLocation();

  // Parse playlist ID from query parameters
  const queryParams = new URLSearchParams(location.search);
  let playlistId = queryParams.get('playlist');

  // Fallback: If playlistId is missing, find the first playlist that contains this video
  let playlist = null;
  if (playlistId) {
    playlist = playlistsData.find(p => p.id === playlistId);
  }
  
  if (!playlist) {
    playlist = playlistsData.find(p => p.videos && p.videos.some(v => v.id === videoId));
    if (playlist) {
      playlistId = playlist.id;
    }
  }

  // Find current video details
  const video = playlist?.videos?.find(v => v.id === videoId);
  const videoTitle = video ? video.title : "Cool Educational Video";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-4">
        {playlist ? (
          <Link 
            to={`/playlist/${playlistId}`}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white border-4 border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white font-black rounded-2xl shadow-kid-sm btn-bounce"
          >
            <span>⬅️</span>
            <span>Back to Playlist</span>
          </Link>
        ) : (
          <Link 
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white border-4 border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white font-black rounded-2xl shadow-kid-sm btn-bounce"
          >
            <span>🏠</span>
            <span>Go Back Home</span>
          </Link>
        )}

        {/* Home Button */}
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-3 bg-white border-4 border-brand-green text-brand-green hover:bg-brand-green hover:text-white font-black rounded-2xl shadow-kid-sm btn-bounce"
        >
          <span>🏠 Home</span>
        </Link>
      </div>

      {/* Main Two-Column Layout (Video Player + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Player & Meta (Takes 2 columns on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Safe Player Wrapper */}
          <SafePlayer videoId={videoId} />

          {/* Video Information Card */}
          <div className="bg-white border-4 border-amber-300 rounded-[2rem] p-6 shadow-kid-md">
            {playlist && (
              <span className="inline-block px-3.5 py-1 bg-amber-100 text-slate-700 font-extrabold rounded-full text-xs mb-3 border border-amber-200">
                📚 Playlist: {playlist.title}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight mb-2">
              {videoTitle}
            </h1>
            <p className="text-slate-500 font-bold text-sm">
              📺 Watching in Safe Kid-Classroom Mode. All YouTube ads and recommendations are blocked.
            </p>
          </div>
        </div>

        {/* Right Column: Playlist Lesson Queue (Up Next) */}
        {playlist && (
          <div className="bg-white border-4 border-brand-pink rounded-[2.5rem] p-6 shadow-kid-lg flex flex-col h-full max-h-[600px] lg:max-h-[700px] overflow-hidden">
            
            {/* Sidebar Title */}
            <div className="pb-4 border-b-4 border-dashed border-slate-100 flex items-center space-x-2 mb-4">
              <span className="text-2xl">🎒</span>
              <div>
                <h3 className="font-black text-lg text-slate-800 leading-tight">Next Lessons</h3>
                <p className="text-slate-400 font-bold text-xs">Playlist Progress</p>
              </div>
            </div>

            {/* Scrolling Queue */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-grow scrollbar-thin">
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
                      <span className={`block text-[11px] font-black tracking-wider ${isCurrent ? 'text-brand-pink' : 'text-slate-400'}`}>
                        {isCurrent ? '⭐ NOW PLAYING' : `LESSON ${idx + 1}`}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-700 leading-tight truncate">
                        {item.title}
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
