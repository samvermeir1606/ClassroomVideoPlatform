import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainPage from './pages/MainPage';
import PlaylistPage from './pages/PlaylistPage';
import VideoPage from './pages/VideoPage';

export default function App() {
  return (
    // We use HashRouter instead of BrowserRouter to support perfect page reloads
    // on GitHub Pages out-of-the-box without requiring 404.html redirect scripts.
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Playful Floating Navigation Bar */}
        <header className="bg-white border-b-4 border-amber-200 py-4 px-6 md:px-8 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <span className="text-3xl md:text-4xl group-hover:rotate-12 transition-transform">📺</span>
              <span className="font-black text-xl md:text-2xl text-slate-800 tracking-tight">
                Klas <span className="text-brand-pink">Filmpjes</span>
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="px-4 py-2.5 bg-brand-pink text-white font-black rounded-2xl shadow-kid-sm btn-bounce text-lg border-2 border-red-300"
                title="Start"
              >
                🏠
              </Link>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-grow pb-12">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
            <Route path="/video/:videoId" element={<VideoPage />} />
            {/* Catch-all route redirecting back home */}
            <Route path="*" element={<MainPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
