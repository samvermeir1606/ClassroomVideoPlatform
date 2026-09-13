import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainPage from './pages/MainPage';
import PlaylistPage from './pages/PlaylistPage';
import VideoPage from './pages/VideoPage';
import { parseGoogleSheetsCSV } from './utils/csvParser';
import fallbackPlaylists from './data/playlists.json'; // Statically loaded fallback in case network fails

const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKV_CQSsN1Hiq3eTNMNpsCO9l0fYswC2Xredb6au3RSQvzKEsavW1j2uNxwbT-_K8yscaYVvvrY0g/pub?gid=0&single=true&output=csv";

export default function App() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch public Google Sheet CSV directly at runtime
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        if (!response.ok) throw new Error("Network error fetching Google Sheets");
        const csvText = await response.text();
        const parsed = parseGoogleSheetsCSV(csvText);
        
        if (parsed && parsed.length > 0) {
          setPlaylists(parsed);
        } else {
          setPlaylists(fallbackPlaylists);
        }
      } catch (err) {
        console.warn("⚠️ Failed to fetch live Google Sheets. Loading local fallback playlists.", err);
        setPlaylists(fallbackPlaylists);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50">
        <div className="animate-bounce text-6xl mb-6">🎈</div>
        <div className="text-brand-pink font-black text-2xl tracking-wide animate-pulse">Even geduld... 🎈</div>
      </div>
    );
  }

  return (
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
            <Route path="/" element={<MainPage playlists={playlists} />} />
            <Route path="/playlist/:playlistId" element={<PlaylistPage playlists={playlists} />} />
            <Route path="/video/:videoId" element={<VideoPage playlists={playlists} />} />
            {/* Catch-all route redirecting back home */}
            <Route path="*" element={<MainPage playlists={playlists} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
