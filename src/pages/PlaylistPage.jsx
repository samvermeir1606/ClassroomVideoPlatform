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
          <h2 className="text-3xl font-black text-slate-800 mb-2">Map niet gevonden</h2>
          <Link to="/" className="inline-block px-6 py-3 bg-brand-pink text-white font-black text-xl rounded-2xl shadow-kid-md btn-bounce">
            🏠
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      {/* Top Header Actions */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center justify-center h-12 w-16 bg-white border-4 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-black rounded-2xl shadow-kid-sm btn-bounce text-xl"
          title="Terug"
        >
          ⬅️
        </Link>
      </div>

      {/* Playlist Hero Banner */}
      <div className="bg-white border-4 border-brand-blue rounded-[2rem] p-4 md:p-6 shadow-kid-md flex items-center gap-4 md:gap-6 mb-8">
        <div className="w-20 md:w-28 aspect-video bg-amber-50 rounded-xl overflow-hidden border-2 border-slate-100 flex-shrink-0">
          <img 
            src={playlist.thumbnail} 
            alt={playlist.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            {playlist.title}
          </h1>
        </div>
      </div>

      {/* Videos List Grid */}
      {(!playlist.videos || playlist.videos.length === 0) ? (
        <div className="bg-white border-4 border-dashed border-amber-300 rounded-3xl p-12 text-center shadow-kid-md">
          <span className="text-5xl block mb-4">💤</span>
          <p className="text-xl font-extrabold text-slate-600">Deze map is leeg! 💤</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlist.videos.map((video, idx) => {
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

                    {/* Simple Circle Number Index Badge */}
                    <div className={`absolute top-2 left-2 ${badgeBg} text-white font-black h-8 w-8 rounded-full text-sm border-2 border-white shadow flex items-center justify-center`}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Video Title Card */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <h3 className="font-extrabold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-brand-pink transition-colors">
                      {video.title}
                    </h3>
                    <div className="mt-2 pt-2 border-t-2 border-dashed border-slate-50 flex items-center justify-between text-xs font-black text-slate-400">
                      <span>KIJKEN! ▶️</span>
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
