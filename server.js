const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Curated Arabic Titles (Valid IMDb IDs) for instant out-of-the-box catalogs
const SAMPLE_ARABIC_MOVIES = [
  { id: "tt11033054", type: "movie", name: "The Blue Elephant 2 (الفيل الأزرق 2)", poster: "https://m.media-amazon.com/images/M/MV5BMjYxYzk0OTUtZDUxMi00Mjc2LWJiNjgtZDA5MmE5YzJkMTY5XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt3850552", type: "movie", name: "The Blue Elephant (الفيل الأزرق)", poster: "https://m.media-amazon.com/images/M/MV5BMTgzMjU0Mjk3N15BMl5BanBnXkFtZTgwNTQ5Mjk5MTE@._V1_SX300.jpg" },
  { id: "tt4854580", type: "movie", name: "Welad Rizk (ولاد رزق)", poster: "https://m.media-amazon.com/images/M/MV5BMGM5NzU1M2EtYWYxMy00MDM2LWI3ZDYtMzVhNzVkMDZkZTY3XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt10842068", type: "movie", name: "Welad Rizk 2 (ولاد رزق 2)", poster: "https://m.media-amazon.com/images/M/MV5BNmU4M2E3NTQtODFhZi00OTQyLWE1YTctYzAwNjYwYTUxMzY2XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt27918808", type: "movie", name: "Welad Rizk 3 (ولاد رزق 3)", poster: "https://m.media-amazon.com/images/M/MV5BN2EyNDg5MjMtZWE4Yy00YjU5LTg0MzMtOGYzYzAzOWEwYzU0XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt27961918", type: "movie", name: "Flight 404 (رحلة 404)", poster: "https://m.media-amazon.com/images/M/MV5BN2EzMGZhNzgtOWI0Ny00ZDliLWJkYzMtMGMyNjFiNDk1MTlmXkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt15714392", type: "movie", name: "Kira & El Gin (كيرة والجن)", poster: "https://m.media-amazon.com/images/M/MV5BOTE2ZjQxMmQtZDJhMS00MTYxLWI2ZjQtNmVhNDNlZGIwZWYyXkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt5544414", type: "movie", name: "Clash (اشتباك)", poster: "https://m.media-amazon.com/images/M/MV5BMjQ1OTI2MjU0MV5BMl5BanBnXkFtZTgwNjYzMTU3OTE@._V1_SX300.jpg" },
  { id: "tt8267604", type: "movie", name: "Capernaum (كفرناحوم)", poster: "https://m.media-amazon.com/images/M/MV5BY2Y3OGBhNTItYTWkMy00OWU5LTgyM2YtMzk5M2EyNDU2MTg2XkEyXkFqcGc@._V1_SX300.jpg" }
];

const SAMPLE_ARABIC_SERIES = [
  { id: "tt14674706", type: "series", name: "AlRawabi School for Girls (مدرسة الروابي للبنات)", poster: "https://m.media-amazon.com/images/M/MV5BZTU1NTg2NTMtZjVkYi00ZDIzLTkwMjgtNmJmZjI5N2RjMGFmXkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt10408544", type: "series", name: "Paranormal (ما وراء الطبيعة)", poster: "https://m.media-amazon.com/images/M/MV5BMjY5Y2EyZDktMDdhOC00MTI5LTkwOTMtOGI0ZGNlNTQ5NDQ5XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt15403062", type: "series", name: "Finding Ola (البحث عن علا)", poster: "https://m.media-amazon.com/images/M/MV5BNjY3MGViMzQtODk3ZC00OWFjLThmMDgtZDM2ZGUxZjE3NWJmXkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt21966562", type: "series", name: "The Giza Killer (سفاح الجيزة)", poster: "https://m.media-amazon.com/images/M/MV5BZWVjNjY4Y2MtYjY5Ny00OTc5LWJlMzUtMjE4Njc1MmZjNTYyXkEyXkFqcGc@._V1_SX300.jpg" }
];

function getManifest(torboxKey) {
  return {
    id: "community.arabic.torbox",
    version: "1.0.0",
    name: "Arabic Torbox Streams",
    description: "Arabic movies and TV shows powered by Torbox Debrid streaming",
    resources: ["catalog", "stream"],
    types: ["movie", "series"],
    catalogs: [
      {
        type: "movie",
        id: "arabic_movies",
        name: "Arabic Movies (أفلام عربية)",
        extra: [{ name: "search", isRequired: false }]
      },
      {
        type: "series",
        id: "arabic_series",
        name: "Arabic Series (مسلسلات عربية)",
        extra: [{ name: "search", isRequired: false }]
      }
    ],
    idPrefixes: ["tt"],
    behaviorHints: {
      configurable: true,
      configurationRequired: !torboxKey
    }
  };
}

// 1. Root & Configure Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/configure", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 2. Manifest Routes
app.get("/manifest.json", (req, res) => {
  res.json(getManifest(null));
});

app.get("/:torboxKey/manifest.json", (req, res) => {
  const { torboxKey } = req.params;
  res.json(getManifest(torboxKey));
});

// 3. Catalog Routes
app.get(["/catalog/:type/:id.json", "/:torboxKey/catalog/:type/:id.json"], async (req, res) => {
  const { type, id } = req.params;
  const list = type === "movie" ? SAMPLE_ARABIC_MOVIES : SAMPLE_ARABIC_SERIES;
  res.json({ metas: list });
});

// 4. Stream Resolution Route
app.get(["/stream/:type/:id.json", "/:torboxKey/stream/:type/:id.json"], async (req, res) => {
  const { torboxKey, type, id } = req.params;
  
  if (!torboxKey) {
    return res.json({
      streams: [{
        title: "⚠️ Please configure your Torbox API key first in addon settings",
        url: "#"
      }]
    });
  }

  try {
    const [imdbId, season, episode] = id.split(":");

    // Fetch Title from Cinemeta
    let title = "";
    let year = "";
    try {
      const metaRes = await axios.get(`https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`, { timeout: 4000 });
      if (metaRes.data && metaRes.data.meta) {
        title = metaRes.data.meta.name;
        year = metaRes.data.meta.year || "";
      }
    } catch (e) {
      console.warn("Cinemeta lookup failed, falling back to ID");
    }

    const searchQuery = title ? `${title} ${year}`.trim() : imdbId;
    console.log(`Resolving streams for: ${searchQuery} (${type})`);

    // Search Torbox for cached/available torrents
    const streams = [];

    try {
      const torboxSearch = await axios.get("https://api.torbox.app/v1/api/torrents/search", {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${torboxKey}` },
        timeout: 5000
      });

      if (torboxSearch.data && torboxSearch.data.data && Array.isArray(torboxSearch.data.data)) {
        const results = torboxSearch.data.data.slice(0, 5);

        for (const item of results) {
          // If Torbox returns download/stream link or cached item:
          if (item.download_present || item.cached) {
            streams.push({
              name: "Torbox [Cached]",
              title: `${item.name || title}\n⚡ Instant Stream | Torbox`,
              url: item.download_url || `https://api.torbox.app/v1/api/torrents/requestdl?token=${torboxKey}&torrent_id=${item.id}`
            });
          }
        }
      }
    } catch (err) {
      console.warn("Torbox search check returned an error:", err.message);
    }

    // If no direct Torbox search hit, offer debrid queue / search fallback
    if (streams.length === 0) {
      streams.push({
        name: "Torbox Search",
        title: `Search "${title || imdbId}" on Torbox\n(No instant cached stream found for this release yet)`,
        url: `https://torbox.app`
      });
    }

    res.json({ streams });
  } catch (err) {
    console.error("Stream resolution error:", err.message);
    res.json({ streams: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Arabic Torbox Addon running on port ${PORT}`);
});
