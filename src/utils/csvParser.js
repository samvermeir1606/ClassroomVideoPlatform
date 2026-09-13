// Helper to extract video ID from standard/mobile/shorts YouTube links or raw IDs
export function extractVideoId(line) {
  if (typeof line !== 'string') return null;
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null; // Ignore empty lines and comments
  
  // If it's already a raw 11-char ID
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Standard matching for youtu.be, embed, watch?v=, shorts, etc.
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  
  if (match && match[2].length === 11) {
    return match[2];
  }
  
  return null;
}

// Slugs the playlist title so it makes a clean, URL-safe ID
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

// Quote-aware CSV line splitter to handle commas inside text fields correctly
export function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Simple, extremely robust CSV parser that splits by comma, parses exactly the first two columns and ignores everything else
export function parseGoogleSheetsCSV(csvText) {
  const lines = csvText.split(/\r?\n/);
  const rawPlaylistsMap = new Map();
  
  // Detect and skip header row if present
  let startIndex = 0;
  if (lines.length > 0) {
    const firstLine = lines[0].toLowerCase();
    if (firstLine.includes('url') || firstLine.includes('playlist') || firstLine.includes('video') || firstLine.includes('categorie')) {
      startIndex = 1;
    }
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cells = splitCSVLine(line);
    if (cells.length < 2) continue; // Skip if there are fewer than 2 columns
    
    const col1 = cells[0];
    const col2 = cells[1];
    
    const videoId = extractVideoId(col1);
    if (!videoId) continue; // Skip if invalid video URL/ID
    
    // Extract playlist name strictly from the second column (index 1)
    const playlistName = col2.replace(/^"|"$/g, '').trim();
    if (!playlistName) continue; // Skip if playlist name is empty

    if (!rawPlaylistsMap.has(playlistName)) {
      rawPlaylistsMap.set(playlistName, []);
    }
    
    // Prevent duplicates inside the same playlist
    if (!rawPlaylistsMap.get(playlistName).includes(videoId)) {
      rawPlaylistsMap.get(playlistName).push(videoId);
    }
  }

  const playlists = [];
  for (const [title, videoIds] of rawPlaylistsMap.entries()) {
    const videos = videoIds.map((id, idx) => ({
      id: id,
      title: `Video ${idx + 1}`, // Fallback title
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    }));

    // Use the first video's thumbnail as the playlist's cover
    const coverThumb = videos[0]?.thumbnail || "https://img.youtube.com/vi/unknown/hqdefault.jpg";

    playlists.push({
      id: slugify(title),
      title: title,
      thumbnail: coverThumb,
      videos: videos
    });
  }

  return playlists;
}
