import React from 'react';
import { useParams, Link } from 'react-router-dom';
import playlistsData from '../data/playlists.json';

export default function PlaylistPage() {
  const { playlistId } = useParams();
  
  // Find current playlist
  const playlist = playlistsData.find(p => p.id === playlistId);

  if (!playlist) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border-4 border-brand-pink rounded-3xl p-12 shadow-kid-md">
          <span className="text-6xl block mb-4">😿</span>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Playlist Not Found</h2>
          <p className="text-slate-600 font-bold mb-8">We couldn't find the playlist you are looking for.</p>
          <Link to="/" className="inline-block px-8 py-4 bg-brand-pink text-white font-black text-lg rounded-2xl shadow-kid-md btn-bounce">
            🏠 Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Top Header Actions */}
      <div className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 px-6 py-3 bg-white border-4 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-black rounded-2xl shadow-kid-sm btn-bounce"
        >
          <span>⬅️</span>
          <span>Go Back Home</span>
        </Link>
      </div>

      {/* Playlist Hero Banner */}
      <div className="bg-white border-4 border-brand-blue rounded-[2.5rem] p-6 md:p-8 shadow-kid-lg flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-10">
        <div className="w-full md:w-1/3 aspect-video bg-amber-50 rounded-2xl overflow-hidden border-4 border-amber-200">
          <img 
            src={playlist.thumbnail} 
            alt={playlist.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-2/3 text-center md:text-left">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-brand-blue font-black rounded-full text-xs mb-3 border border-blue-200 select-none">
            🎬 EDUCATIONAL PLAYLIST
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            {playlist.title}
          </h1>
          <p className="text-slate-600 font-bold leading-relaxed max-w-2xl">
            {playlist.description || "Enjoy learning from this wonderful selected collection of video lessons."}
          </p>
        </div>
      </div>

      {/* Video Grid Header */}
      <div className="mb-8 flex items-center space-x-3">
        <span className="text-3xl">🍿</span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select a Video to Watch</h2>
      </div>

      {/* Videos List Grid */}
      {(!playlist.videos || playlist.videos.length === 0) ? (
        <div className="bg-white border-4 border-dashed border-amber-300 rounded-3xl p-12 text-center shadow-kid-md">
          <span className="text-5xl block mb-4">💤</span>
          <p className="text-xl font-extrabold text-slate-600">This playlist is currently empty!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {playlist.videos.map((video, idx) => {
            // Friendly badge colors
            const badgeColors = ['bg-brand-pink', 'bg-brand-blue', 'bg-brand-green', 'bg-brand-yellow'];
            const badgeBg = badgeColors[idx % badgeColors.length];

            return (
              <Link 
                key={video.id} 
                to={`/video/${video.id}?playlist=${playlist.id}`}
                className="group block"
              >
                <div className="h-full bg-white border-4 border-slate-200 hover:border-brand-pink rounded-2xl overflow-hidden card-play flex flex-col">
                  
                  {/* Video Thumbnail Box */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Visual Hover Play Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-5xl drop-shadow-md transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        ▶️
                      </span>
                    </div>

                    {/* Simple Lesson Index Badge */}
                    <div className={`absolute top-2 left-2 ${badgeBg} text-slate-900 font-extrabold px-3 py-1 rounded-full text-xs border border-white/50 shadow`}>
                      Lesson {idx + 1}
                    </div>
                  </div>

                  {/* Video Title Card */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <h3 className="font-extrabold text-slate-800 text-base leading-snug line-clamp-3 group-hover:text-brand-pink transition-colors">
                      {video.title}
                    </h3>
                    <div className="mt-3 pt-3 border-t-2 border-dashed border-slate-50 flex items-center justify-between text-xs font-black text-slate-400">
                      <span>WATCH NOW</span>
                      <span className="text-base group-hover:translate-x-1 transition-transform">👉</span>
                    </div>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
