import React from 'react';
import { Link } from 'react-router-dom';

export default function MainPage({ playlists }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Grid of Playlists */}
      {!playlists || playlists.length === 0 ? (
        <div className="bg-white border-4 border-dashed border-amber-300 rounded-3xl p-12 text-center shadow-kid-md">
          <span className="text-5xl block mb-4">😮</span>
          <p className="text-xl font-extrabold text-slate-600">Geen mappen gevonden!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {playlists.map((playlist, idx) => {
            const colors = [
              { border: 'border-brand-pink', text: 'text-brand-pink', bg: 'bg-brand-pink' },
              { border: 'border-brand-blue', text: 'text-brand-blue', bg: 'bg-brand-blue' },
              { border: 'border-brand-green', text: 'text-brand-green', bg: 'bg-brand-green' }
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
                    <div className={`absolute bottom-3 right-3 ${design.bg} text-white font-black px-4 py-1.5 rounded-full text-xs border-2 border-white shadow-md flex items-center space-x-1`}>
                      <span>🎬</span>
                      <span>{videoCount} {videoCount === 1 ? 'video' : "video's"}</span>
                    </div>

                    {/* Cute hover play overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-3xl transform scale-75 group-hover:scale-100 transition-all duration-300">
                        🚀
                      </div>
                    </div>
                  </div>

                  {/* Playlist Meta Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 group-hover:text-brand-pink transition-colors leading-tight">
                        {playlist.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-100 flex items-center justify-between">
                      <span className={`w-12 h-10 rounded-full flex items-center justify-center text-white text-lg font-black shadow-kid-sm ${design.bg} btn-bounce`}>
                        ▶️
                      </span>
                      <span className="text-2xl group-hover:animate-bounce">🎬</span>
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
