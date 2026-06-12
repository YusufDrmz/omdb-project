/* =========================================================
   CineSearch — OMDb Movie Search App
   ========================================================= */

// ---- CONFIG ----
const API_KEY = "724a8f9f";
const BASE_URL = "https://www.omdbapi.com/";

// ---- DOM ELEMENTS ----
const searchBtn   = document.getElementById("searchBtn");
const movieInput  = document.getElementById("movieInput");
const yearInput   = document.getElementById("yearInput");
const typeFilter  = document.getElementById("typeFilter");
const resultDiv   = document.getElementById("result");

// ---- STATE ----
let currentType = "";          // "", "movie", "series", "episode"
const cache = new Map();       // simple in-memory cache to avoid repeat calls

/* =========================================================
   FILTER BUTTONS (Type: All / Movie / Series / Episode)
   ========================================================= */
typeFilter.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;

  // toggle active state
  typeFilter.querySelectorAll(".filter-btn").forEach((b) =>
    b.classList.remove("active")
  );
  btn.classList.add("active");

  currentType = btn.dataset.value;
});

/* =========================================================
   SEARCH TRIGGERS
   ========================================================= */
searchBtn.addEventListener("click", handleSearch);

movieInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

yearInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

function handleSearch() {
  const title = movieInput.value.trim();
  const year = yearInput.value.trim();

  if (title === "") {
    showError("Please enter a movie name.");
    return;
  }

  searchMovie(title, year, currentType);
}

/* =========================================================
   API CALLS
   ========================================================= */

// Step 1: search by title (+ optional year/type) to find a matching result
// Step 2: fetch full details (with plot) using that result's imdbID
async function searchMovie(title, year, type) {
  const cacheKey = `${title.toLowerCase()}|${year}|${type}`;

  // Avoid unnecessary repeated requests for the same query
  if (cache.has(cacheKey)) {
    renderMovie(cache.get(cacheKey));
    saveSearchState(title, year, type);
    return;
  }

  showLoading();

  try {
    // ----- Step 1: search -----
    const searchUrl = buildUrl({ s: title, y: year, type: type });
    const searchRes = await fetch(searchUrl);

    if (!searchRes.ok) {
      throw new Error(`Network error (status ${searchRes.status})`);
    }

    const searchData = await searchRes.json();

    if (searchData.Response === "False") {
      showError(searchData.Error || "Movie not found.");
      return;
    }

    // pick the first (most relevant) result
    const imdbID = searchData.Search[0].imdbID;

    // ----- Step 2: full details -----
    const detailUrl = buildUrl({ i: imdbID, plot: "full" });
    const detailRes = await fetch(detailUrl);

    if (!detailRes.ok) {
      throw new Error(`Network error (status ${detailRes.status})`);
    }

    const movie = await detailRes.json();

    if (movie.Response === "False") {
      showError(movie.Error || "Could not load movie details.");
      return;
    }

    cache.set(cacheKey, movie);
    renderMovie(movie);
    saveSearchState(title, year, type);
  } catch (err) {
    showError("Something went wrong while fetching data. Please check your connection and try again.");
    console.error(err);
  }
}

// Build an OMDb URL, skipping empty params
function buildUrl(params) {
  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", API_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

/* =========================================================
   RENDERING
   ========================================================= */
function showLoading() {
  resultDiv.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <span>Searching…</span>
    </div>
  `;
}

function showError(message) {
  resultDiv.innerHTML = `
    <div class="error-msg">
      <span class="err-icon">⚠️</span>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

function renderMovie(movie) {
  const hasPoster = movie.Poster && movie.Poster !== "N/A";

  const posterHtml = hasPoster
    ? `<img src="${movie.Poster}" alt="${escapeHtml(movie.Title)} poster" loading="lazy">`
    : `<div class="poster-placeholder">
         <span class="ph-icon">🎬</span>
         <span>No poster available</span>
       </div>`;

  const imdbHtml =
    movie.imdbRating && movie.imdbRating !== "N/A"
      ? `<div class="imdb-badge"><span class="imdb-label">IMDb</span> ${escapeHtml(movie.imdbRating)}/10</div>`
      : "";

  resultDiv.innerHTML = `
    <article class="movie-card">
      <div class="movie-poster">
        ${posterHtml}
      </div>
      <div class="movie-info">
        <span class="movie-type-badge">${escapeHtml(movie.Type || "movie")}</span>
        <h2 class="movie-title">${escapeHtml(movie.Title)}</h2>
        <p class="movie-year">${escapeHtml(movie.Year)} · ${escapeHtml(movie.Rated || "Not Rated")} · ${escapeHtml(movie.Runtime || "N/A")}</p>

        <div class="movie-meta">
          ${(movie.Genre || "")
            .split(",")
            .filter((g) => g.trim())
            .map((g) => `<span class="meta-tag">${escapeHtml(g.trim())}</span>`)
            .join("")}
        </div>

        <hr class="movie-divider">

        <div class="movie-details">
          <div class="detail-row"><span class="detail-key">Director</span><span class="detail-val">${escapeHtml(movie.Director || "N/A")}</span></div>
          <div class="detail-row"><span class="detail-key">Cast</span><span class="detail-val">${escapeHtml(movie.Actors || "N/A")}</span></div>
          <div class="detail-row"><span class="detail-key">Released</span><span class="detail-val">${escapeHtml(movie.Released || "N/A")}</span></div>
        </div>

        ${movie.Plot && movie.Plot !== "N/A" ? `<p class="movie-plot">${escapeHtml(movie.Plot)}</p>` : ""}

        ${imdbHtml}
      </div>
    </article>
  `;
}

// Basic protection against injecting raw HTML from API responses
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* =========================================================
   PERSISTENCE (URL params + LocalStorage)
   ========================================================= */

// Save current search so it survives a page refresh
function saveSearchState(title, year, type) {
  const params = new URLSearchParams();
  params.set("q", title);
  if (year) params.set("y", year);
  if (type) params.set("type", type);

  // update the URL without reloading the page
  history.replaceState(null, "", `?${params.toString()}`);

  // fallback storage, also used if URL params are stripped
  localStorage.setItem(
    "lastSearch",
    JSON.stringify({ title, year, type })
  );
}

// Restore the last search on page load (URL params take priority)
function restoreSearchState() {
  const params = new URLSearchParams(window.location.search);
  let title = params.get("q");
  let year = params.get("y") || "";
  let type = params.get("type") || "";

  // fallback to localStorage if no URL params present
  if (!title) {
    const saved = localStorage.getItem("lastSearch");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        title = parsed.title;
        year = parsed.year || "";
        type = parsed.type || "";
      } catch {
        return; // ignore corrupted data
      }
    }
  }

  if (!title) return;

  // reflect restored values in the UI
  movieInput.value = title;
  yearInput.value = year;
  currentType = type;

  typeFilter.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.value === type);
  });

  searchMovie(title, year, type);
}

/* =========================================================
   INIT
   ========================================================= */
window.addEventListener("load", restoreSearchState);
