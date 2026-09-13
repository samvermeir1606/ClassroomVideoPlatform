import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { playlists as configPlaylists } from '../src/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to extract playlist ID from string/URL
function extractPlaylistId(input) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    const playlistId = url.searchParams.get('list');
    if (playlistId) return playlistId;
  } catch (e) {
    // Ignore URL parse error, proceed to regex
  }
  const match = trimmed.match(/[?&]list=([A-Za-z0-9_-]+)/);
  if (match) return match[1];
  return null;
}

// Highly appealing, realistic mock data fallback in case YOUTUBE_API_KEY is not set
const MOCK_PLAYLISTS = [
  {
    id: "PL8dPuuaLjXtN0GE7qi7hC5hQ0a8570olD",
    title: "Crash Course Kids - Space Science 🚀",
    description: "Learn all about gravity, the solar system, and how the earth moves through space in this awesome kid-friendly compilation!",
    thumbnail: "https://img.youtube.com/vi/EwY6p-r_hyU/hqdefault.jpg",
    videos: [
      {
        id: "EwY6p-r_hyU",
        title: "Defining Gravity: Crash Course Kids #4.1",
        thumbnail: "https://img.youtube.com/vi/EwY6p-r_hyU/hqdefault.jpg"
      },
      {
        id: "tqSctS_E9bY",
        title: "Earth's Rotation & Orbit: Crash Course Kids #8.1",
        thumbnail: "https://img.youtube.com/vi/tqSctS_E9bY/hqdefault.jpg"
      },
      {
        id: "164YwNl1wr0",
        title: "What is a Star?: Crash Course Kids #34.2",
        thumbnail: "https://img.youtube.com/vi/164YwNl1wr0/hqdefault.jpg"
      },
      {
        id: "fV-F_VfbeDk",
        title: "The Sun's Energy: Crash Course Kids #1.1",
        thumbnail: "https://img.youtube.com/vi/fV-F_VfbeDk/hqdefault.jpg"
      },
      {
        id: "Lz-G042Z7mI",
        title: "Constellations & Sky Maps: Crash Course Kids #34.1",
        thumbnail: "https://img.youtube.com/vi/Lz-G042Z7mI/hqdefault.jpg"
      }
    ]
  },
  {
    id: "PL39_ud5aKSvnT-uO89_PzjhY_o9-B3pT9",
    title: "SciShow Kids - Animal Science 🦁",
    description: "Curious about nature and animals? Come learn how bees make honey, how octopuses camouflage, and why dogs are so friendly!",
    thumbnail: "https://img.youtube.com/vi/nZ7g7_3VwCE/hqdefault.jpg",
    videos: [
      {
        id: "nZ7g7_3VwCE",
        title: "How Do Bees Make Honey? 🐝 SciShow Kids",
        thumbnail: "https://img.youtube.com/vi/nZ7g7_3VwCE/hqdefault.jpg"
      },
      {
        id: "37y6-0N-u68",
        title: "Meet the Giant Squid! 🦑 SciShow Kids",
        thumbnail: "https://img.youtube.com/vi/37y6-0N-u68/hqdefault.jpg"
      },
      {
        id: "bcV3_g-6K5s",
        title: "Why is the Sky Blue? ☁️ SciShow Kids",
        thumbnail: "https://img.youtube.com/vi/bcV3_g-6K5s/hqdefault.jpg"
      },
      {
        id: "g7BHeQfCH4A",
        title: "How Do Camels Live in the Desert? 🐪 SciShow Kids",
        thumbnail: "https://img.youtube.com/vi/g7BHeQfCH4A/hqdefault.jpg"
      },
      {
        id: "V8_bC_v63_M",
        title: "Why Do Cats Purr? 🐱 SciShow Kids",
        thumbnail: "https://img.youtube.com/vi/V8_bC_v63_M/hqdefault.jpg"
      }
    ]
  },
  {
    id: "PLR3A34Y9u_808-Vv09tX9S8n4h807a9X_",
    title: "Super Simple Songs - Sing Along! 🎶",
    description: "Get up and bounce or sing along to classic nursery rhymes and cute animated educational songs perfect for toddlers and kindergarteners!",
    thumbnail: "https://img.youtube.com/vi/yCjJyiqpAuU/hqdefault.jpg",
    videos: [
      {
        id: "yCjJyiqpAuU",
        title: "Twinkle Twinkle Little Star ⭐️ | Kids Songs",
        thumbnail: "https://img.youtube.com/vi/yCjJyiqpAuU/hqdefault.jpg"
      },
      {
        id: "76_S_CWe5Z0",
        title: "Baby Shark 🦈 | Nursery Rhymes & Dance Songs",
        thumbnail: "https://img.youtube.com/vi/76_S_CWe5Z0/hqdefault.jpg"
      },
      {
        id: "e_04ZrNCSGQ",
        title: "The Wheels On The Bus 🚌 | Nursery Rhymes",
        thumbnail: "https://img.youtube.com/vi/e_04ZrNCSGQ/hqdefault.jpg"
      },
      {
        id: "2PhLZE6LpNo",
        title: "If You're Happy And You Know It! 👏 | Kids Songs",
        thumbnail: "https://img.youtube.com/vi/2PhLZE6LpNo/hqdefault.jpg"
      },
      {
        id: "tVlcKp3bWH8",
        title: "Skidamarink a dink a dink ❤️ | L-O-V-E Kids Song",
        thumbnail: "https://img.youtube.com/vi/tVlcKp3bWH8/hqdefault.jpg"
      }
    ]
  }
];

async function run() {
  console.log("=== Safe Classroom Player: Fetching Playlists ===");
  
  const apiKey = process.env.YOUTUBE_API_KEY;
  const targetDir = path.join(__dirname, '../src/data');
  const targetFile = path.join(targetDir, 'playlists.json');

  // Create src/data folder if it doesn't exist
  await fs.mkdir(targetDir, { recursive: true });

  if (!apiKey) {
    console.warn("⚠️  No YOUTUBE_API_KEY env variable found! Using beautiful mock dataset for local development.");
    await fs.writeFile(targetFile, JSON.stringify(MOCK_PLAYLISTS, null, 2), 'utf-8');
    console.log(`✅ Mock playlists written successfully to: ${targetFile}`);
    return;
  }

  const playlistIds = configPlaylists
    .map(extractPlaylistId)
    .filter(Boolean);

  if (playlistIds.length === 0) {
    console.warn("⚠️  No valid playlist IDs or URLs found in config.js! Defaulting to Mock Data.");
    await fs.writeFile(targetFile, JSON.stringify(MOCK_PLAYLISTS, null, 2), 'utf-8');
    console.log(`✅ Mock playlists written successfully to: ${targetFile}`);
    return;
  }

  console.log(`Found ${playlistIds.length} playlist(s) to fetch from YouTube API...`);

  try {
    const playlistsData = [];

    for (const playlistId of playlistIds) {
      console.log(`Fetching playlist metadata for: ${playlistId}...`);
      
      // Fetch playlist details (Title, Description, etc.)
      const playlistDetailsUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
      const playlistResponse = await fetch(playlistDetailsUrl);
      
      if (!playlistResponse.ok) {
        throw new Error(`Failed to fetch playlist details for ${playlistId}: ${playlistResponse.statusText}`);
      }
      
      const playlistJson = await playlistResponse.json();
      if (!playlistJson.items || playlistJson.items.length === 0) {
        console.warn(`⚠️  Playlist ${playlistId} not found on YouTube. Skipping.`);
        continue;
      }
      
      const item = playlistJson.items[0];
      const title = item.snippet.title;
      const description = item.snippet.description || '';
      const thumbnail = item.snippet.thumbnails?.high?.url || 
                        item.snippet.thumbnails?.medium?.url || 
                        item.snippet.thumbnails?.default?.url || 
                        `https://img.youtube.com/vi/unknown/hqdefault.jpg`;

      console.log(`Fetching video items for playlist: "${title}"...`);
      
      // Fetch playlist items (videos)
      const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
      const videosResponse = await fetch(videosUrl);
      
      if (!videosResponse.ok) {
        throw new Error(`Failed to fetch videos for playlist ${playlistId}: ${videosResponse.statusText}`);
      }
      
      const videosJson = await videosResponse.json();
      const videos = (videosJson.items || [])
        .map(v => {
          const vSnippet = v.snippet;
          const resourceId = vSnippet.resourceId || {};
          const videoId = resourceId.videoId;
          
          if (!videoId) return null;
          
          const vTitle = vSnippet.title;
          const vThumb = vSnippet.thumbnails?.high?.url || 
                         vSnippet.thumbnails?.medium?.url || 
                         vSnippet.thumbnails?.default?.url || 
                         `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                         
          return {
            id: videoId,
            title: vTitle,
            thumbnail: vThumb
          };
        })
        .filter(Boolean);

      playlistsData.push({
        id: playlistId,
        title: title,
        description: description,
        thumbnail: thumbnail,
        videos: videos
      });
    }

    if (playlistsData.length === 0) {
      console.warn("⚠️  Could not fetch details for any configured playlists! Using mock data.");
      await fs.writeFile(targetFile, JSON.stringify(MOCK_PLAYLISTS, null, 2), 'utf-8');
    } else {
      await fs.writeFile(targetFile, JSON.stringify(playlistsData, null, 2), 'utf-8');
      console.log(`✅ Live playlist data successfully downloaded and written to: ${targetFile}`);
    }

  } catch (error) {
    console.error("❌ Error fetching live playlist data:", error.message);
    console.log("🔄 Falling back to mock dataset so the build succeeds.");
    await fs.writeFile(targetFile, JSON.stringify(MOCK_PLAYLISTS, null, 2), 'utf-8');
    console.log(`✅ Mock playlists written successfully to: ${targetFile}`);
  }
}

run().catch(err => {
  console.error("Fatal Script Error:", err);
  process.exit(1);
});
