const API_KEY = "724a8f9f";
const searchBtn = document.getElementById("searchBtn");
const movieInput = document.getElementById("movieInput");
const yearInput = document.getElementById("yearInput");
const movieContainer = document.getElementById("movieContainer");
const errorDiv = document.getElementById("error");
const loader = document.getElementById("loader");
const themeToggle = document.getElementById("themeToggle");

searchBtn.addEventListener("click", searchMovie);
themeToggle.addEventListener("click", toggleTheme);

document.addEventListener("DOMContentLoaded", () => {
  const savedMovie = localStorage.getItem("lastMovie");
  const savedTheme = localStorage.getItem("theme");

  if (savedMovie) {
    fetchMovie(savedMovie);
  }

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
});

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

function searchMovie() {
  const title = movieInput.value.trim();
  const year = yearInput.value.trim();

  if (!title) {
    showError("Please enter a movie name.");
    return;
  }

  const query = year ? `${title}&y=${year}` : title;
  localStorage.setItem("lastMovie", query);
  fetchMovie(query);
}

async function fetchMovie(query) {
  showLoader(true);
  errorDiv.textContent = "";
  movieContainer.innerHTML = "";

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?t=${query}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data.Response === "False") {
      showError(data.Error);
      return;
    }

    renderMovie(data);
  } catch {
    showError("Something went wrong. Please try again.");
  } finally {
    showLoader(false);
  }
}

function renderMovie(movie) {
  movieContainer.innerHTML = `
    <div class="movie-card">
      <img src="${movie.Poster}" alt="${movie.Title}">
      <div>
        <h2>${movie.Title} (${movie.Year})</h2>
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Director:</strong> ${movie.Director}</p>
      </div>
    </div>
  `;
}

function showError(message) {
  errorDiv.textContent = message;
}

function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}
