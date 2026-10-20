const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const CONFIGURE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arabic Content + Torbox - Stremio Addon</title>
  <style>
    :root {
      --bg: #0f111a;
      --card-bg: #1a1d2e;
      --accent: #6c5ce7;
      --accent-hover: #5849d6;
      --text: #ffffff;
      --text-muted: #8e94b2;
      --border: #2a2e45;
      --success: #00b894;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 36px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    }
    .header { text-align: center; margin-bottom: 28px; }
    .badge {
      display: inline-block;
      background: rgba(108, 92, 231, 0.2);
      color: var(--accent);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    h1 { font-size: 24px; margin-bottom: 8px; font-weight: 700; }
    p.desc { color: var(--text-muted); font-size: 14px; line-height: 1.5; }
    .form-group { margin-bottom: 20px; }
    label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--text); }
    input[type="text"], input[type="password"] {
      width: 100%;
      padding: 12px 14px;
      background: #111322;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: white;
      font-size: 14px;
      outline: none;
    }
    input[type="text"]:focus, input[type="password"]:focus { border-color: var(--accent); }
    .hint { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
    .hint a { color: var(--accent); text-decoration: none; }
    .buttons { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
    .btn {
      width: 100%;
      padding: 14px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      border: none;
    }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-secondary { background: #25293f; color: white; }
    .btn-secondary:hover { background: #2f3450; }
    .copy-status { font-size: 12px; text-align: center; color: var(--success); min-height: 18px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Stremio & Nuvio Addon v2.0</div>
      <h1>Arabic Streams + Torbox</h1>
      <p class="desc">Brings Arabic movies and series directly to your Stremio library with multi-indexer scraping and cached Torbox debrid playback.</p>
    </div>
    <form id="configForm">
      <div class="form-group">
        <label for="apiKey">Torbox API Key</label>
        <input type="password" id="apiKey" placeholder="Paste your Torbox API key here..." required autocomplete="off">
        <p class="hint">Find your API key in <a href="https://torbox.app/settings" target="_blank" rel="noopener">Torbox Settings</a>.</p>
      </div>
      <div class="buttons">
        <button type="submit" class="btn btn-primary" id="installBtn">Install in Stremio</button>
        <button type="button" class="btn btn-secondary" id="copyBtn">Copy Manifest URL</button>
        <div class="copy-status" id="copyStatus"></div>
      </div>
    </form>
  </div>
  <script>
    const form = document.getElementById("configForm");
    const apiKeyInput = document.getElementById("apiKey");
    const copyBtn = document.getElementById("copyBtn");
    const copyStatus = document.getElementById("copyStatus");
    function getManifestUrl() {
      const key = apiKeyInput.value.trim();
      return window.location.origin + "/" + encodeURIComponent(key) + "/manifest.json";
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const key = apiKeyInput.value.trim();
      if (!key) return;
      const manifestUrl = getManifestUrl().replace(/^https?:\\/\\//, "");
      window.location.href = "stremio://" + manifestUrl;
    });
    copyBtn.addEventListener("click", () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        apiKeyInput.focus();
        copyStatus.textContent = "Please enter your Torbox API key first.";
        copyStatus.style.color = "#ff7675";
        return;
      }
      navigator.clipboard.writeText(getManifestUrl()).then(() => {
        copyStatus.textContent = "Manifest URL copied to clipboard!";
        copyStatus.style.color = "var(--success)";
        setTimeout(() => { copyStatus.textContent = ""; }, 3000);
      });
    });
  </script>
</body>
</html>`;

// Curated Arabic Titles (Valid IMDb IDs + English & Arabic search names)
const SAMPLE_ARABIC_MOVIES = [
  { id: "tt11033054", type: "movie", name: "The Blue Elephant 2 (الفيل الأزرق 2)", enTitle: "The Blue Elephant 2", arTitle: "الفيل الأزرق 2", year: "2019", poster: "https://m.media-amazon.com/images/M/MV5BMjYxYzk0OTUtZDUxMi00Mjc2LWJiNjgtZDA5MmE5YzJkMTY5XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt3850552", type: "movie", name: "The Blue Elephant (الفيل الأزرق)", enTitle: "The Blue Elephant", arTitle: "الفيل الأزرق", year: "2014", poster: "https://m.media-amazon.com/images/M/MV5BMTgzMjU0Mjk3N15BMl5BanBnXkFtZTgwNTQ5Mjk5MTE@._V1_SX300.jpg" },
  { id: "tt4854580", type: "movie", name: "Welad Rizk (ولاد رزق)", enTitle: "Welad Rizk", arTitle: "ولاد رزق", year: "2015", poster: "https://m.media-amazon.com/images/M/MV5BMGM5NzU1M2EtYWYxMy00MDM2LWI3ZDYtMzVhNzVkMDZkZTY3XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt10842068", type: "movie", name: "Welad Rizk 2 (ولاد رزق 2)", enTitle: "Welad Rizk 2", arTitle: "ولاد رزق 2", year: "2019", poster: "https://m.media-amazon.com/images/M/MV5BNmU4M2E3NTQtODFhZi00OTQyLWE1YTctYzAwNjYwYTUxMzY2XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt27918808", type: "movie", name: "Welad Rizk 3 (ولاد رزق 3)", enTitle: "Welad Rizk 3", arTitle: "ولاد رزق 3", year: "2024", poster: "https://m.media-amazon.com/images/M/MV5BN2EyNDg5MjMtZWE4Yy00YjU5LTg0MzMtOGYzYzAzOWEwYzU0XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt27961918", type: "movie", name: "Flight 404 (رحلة 404)", enTitle: "Flight 404", arTitle: "رحلة 404", year: "2024", poster: "https://m.media-amazon.com/images/M/MV5BN2EzMGZhNzgtOWI0Ny00ZDliLWJkYzMtMGMyNjFiNDk1MTlmXkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt15714392", type: "movie", name: "Kira & El Gin (كيرة والجن)", enTitle: "Kira & El Gin", arTitle: "كيرة والجن", year: "2022", poster: "https://m.media-amazon.com/images/M/MV5BOTE2ZjQxMmQtZDJhMS00MTYxLWI2ZjQtNmVhNDNlZGIwZWYyXkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt5544414", type: "movie", name: "Clash (اشتباك)", enTitle: "Clash", arTitle: "اشتباك", year: "2016", poster: "https://m.media-amazon.com/images/M/MV5BMjQ1OTI2MjU0MV5BMl5BanBnXkFtZTgwNjYzMTU3OTE@._V1_SX300.jpg" },
  { id: "tt8267604", type: "movie", name: "Capernaum (كفرناحوم)", enTitle: "Capernaum", arTitle: "كفرناحوم", year: "2018", poster: "https://m.media-amazon.com/images/M/MV5BY2Y3OGBhNTItYTWkMy00OWU5LTgyM2YtMzk5M2EyNDU2MTg2XkEyXkFqcGc@._V1_SX300.jpg" }
];

const SAMPLE_ARABIC_SERIES = [
  { id: "tt14674706", type: "series", name: "AlRawabi School for Girls (مدرسة الروابي للبنات)", enTitle: "AlRawabi School for Girls", arTitle: "مدرسة الروابي للبنات", year: "2021", poster: "https://m.media-amazon.com/images/M/MV5BZTU1NTg2NTMtZjVkYi00ZDIzLTkwMjgtNmJmZjI5N2RjMGFmXkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt10408544", type: "series", name: "Paranormal (ما وراء الطبيعة)", enTitle: "Paranormal", arTitle: "ما وراء الطبيعة", year: "2020", poster: "https://m.media-amazon.com/images/M/MV5BMjY5Y2EyZDktMDdhOC00MTI5LTkwOTMtOGI0ZGNlNTQ5NDQ5XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt15403062", type: "series", name: "Finding Ola (البحث عن علا)", enTitle: "Finding Ola", arTitle: "البحث عن علا", year: "2022", poster: "https://m.media-amazon.com/images/M/MV5BNjY3MGViMzQtODk3ZC00OWFjLThmMDgtZDM2ZGUxZjE3NWJmXkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt21966562", type: "series", name: "The Giza Killer (سفاح الجيزة)", enTitle: "The Giza Killer", arTitle: "سفاح الجيزة", year: "2023", poster: "https://m.media-amazon.com/images/M/MV5BZWVjNjY4Y2MtYjY5Ny00OTc5LWJlMzUtMjE4Njc1MmZjNTYyXkEyXkFqcGc@._V1_SX300.jpg" }
];

const ALL_LOCAL_ITEMS = [...SAMPLE_ARABIC_MOVIES, ...SAMPLE_ARABIC_SERIES];

function getManifest(torboxKey) {
  return {
    id: "community.arabic.torbox",
    version: "2.0.0",
    name: "Arabic Torbox Streams",
    description: "Arabic movies and TV shows powered by Torbox Debrid & multi-indexer scraping",
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

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes) || Number(bytes) <= 0) return "";
  const gb = Number(bytes) / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = Number(bytes) / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function extractQuality(title) {
  if (!title) return "HD";
  if (/2160p|4k|uhd/i.test(title)) return "4K";
  if (/1080p/i.test(title)) return "1080p";
  if (/720p/i.test(title)) return "720p";
  if (/480p/i.test(title)) return "480p";
  return "HD";
}

function extractHashFromMagnet(magnet) {
  if (!magnet) return null;
  const match = magnet.match(/btih:([a-fA-F0-9]{40}|[a-zA-Z2-7]{32})/i);
  return match ? match[1].toLowerCase() : null;
}

// 1. Root & Configure Page
app.get(["/", "/configure", "/:torboxKey/configure"], (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.setHeader("Content-Type", "text/html");
  res.send(CONFIGURE_HTML);
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
app.get(
  [
    "/catalog/:type/:id.json",
    "/catalog/:type/:id/:extra.json",
    "/:torboxKey/catalog/:type/:id.json",
    "/:torboxKey/catalog/:type/:id/:extra.json"
  ],
  async (req, res) => {
    const { type } = req.params;
    const list = type === "movie" ? SAMPLE_ARABIC_MOVIES : SAMPLE_ARABIC_SERIES;
    res.json({ metas: list });
  }
);

// Helper: Fetch torrents from TorBox Official Search API (https://search-api.torbox.app)
async function searchTorboxIndexer(torboxKey, imdbId, type, season, episode, queries) {
  const found = [];
  const headers = {
    Authorization: `Bearer ${torboxKey}`,
    "User-Agent": USER_AGENT
  };

  // A. Search by IMDb ID on search-api.torbox.app
  try {
    let url = `https://search-api.torbox.app/torrents/imdb:${imdbId}?check_cache=true`;
    if (type === "series" && season && episode) {
      url += `&season=${season}&episode=${episode}`;
    }
    const res = await axios.get(url, { headers, timeout: 6000 });
    const torrents = res.data?.data?.torrents || [];
    for (const t of torrents) {
      const hash = (t.hash || extractHashFromMagnet(t.magnet) || "").toLowerCase();
      if (hash) {
        found.push({
          hash,
          title: t.raw_title || t.title || "TorBox Stream",
          size: t.size || 0,
          seeders: t.last_known_seeders ?? 0,
          cached: Boolean(t.cached),
          source: "TorBox Indexer"
        });
      }
    }
  } catch (err) {
    console.warn("TorBox IMDb search error:", err.message);
  }

  // B. Search by text queries on search-api.torbox.app
  for (const q of queries) {
    if (!q) continue;
    try {
      const url = `https://search-api.torbox.app/torrents/search/${encodeURIComponent(q)}?check_cache=true`;
      const res = await axios.get(url, { headers, timeout: 6000 });
      const torrents = res.data?.data?.torrents || [];
      for (const t of torrents) {
        const hash = (t.hash || extractHashFromMagnet(t.magnet) || "").toLowerCase();
        if (hash) {
          found.push({
            hash,
            title: t.raw_title || t.title || q,
            size: t.size || 0,
            seeders: t.last_known_seeders ?? 0,
            cached: Boolean(t.cached),
            source: "TorBox Search"
          });
        }
      }
    } catch (err) {
      console.warn(`TorBox query search error (${q}):`, err.message);
    }
  }

  return found;
}

// Helper: Fetch torrents from Torrentio (extracts infoHashes or direct TorBox streams)
async function searchTorrentio(torboxKey, type, fullId) {
  const found = [];
  try {
    // Query Torrentio with TorBox key or raw streams
    const url = `https://torrentio.strem.fun/torbox=${torboxKey}/stream/${type}/${fullId}.json`;
    const res = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 6000
    });
    const streams = res.data?.streams || [];
    for (const s of streams) {
      if (s.url && s.url.startsWith("http")) {
        found.push({
          directStream: {
            name: s.name || "TorBox ⚡",
            title: s.title || "TorBox Stream",
            url: s.url
          }
        });
      } else if (s.infoHash) {
        found.push({
          hash: s.infoHash.toLowerCase(),
          title: (s.title || "Stream").replace(/\n/g, " | "),
          size: 0,
          seeders: 10,
          cached: null,
          fileIdx: s.fileIdx,
          source: "Torrentio"
        });
      }
    }
  } catch (err) {
    console.warn("Torrentio lookup error:", err.message);
  }

  // Also try unconfigured Torrentio to extract infoHashes if configured call yielded nothing
  if (found.length === 0) {
    try {
      const url = `https://torrentio.strem.fun/stream/${type}/${fullId}.json`;
      const res = await axios.get(url, {
        headers: { "User-Agent": USER_AGENT },
        timeout: 6000
      });
      const streams = res.data?.streams || [];
      for (const s of streams) {
        if (s.infoHash) {
          found.push({
            hash: s.infoHash.toLowerCase(),
            title: (s.title || "Stream").replace(/\n/g, " | "),
            size: 0,
            seeders: 10,
            cached: null,
            fileIdx: s.fileIdx,
            source: "Torrentio"
          });
        }
      }
    } catch (err) {
      console.warn("Torrentio raw lookup error:", err.message);
    }
  }

  return found;
}

// Helper: Fetch torrents from Apibay (TPB JSON API) & YTS
async function searchPublicIndexers(imdbId, type, queries) {
  const found = [];

  // 1. YTS (Movies)
  if (type === "movie") {
    try {
      const ytsUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${imdbId}`;
      const res = await axios.get(ytsUrl, { headers: { "User-Agent": USER_AGENT }, timeout: 5000 });
      const movies = res.data?.data?.movies || [];
      for (const m of movies) {
        for (const t of m.torrents || []) {
          if (t.hash) {
            found.push({
              hash: t.hash.toLowerCase(),
              title: `${m.title_long || m.title} [${t.quality}] [${t.type}] - YTS`,
              size: t.size_bytes || 0,
              seeders: t.seeds || 0,
              cached: null,
              source: "YTS"
            });
          }
        }
      }
    } catch (err) {
      console.warn("YTS search error:", err.message);
    }
  }

  // 2. Apibay (by IMDb ID & Title queries)
  const apibayQueries = [imdbId, ...queries].filter(Boolean).slice(0, 3);
  for (const q of apibayQueries) {
    try {
      const url = `https://apibay.org/q.php?q=${encodeURIComponent(q)}`;
      const res = await axios.get(url, { headers: { "User-Agent": USER_AGENT }, timeout: 5000 });
      if (Array.isArray(res.data)) {
        for (const item of res.data) {
          if (item.info_hash && item.info_hash !== "0000000000000000000000000000000000000000") {
            found.push({
              hash: item.info_hash.toLowerCase(),
              title: item.name || q,
              size: Number(item.size) || 0,
              seeders: Number(item.seeders) || 0,
              cached: null,
              source: "TPB"
            });
          }
        }
      }
    } catch (err) {
      console.warn(`Apibay search error (${q}):`, err.message);
    }
  }

  return found;
}

// Helper: Check User's Own TorBox Library (mylist)
async function searchUserTorboxLibrary(torboxKey, queries) {
  const found = [];
  try {
    const res = await axios.get("https://api.torbox.app/v1/api/torrents/mylist", {
      headers: { Authorization: `Bearer ${torboxKey}`, "User-Agent": USER_AGENT },
      timeout: 5000
    });
    const list = res.data?.data || [];
    if (!Array.isArray(list)) return found;

    const lowerQueries = queries.filter(Boolean).map((q) => q.toLowerCase());
    for (const item of list) {
      const name = (item.name || "").toLowerCase();
      const matches = lowerQueries.some((q) => name.includes(q));
      if (matches && item.hash) {
        found.push({
          hash: item.hash.toLowerCase(),
          title: `[My TorBox Library] ${item.name}`,
          size: item.size || 0,
          seeders: 999,
          cached: true,
          source: "TorBox Cloud"
        });
      }
    }
  } catch (err) {
    console.warn("TorBox mylist check error:", err.message);
  }
  return found;
}

// 4. Stream Resolution Route
app.get(["/stream/:type/:id.json", "/:torboxKey/stream/:type/:id.json"], async (req, res) => {
  const { torboxKey, type, id } = req.params;

  if (!torboxKey) {
    return res.json({
      streams: [
        {
          name: "Config Required",
          title: "Please configure your Torbox API key first on the /configure page",
          url: `${req.protocol}://${req.get("host")}/configure`
        }
      ]
    });
  }

  try {
    const [imdbId, season, episode] = id.split(":");
    const localItem = ALL_LOCAL_ITEMS.find((i) => i.id === imdbId);

    // Fetch clean English title from Cinemeta
    let enTitle = localItem?.enTitle || "";
    let arTitle = localItem?.arTitle || "";
    let year = localItem?.year || "";

    try {
      const metaRes = await axios.get(`https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`, {
        timeout: 4000
      });
      if (metaRes.data?.meta) {
        enTitle = metaRes.data.meta.name || enTitle;
        year = (metaRes.data.meta.year || year || "").toString().split("–")[0].split("-")[0];
      }
    } catch (e) {
      console.warn("Cinemeta lookup fallback used for:", imdbId);
    }

    // Build targeted search queries (without parenthetical combined text)
    const searchQueries = [];
    if (enTitle) {
      if (type === "series" && season && episode) {
        const sPad = String(season).padStart(2, "0");
        const ePad = String(episode).padStart(2, "0");
        searchQueries.push(`${enTitle} S${sPad}E${ePad}`);
        searchQueries.push(enTitle);
      } else {
        searchQueries.push(year ? `${enTitle} ${year}` : enTitle);
        if (year) searchQueries.push(enTitle);
      }
    }
    if (arTitle) {
      searchQueries.push(arTitle);
    }

    // Query all indexers in parallel
    const [torboxResults, torrentioResults, publicResults, libraryResults] = await Promise.all([
      searchTorboxIndexer(torboxKey, imdbId, type, season, episode, searchQueries),
      searchTorrentio(torboxKey, type, id),
      searchPublicIndexers(imdbId, type, searchQueries),
      searchUserTorboxLibrary(torboxKey, [enTitle, arTitle])
    ]);

    const directStreams = [];
    const candidateMap = new Map();

    for (const item of [...libraryResults, ...torboxResults, ...torrentioResults, ...publicResults]) {
      if (item.directStream) {
        directStreams.push(item.directStream);
        continue;
      }
      if (!item.hash) continue;
      const existing = candidateMap.get(item.hash);
      if (!existing) {
        candidateMap.set(item.hash, item);
      } else {
        // Keep cached status if known
        if (item.cached === true) existing.cached = true;
        if (!existing.size && item.size) existing.size = item.size;
      }
    }

    // Batch check cache status on TorBox for all candidate hashes
    const allHashes = Array.from(candidateMap.keys()).slice(0, 80);
    if (allHashes.length > 0) {
      try {
        const cacheRes = await axios.get("https://api.torbox.app/v1/api/torrents/checkcached", {
          params: {
            hash: allHashes.join(","),
            format: "list",
            list_files: false
          },
          headers: {
            Authorization: `Bearer ${torboxKey}`,
            "User-Agent": USER_AGENT
          },
          timeout: 6000
        });

        const cachedData = cacheRes.data?.data;
        const cachedHashes = new Set();
        if (Array.isArray(cachedData)) {
          for (const c of cachedData) {
            if (typeof c === "string") cachedHashes.add(c.toLowerCase());
            else if (c && c.hash) cachedHashes.add(c.hash.toLowerCase());
          }
        } else if (cachedData && typeof cachedData === "object") {
          for (const k of Object.keys(cachedData)) {
            if (cachedData[k]) cachedHashes.add(k.toLowerCase());
          }
        }

        for (const [hash, info] of candidateMap.entries()) {
          if (cachedHashes.has(hash)) {
            info.cached = true;
          } else if (info.cached === null) {
            info.cached = false;
          }
        }
      } catch (err) {
        console.warn("TorBox checkcached call error:", err.message);
      }
    }

    // Sort candidates: Cached first, then by seeders & size
    const sortedCandidates = Array.from(candidateMap.values()).sort((a, b) => {
      if (Boolean(a.cached) !== Boolean(b.cached)) {
        return a.cached ? -1 : 1;
      }
      return (b.seeders || 0) - (a.seeders || 0);
    });

    const hostUrl = `https://${req.get("host")}`;
    const resolvedStreams = [...directStreams];

    for (const c of sortedCandidates.slice(0, 25)) {
      const quality = extractQuality(c.title);
      const sizeStr = formatBytes(c.size);
      const badge = c.cached ? "⚡ Instant Cached" : `📥 Download via TorBox (${c.seeders || 0} seeds)`;
      const metaLine = [sizeStr, badge, c.source].filter(Boolean).join(" | ");

      const queryParams = new URLSearchParams();
      if (season) queryParams.set("season", season);
      if (episode) queryParams.set("episode", episode);
      if (c.fileIdx !== undefined) queryParams.set("fileIdx", c.fileIdx);
      if (c.title) queryParams.set("dn", c.title.slice(0, 100));

      resolvedStreams.push({
        name: `TorBox ${c.cached ? "⚡" : "📥"} ${quality}`,
        title: `${c.title}\n${metaLine}`,
        url: `${hostUrl}/${encodeURIComponent(torboxKey)}/resolve/${c.hash}?${queryParams.toString()}`
      });
    }

    res.json({ streams: resolvedStreams });
  } catch (err) {
    console.error("Stream handler error:", err.message);
    res.json({ streams: [] });
  }
});

// 5. Playback Resolver Endpoint: Adds hash to TorBox -> Selects video file -> Redirects to TorBox CDN
app.get("/:torboxKey/resolve/:hash", async (req, res) => {
  const { torboxKey, hash } = req.params;
  const { season, episode, dn } = req.query;
  const cleanHash = hash.toLowerCase().trim();
  const headers = {
    Authorization: `Bearer ${torboxKey}`,
    "User-Agent": USER_AGENT
  };

  try {
    let torrentId = null;

    // Step 1: Check if torrent already exists in user's TorBox list
    try {
      const listRes = await axios.get("https://api.torbox.app/v1/api/torrents/mylist?bypass_cache=true", {
        headers,
        timeout: 6000
      });
      const list = listRes.data?.data || [];
      if (Array.isArray(list)) {
        const existing = list.find((t) => (t.hash || "").toLowerCase() === cleanHash);
        if (existing && existing.id) {
          torrentId = existing.id;
        }
      }
    } catch (e) {
      console.warn("mylist initial check failed:", e.message);
    }

    // Step 2: If not in user's account yet, call createtorrent with magnet link
    if (!torrentId) {
      const magnet = `magnet:?xt=urn:btih:${cleanHash}${dn ? `&dn=${encodeURIComponent(dn)}` : ""}`;
      const formData = new FormData();
      formData.append("magnet", magnet);
      formData.append("seed", "1");
      formData.append("allow_zip", "false");

      const createRes = await axios.post("https://api.torbox.app/v1/api/torrents/createtorrent", formData, {
        headers,
        timeout: 10000
      });

      torrentId =
        createRes.data?.data?.torrent_id ||
        createRes.data?.data?.id ||
        null;
    }

    if (!torrentId) {
      return res.status(404).send("Could not initialize torrent on TorBox.");
    }

    // Step 3: Fetch file list for this torrentId from mylist
    const detailRes = await axios.get(
      `https://api.torbox.app/v1/api/torrents/mylist?id=${torrentId}&bypass_cache=true`,
      { headers, timeout: 6000 }
    );

    const torrentObj = Array.isArray(detailRes.data?.data)
      ? detailRes.data.data[0]
      : detailRes.data?.data;

    const files = torrentObj?.files || [];
    const videoRegex = /\.(mp4|mkv|avi|mov|webm|flv|m4v|ts)$/i;
    const videoFiles = files.filter((f) => videoRegex.test(f.name || f.short_name || ""));

    let selectedFile = null;

    // Match specific episode if series
    if (season && episode && videoFiles.length > 1) {
      const sPad = String(season).padStart(2, "0");
      const ePad = String(episode).padStart(2, "0");
      const epRegex = new RegExp(`S0?${season}E0?${episode}|S${sPad}E${ePad}|\\b${season}x${ePad}\\b|\\bE${ePad}\\b`, "i");
      selectedFile = videoFiles.find((f) => epRegex.test(f.name || f.short_name || ""));
    }

    // Fallback: pick largest video file (or largest file overall)
    if (!selectedFile && videoFiles.length > 0) {
      selectedFile = videoFiles.sort((a, b) => (b.size || 0) - (a.size || 0))[0];
    }
    if (!selectedFile && files.length > 0) {
      selectedFile = files.sort((a, b) => (b.size || 0) - (a.size || 0))[0];
    }

    const fileId = selectedFile ? selectedFile.id : 0;

    // Step 4: Request CDN Download Link from TorBox and redirect Stremio player
    const dlRes = await axios.get("https://api.torbox.app/v1/api/torrents/requestdl", {
      params: {
        token: torboxKey,
        torrent_id: torrentId,
        file_id: fileId,
        redirect: "false"
      },
      headers,
      timeout: 8000
    });

    const cdnUrl = dlRes.data?.data;
    if (cdnUrl && typeof cdnUrl === "string" && cdnUrl.startsWith("http")) {
      return res.redirect(302, cdnUrl);
    }

    // Fallback to TorBox permalink redirect
    return res.redirect(
      302,
      `https://api.torbox.app/v1/api/torrents/requestdl?token=${encodeURIComponent(
        torboxKey
      )}&torrent_id=${torrentId}&file_id=${fileId}&redirect=true`
    );
  } catch (err) {
    console.error("Resolve error:", err.response?.data || err.message);
    res.status(500).send("Error resolving TorBox stream.");
  }
});

app.listen(PORT, () => {
  console.log(`Arabic Torbox Addon v2.0 running on port ${PORT}`);
});
