import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function run() {
  console.log("=== Safe Classroom Player: Fetching Custom Playlists ===");
  
  const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  
  const targetDir = path.join(__dirname, '../src/data');
  const targetFile = path.join(targetDir, 'playlists.json');
  await fs.mkdir(targetDir, { recursive: true });

  const rawPlaylists = []; // Array of { title, id, videoIds }

  // --- STEP 1: INGEST PLAYLIST FILES (DROPBOX OR LOCAL) ---
  if (dropboxToken) {
    console.log("🔑 DROPBOX_ACCESS_TOKEN found. Fetching playlists from Dropbox App Folder...");
    try {
      // 1. List files in App Folder root
      const listUrl = "https://api.dropboxapi.com/2/files/list_folder";
      const listResponse = await fetch(listUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${dropboxToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ path: "" })
      });

      if (!listResponse.ok) {
        throw new Error(`Dropbox list_folder failed: ${listResponse.status} ${listResponse.statusText}`);
      }

      const listData = await listResponse.json();
      const txtFiles = (listData.entries || []).filter(
        item => item[".tag"] === "file" && item.name.toLowerCase().endsWith(".txt")
      );

      console.log(`Found ${txtFiles.length} playlist text file(s) inside Dropbox App Folder.`);

      // 2. Download and parse each .txt file
      for (const file of txtFiles) {
        console.log(`Downloading Dropbox file: "${file.name}"...`);
        const downloadUrl = "https://content.dropboxapi.com/2/files/download";
        const downloadResponse = await fetch(downloadUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${dropboxToken}`,
            "Dropbox-API-Arg": JSON.stringify({ path: file.path_lower })
          }
        });

        if (!downloadResponse.ok) {
          console.error(`❌ Failed to download file "${file.name}" from Dropbox. Skipping.`);
          continue;
        }

        const rawText = await downloadResponse.text();
        const playlistTitle = path.basename(file.name, ".txt");
        const videoIds = rawText
          .split(/\r?\n/)
          .map(extractVideoId)
          .filter(Boolean);

        if (videoIds.length > 0) {
          rawPlaylists.push({
            title: playlistTitle,
            id: slugify(playlistTitle),
            videoIds: videoIds
          });
        }
      }
    } catch (err) {
      console.error("❌ Error fetching from Dropbox API:", err.message);
      console.log("🔄 Gracefully falling back to local files...");
    }
  }

  // --- STEP 1B: LOCAL FOLDER FALLBACK (If Dropbox failed or was omitted) ---
  if (rawPlaylists.length === 0) {
    const localPlaylistsDir = path.join(__dirname, '../playlists');
    console.log(`Scanning local folder for fallback playlists: ${localPlaylistsDir}...`);
    
    try {
      const files = await fs.readdir(localPlaylistsDir);
      const txtFiles = files.filter(f => f.toLowerCase().endsWith('.txt'));

      console.log(`Found ${txtFiles.length} local playlist text file(s).`);

      for (const file of txtFiles) {
        const filePath = path.join(localPlaylistsDir, file);
        const rawText = await fs.readFile(filePath, 'utf-8');
        const playlistTitle = path.basename(file, '.txt');
        const videoIds = rawText
          .split(/\r?\n/)
          .map(extractVideoId)
          .filter(Boolean);

        if (videoIds.length > 0) {
          rawPlaylists.push({
            title: playlistTitle,
            id: slugify(playlistTitle),
            videoIds: videoIds
          });
        }
      }
    } catch (err) {
      console.log("⚠️ No local playlists/ folder found or failed to read it:", err.message);
    }
  }

  // --- STEP 1C: TOTAL FALLBACK TO HARDCODED MOCKS (If both empty) ---
  if (rawPlaylists.length === 0) {
    console.warn("⚠️ No playlists loaded from Dropbox or local folder! Writing pre-defined mock datasets.");
    await fs.writeFile(targetFile, JSON.stringify(DEFAULT_MOCK_PLAYLISTS, null, 2), 'utf-8');
    console.log(`✅ Default Mock playlists written successfully to: ${targetFile}`);
    return;
  }

  // --- STEP 2: METADATA ENRICHMENT VIA YOUTUBE API ---
  const finalPlaylists = [];
  const allVideoIds = rawPlaylists.reduce((acc, p) => acc.concat(p.videoIds), []);
  const uniqueVideoIds = Array.from(new Set(allVideoIds));
  const videoDetailsMap = new Map(); // id -> { title, thumbnail }

  if (youtubeApiKey && uniqueVideoIds.length > 0) {
    console.log(`🔑 YOUTUBE_API_KEY found. Fetching titles for ${uniqueVideoIds.length} unique video(s) from YouTube API...`);
    
    try {
      // Chunk request in sizes of 50 to prevent URL overflow
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
