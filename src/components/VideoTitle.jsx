import React, { useState, useEffect } from 'react';

export default function VideoTitle({ videoId, fallback }) {
  const [title, setTitle] = useState(fallback || "Video");

  useEffect(() => {
    if (!videoId) return;

    const cacheKey = `yt-title-${videoId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      setTitle(cached);
      return;
    }

    // Free, open, public oEmbed proxy (No CORS restrictions, no API keys needed)
    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          setTitle(data.title);
          localStorage.setItem(cacheKey, data.title);
        }
      })
      .catch(() => {
        // Fallback silently
      });
  }, [videoId, fallback]);

  return <>{title}</>;
}
