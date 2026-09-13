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
                Safe<span className="text-brand-pink">Classroom</span>
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="hidden md:inline-block bg-brand-green/15 text-brand-green border border-brand-green/30 text-xs font-black px-4 py-1.5 rounded-full select-none">
                🔒 Safe Player Mode Active
              </span>
              <Link 
                to="/" 
                className="px-5 py-2 bg-brand-pink text-white font-black rounded-2xl shadow-kid-sm btn-bounce text-sm border-2 border-red-300"
              >
                🏠 Home
              </Link>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
            <Route path="/video/:videoId" element={<VideoPage />} />
            {/* Catch-all route redirecting back home */}
            <Route path="*" element={<MainPage />} />
          </Routes>
        </main>

        {/* Playful Child-Friendly Footer */}
        <footer className="bg-slate-900 text-slate-400 py-8 border-t-8 border-amber-300 text-center select-none font-bold">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="text-white text-base">
              🍎 Handcrafted with ❤️ for kids and classroom safety.
            </p>
            <p className="text-xs text-slate-500">
              No ads • No tracking • No recommendations • Just learning!
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
