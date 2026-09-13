import React from 'react';
import { Link } from 'react-router-dom';
import playlistsData from '../data/playlists.json';

export default function MainPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-brand-yellow to-brand-green p-6 md:p-10 rounded-[2.5rem] shadow-kid-lg border-4 border-amber-500 mb-10 text-center relative overflow-hidden">
        {/* Playful Floating Shapes */}
        <div className="absolute top-2 left-4 text-4xl cloud-drift opacity-80 select-none">☁️</div>
        <div className="absolute bottom-2 right-6 text-4xl cloud-drift opacity-80 select-none" style={{ animationDelay: '3s' }}>☁️</div>
        <div className="absolute top-1/2 right-1/4 text-2xl animate-bounce select-none">🎈</div>
        <div className="absolute bottom-1/4 left-1/5 text-2xl animate-pulse select-none">🎨</div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight drop-shadow-sm mb-3">
          Safe Classroom Player 📺
        </h1>
        <p className="text-lg md:text-xl font-extrabold text-slate-800 max-w-2xl mx-auto leading-relaxed">
          Explore amazing educational playlists without ads, click-throughs, or distractions! Just pure learning fun! 🌟
        </p>
      </div>

      {/* Playlist Grid Heading */}
      <div className="mb-8 flex items-center space-x-3">
        <span className="text-3xl">🎒</span>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Choose Your Adventure</h2>
      </div>

      {/* Grid of Playlists */}
      {playlistsData.length === 0 ? (
        <div className="bg-white border-4 border-dashed border-amber-300 rounded-3xl p-12 text-center shadow-kid-md">
          <span className="text-5xl block mb-4">😮</span>
          <p className="text-xl font-extrabold text-slate-600">No playlists found. Teacher, please add some playlists to config.js!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {playlistsData.map((playlist, idx) => {
            // Colors list to make each playlist card have a unique bright border/shadow
            const colors = [
              { border: 'border-brand-pink', shadow: 'shadow-red-200', text: 'text-brand-pink', bg: 'bg-brand-pink' },
              { border: 'border-brand-blue', shadow: 'shadow-blue-200', text: 'text-brand-blue', bg: 'bg-brand-blue' },
              { border: 'border-brand-green', shadow: 'shadow-green-200', text: 'text-brand-green', bg: 'bg-brand-green' }
            ];
            const design = colors[idx % colors.length];

            const videoCount = playlist.videos?.length || 0;
            const firstVideoThumb = playlist.videos?.[0]?.thumbnail;
            const cardThumb = playlist.thumbnail || firstVideoThumb || 'https://img.youtube.com/vi/unknown/hqdefault.jpg';

            return (
              <Link 
                key={playlist.id} 
                to={`/playlist/${playlist.id}`}
                className="group block"
              >
                <div className={`h-full bg-white border-[6px] ${design.border} rounded-[2rem] overflow-hidden card-play flex flex-col`}>
                  
                  {/* Playlist Thumbnail Frame */}
                  <div className="relative aspect-video bg-amber-50 overflow-hidden border-b-4 border-slate-100">
                    <img 
                      src={cardThumb} 
                      alt={playlist.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Video Count Badge */}
                    <div className={`absolute bottom-3 right-3 ${design.bg} text-white font-black px-4 py-1.5 rounded-full text-sm border-2 border-white shadow-md flex items-center space-x-1`}>
                      <span>🎬</span>
                      <span>{videoCount} {videoCount === 1 ? 'Video' : 'Videos'}</span>
                    </div>

                    {/* Cute hover play overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-3xl transform scale-75 group-hover:scale-100 transition-all duration-300">
                        🚀
                      </div>
                    </div>
                  </div>

                  {/* Playlist Meta Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 group-hover:text-brand-pink transition-colors leading-tight mb-2.5">
                        {playlist.title}
                      </h3>
                      <p className="text-slate-600 font-bold text-sm line-clamp-2 leading-relaxed">
                        {playlist.description || "Click to explore this amazing playlist loaded with fun videos!"}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-100 flex items-center justify-between">
                      <span className={`font-black text-base flex items-center space-x-1 ${design.text}`}>
                        <span>Open Playlist</span>
                        <span className="group-hover:translate-x-1 transition-transform">➡️</span>
                      </span>
                      <span className="text-2xl group-hover:animate-bounce">📖</span>
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
