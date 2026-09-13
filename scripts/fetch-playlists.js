import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Public Google Sheets CSV URL
const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKV_CQSsN1Hiq3eTNMNpsCO9l0fYswC2Xredb6au3RSQvzKEsavW1j2uNxwbT-_K8yscaYVvvrY0g/pub?gid=0&single=true&output=csv";

// Helper to extract video ID from standard/mobile/shorts YouTube links or raw IDs
function extractVideoId(line) {
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
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

// Built-in hardcoded mock playlists in case of absolute local fallback
const DEFAULT_MOCK_PLAYLISTS = [
  {
    id: "space-science",
    title: "Space Science 🚀",
    thumbnail: "https://img.youtube.com/vi/EwY6p-r_hyU/hqdefault.jpg",
    videos: [
      { id: "EwY6p-r_hyU", title: "Defining Gravity: Crash Course Kids #4.1", thumbnail: "https://img.youtube.com/vi/EwY6p-r_hyU/hqdefault.jpg" },
      { id: "tqSctS_E9bY", title: "Earth's Rotation & Orbit: Crash Course Kids #8.1", thumbnail: "https://img.youtube.com/vi/tqSctS_E9bY/hqdefault.jpg" },
      { id: "164YwNl1wr0", title: "What is a Star?: Crash Course Kids #34.2", thumbnail: "https://img.youtube.com/vi/164YwNl1wr0/hqdefault.jpg" }
    ]
  },
  {
    id: "animal-science",
    title: "Animal Science 🦁",
    thumbnail: "https://img.youtube.com/vi/nZ7g7_3VwCE/hqdefault.jpg",
    videos: [
      { id: "nZ7g7_3VwCE", title: "How Do Bees Make Honey? 🐝 SciShow Kids", thumbnail: "https://img.youtube.com/vi/nZ7g7_3VwCE/hqdefault.jpg" },
      { id: "37y6-0N-u68", title: "Meet the Giant Squid! 🦑 SciShow Kids", thumbnail: "https://img.youtube.com/vi/37y6-0N-u68/hqdefault.jpg" },
      { id: "bcV3_g-6K5s", title: "Why is the Sky Blue? ☁️ SciShow Kids", thumbnail: "https://img.youtube.com/vi/bcV3_g-6K5s/hqdefault.jpg" }
    ]
  }
];

// Simple, extremely robust CSV parser that splits by the last comma in the row
function parseGoogleSheetsCSV(csvText) {
  const rows = [];
  const lines = csvText.split(/\r?\n/);
  
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
    
    // Split by the LAST comma to separate the rightmost column (Playlist Title)
    const lastCommaIdx = line.lastIndexOf(',');
    if (lastCommaIdx === -1) continue; // invalid CSV row
    
    const col1 = line.substring(0, lastCommaIdx).replace(/^"|"$/g, '').trim();
    const col2 = line.substring(lastCommaIdx + 1).replace(/^"|"$/g, '').trim();
    
    if (col1 && col2) {
      rows.push({
        col1: col1,
        playlistName: col2
      });
    }
  }
  return rows;
}

async function run() {
  console.log("=== Safe Classroom Player: Fetching Google Sheets Playlists ===");
  
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  
  const targetDir = path.join(__dirname, '../src/data');
  const targetFile = path.join(targetDir, 'playlists.json');
  await fs.mkdir(targetDir, { recursive: true });

  const rawPlaylistsMap = new Map(); // Name -> Array of Video IDs

  // --- STEP 1: FETCH AND PARSE GOOGLE SHEETS CSV ---
  console.log(`Connecting to Google Sheets CSV URL: ${GOOGLE_SHEETS_CSV_URL}...`);
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    if (!response.ok) {
      throw new Error(`Google Sheets fetch failed with status: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = parseGoogleSheetsCSV(csvText);
    console.log(`Successfully parsed ${rows.length} row(s) from Google Sheets.`);

    // Group rows by playlist name and extract video IDs
    for (const row of rows) {
      const videoId = extractVideoId(row.col1);
      
      if (!videoId) {
        console.warn(`⚠️ Skipped row: "${row.col1}" (could not extract a valid YouTube video ID)`);
        continue;
      }

      if (!rawPlaylistsMap.has(row.playlistName)) {
        rawPlaylistsMap.set(row.playlistName, []);
      }
      
      // Prevent duplicates in the same playlist
      if (!rawPlaylistsMap.get(row.playlistName).includes(videoId)) {
        rawPlaylistsMap.get(row.playlistName).push(videoId);
      }
    }
  } catch (err) {
    console.error("❌ Error fetching from Google Sheets API:", err.message);
    console.log("🔄 Gracefully falling back to local files or mock data...");
  }

  // --- STEP 1B: LOCAL FOLDER FALLBACK (If Google Sheets failed) ---
  if (rawPlaylistsMap.size === 0) {
    const localPlaylistsDir = path.join(__dirname, '../playlists');
    console.log(`Scanning local folder for fallback playlists: ${localPlaylistsDir}...`);
    
    try {
      const files = await fs.readdir(localPlaylistsDir);
      const txtFiles = files.filter(f => f.toLowerCase().endsWith('.txt'));

      for (const file of txtFiles) {
        const filePath = path.join(localPlaylistsDir, file);
        const rawText = await fs.readFile(filePath, 'utf-8');
        const playlistTitle = path.basename(file, '.txt');
        const videoIds = rawText
          .split(/\r?\n/)
          .map(extractVideoId)
          .filter(Boolean);

        if (videoIds.length > 0) {
          rawPlaylistsMap.set(playlistTitle, videoIds);
        }
      }
    } catch (err) {
      console.log("⚠️ No local fallback playlists folder found:", err.message);
    }
  }

  // --- STEP 1C: TOTAL FALLBACK TO HARDCODED MOCKS ---
  if (rawPlaylistsMap.size === 0) {
    console.warn("⚠️ No playlists loaded! Writing pre-defined mock datasets.");
    await fs.writeFile(targetFile, JSON.stringify(DEFAULT_MOCK_PLAYLISTS, null, 2), 'utf-8');
    console.log(`✅ Default Mock playlists written successfully to: ${targetFile}`);
    return;
  }

  // --- STEP 2: METADATA ENRICHMENT VIA YOUTUBE API ---
  const rawPlaylists = Array.from(rawPlaylistsMap.entries()).map(([title, videoIds]) => ({
    title,
    id: slugify(title),
    videoIds
  }));

  const finalPlaylists = [];
  const allVideoIds = rawPlaylists.reduce((acc, p) => acc.concat(p.videoIds), []);
  const uniqueVideoIds = Array.from(new Set(allVideoIds));
  const videoDetailsMap = new Map(); // id -> { title, thumbnail }

  if (youtubeApiKey && uniqueVideoIds.length > 0) {
    console.log(`🔑 YOUTUBE_API_KEY found. Fetching titles for ${uniqueVideoIds.length} unique video(s) from YouTube API...`);
    
    try {
      // Chunk request in sizes of 50
      for (let i = 0; i < uniqueVideoIds.length; i += 50) {
        const chunk = uniqueVideoIds.slice(i, i + 50);
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${chunk.join(',')}&key=${youtubeApiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`YouTube API returned status: ${response.status} ${response.statusText}`);
        }
        
        const json = await response.json();
        (json.items || []).forEach(item => {
          const id = item.id;
          const snippet = item.snippet;
          const title = snippet.title;
          const thumbnail = snippet.thumbnails?.maxres?.url ||
                            snippet.thumbnails?.high?.url ||
                            snippet.thumbnails?.medium?.url ||
                            `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
          videoDetailsMap.set(id, { title, thumbnail });
        });
      }
      console.log(`✅ Fetched details for ${videoDetailsMap.size} video(s) successfully!`);
    } catch (err) {
      console.error("❌ Error enrichment from YouTube API:", err.message);
      console.log("🔄 Generating visual placeholders for missing video details.");
    }
  } else if (uniqueVideoIds.length > 0) {
    console.log("⚠️ No YOUTUBE_API_KEY found. Building visual placeholders offline.");
  }

  // --- STEP 3: CONSTRUCT FINAL PLAYLIST STRUCTURE ---
  for (const rawP of rawPlaylists) {
    const videos = rawP.videoIds.map((videoId, idx) => {
      const details = videoDetailsMap.get(videoId);
      return {
        id: videoId,
        title: details ? details.title : `Video ${idx + 1}`,
        thumbnail: details ? details.thumbnail : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
    });

    // Use first video thumbnail as the cover thumbnail of this custom playlist
    const coverThumb = videos[0]?.thumbnail || "https://img.youtube.com/vi/unknown/hqdefault.jpg";

    finalPlaylists.push({
      id: rawP.id,
      title: rawP.title,
      thumbnail: coverThumb,
      videos: videos
    });
  }

  // --- STEP 4: SAVE OUTPUT ---
  await fs.writeFile(targetFile, JSON.stringify(finalPlaylists, null, 2), 'utf-8');
  console.log(`✅ Successfully compiled ${finalPlaylists.length} playlist(s) and written to: ${targetFile}`);
}

run().catch(err => {
  console.error("Fatal Compilation Error:", err);
  process.exit(1);
});
