# Wajik-Anime-API Analysis for Nontonimek Website

## API Overview

- **Base URL:** `http://localhost:3001`
- **Source used:** `otakudesu` (prefix: `/otakudesu/...`)
- The API scrapes [otakudesu.best](https://otakudesu.best) and returns structured JSON

---

## Available Endpoints & Response Shapes

### 1. `/otakudesu/home` — Homepage data
Returns ongoing + completed anime lists in one call.

```
data.ongoing.animeList[] → { title, animeId, poster, episodes, releaseDay, latestReleaseDate, otakudesuUrl }
data.completed.animeList[] → { title, animeId, poster, episodes, score, lastReleaseDate, otakudesuUrl }
```

### 2. `/otakudesu/ongoing?page=1` — Ongoing anime (paginated)
```
data.animeList[] → { title, animeId, poster, episodes, releaseDay, latestReleaseDate, otakudesuUrl }
pagination → { currentPage, prevPage, hasPrevPage, nextPage, hasNextPage, totalPages }
```

### 3. `/otakudesu/completed?page=1` — Completed anime (paginated)
```
data.animeList[] → { title, animeId, poster, episodes, score, lastReleaseDate, otakudesuUrl }
pagination → { currentPage, prevPage, hasPrevPage, nextPage, hasNextPage, totalPages }
```

### 4. `/otakudesu/genre` — All genres list
```
data.genreList[] → { title, genreId, otakudesuUrl }
```

### 5. `/otakudesu/genre/{genreId}?page=1` — Anime by genre (paginated)
```
data.animeList[] → { title, animeId, poster, score, episodes, season, studios, synopsis, genreList[], otakudesuUrl }
pagination → { currentPage, ... }
```

### 6. `/otakudesu/anime/{animeId}` — Anime detail
```
data.details → {
  title, japanese, score, producers, type, status, episodes, duration, aired, studios, poster,
  synopsis: { paragraphList[] },
  batch: { title, batchId, otakudesuUrl } | null,
  genreList[] → { title, genreId },
  episodeList[] → { title, episodeId, otakudesuUrl },
  recommendedAnimeList[] → { title, animeId, poster, otakudesuUrl }
}
```

### 7. `/otakudesu/episode/{episodeId}` — Episode detail + streaming
```
data.details → {
  title, animeId, releaseTime, defaultStreamingUrl,
  hasPrevEpisode, prevEpisode, hasNextEpisode, nextEpisode,
  server: { qualityList[] → { title, serverList[] → { title, serverId } } },
  download: { qualityList[] → { title, size, urlList[] → { title, url } } },
  info: { credit, encoder, duration, type, genreList[], episodeList[] }
}
```

### 8. `/otakudesu/server/{serverId}` — Get video URL from server
```
data.details → { url }
```

### 9. `/otakudesu/search?q=keyword` — Search anime
```
data.animeList[] → { title, animeId, poster, status, score, genreList[], otakudesuUrl }
```

### 10. `/otakudesu/schedule` — Release schedule
```
data.scheduleList[] → { title (day), animeList[] → { title, animeId, otakudesuUrl } }
```

---

## Mapping: API → Website Pages

### 📄 [index.html](file:///d:/code_here/htmlcss/website%20animek/index.html) (Homepage)

| Section | API Endpoint | Data Used |
|---------|-------------|-----------|
| **Ongoing Anime** section (main) | `/otakudesu/ongoing?page=1` or `/otakudesu/home` | `poster`, `title`, `episodes`, `animeId` → link to [watch.html](file:///d:/code_here/htmlcss/website%20animek/watch.html) |
| **Completed Anime** section (main) | `/otakudesu/completed?page=1` or `/otakudesu/home` | `poster`, `title`, `episodes`, `score`, `animeId` |
| **RILIS TERBARU** sidebar | `/otakudesu/home` | `.ongoing.animeList` or `.completed.animeList` (latest releases) |
| **GENRE ANIME** sidebar | `/otakudesu/genre` | `genreList[]` → render as pills/badges |
| **Search bar** | `/otakudesu/search?q=...` | Search results |
| **"View All" buttons** | Link to ongoing/completed pages | — |

### 📄 [genre.html](file:///d:/code_here/htmlcss/website%20animek/genre.html) (Genre List Page)

| Section | API Endpoint | Data Used |
|---------|-------------|-----------|
| **Genre cards** | `/otakudesu/genre` | `title`, `genreId` → link to `genre-detail.html?genre={genreId}` |

### 📄 [watch.html](file:///d:/code_here/htmlcss/website%20animek/watch.html) (Anime Watch Page)

| Section | API Endpoint | Data Used |
|---------|-------------|-----------|
| **Anime info** (poster, title, badges, synopsis) | `/otakudesu/anime/{animeId}` | `poster`, `title`, `score`, `status`, `genreList`, `synopsis` |
| **Video player** | `/otakudesu/episode/{episodeId}` | `defaultStreamingUrl` → iframe src |
| **Server/Resolution selection** | `/otakudesu/episode/{episodeId}` | `server.qualityList[]` → accordion items |
| **Server video URL** | `/otakudesu/server/{serverId}` | `url` → swap iframe src |
| **Episode list** | `/otakudesu/anime/{animeId}` | `episodeList[]` → buttons |
| **"Mungkin kamu suka"** | `/otakudesu/anime/{animeId}` | `recommendedAnimeList[]` |

---

## Implementation Strategy

### How the pages would work (URL parameter approach):

Since this is a **static HTML + vanilla JS** site (no framework), data is passed via **URL query parameters**:

- [index.html](file:///d:/code_here/htmlcss/website%20animek/index.html) → Loads on open, fetches `/otakudesu/home`, `/otakudesu/genre`
- [genre.html](file:///d:/code_here/htmlcss/website%20animek/genre.html) → Fetches `/otakudesu/genre` and renders all genre cards dynamically
- `watch.html?id={animeId}` → On load, fetches `/otakudesu/anime/{animeId}` for details, then `/otakudesu/episode/{episodeId}` when user picks an episode
- `watch.html?id={animeId}&ep={episodeId}` → Directly loads a specific episode

### JavaScript files needed:

| File | Purpose |
|------|---------|
| `js/api.js` | Shared API helper (`fetchAPI(endpoint)` wrapper) |
| `js/index.js` | Fetch & render homepage content |
| `js/genre.js` | Fetch & render genre list |
| `js/watch.js` | Fetch & render anime detail + video player + episode switching |

### Key considerations:
1. **CORS** — The API must allow requests from the frontend origin (likely already handled since it's on localhost)
2. **Loading states** — Show skeleton/spinner while fetching
3. **Error handling** — Handle API failures gracefully
4. **The API must be running** — `npm run dev` in `wajik-anime-api/` folder first
