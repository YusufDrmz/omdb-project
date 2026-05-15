const searchBtn = document.getElementById("searchBtn");
const movieInput = document.getElementById("movieInput");

searchBtn.addEventListener("click", () => {
  const movieName = movieInput.value;
  console.log(movieName);
});


const API_KEY = "724a8f9f";

const resultDiv = document.getElementById("result");

async function fetchMovie(movieName) {
  resultDiv.innerHTML = "<p>🔎 Searching...</p>";

  const response = await fetch(
    `https://www.omdbapi.com/?t=${movieName}&apikey=${API_KEY}`
  );

  const data = await response.json();

  if (data.Response === "False") {
    showError("Movie not found ❌");
    return;
  }

  showMovie(data);
}

function showMovie(movie) {
  const poster =
    movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/200x300?text=No+Image";

  resultDiv.innerHTML = `
    <h2>${movie.Title}</h2>
    <p><b>Year:</b> ${movie.Year}</p>
    <p><b>Genre:</b> ${movie.Genre}</p>
    <p><b>Director:</b> ${movie.Director}</p>
    <img src="${poster}" width="200">
  `;
}

searchBtn.addEventListener("click", () => {
  const movieName = movieInput.value.trim();

  if (movieName === "") {
    resultDiv.innerHTML = "Please enter a movie name ⚠️";
    return;
  }

  fetchMovie(movieName);
});


function saveLastSearch(movieName) {
  localStorage.setItem("lastMovie", movieName);
}


saveLastSearch(movieName);


window.addEventListener("load", () => {
  const lastMovie = localStorage.getItem("lastMovie");
  if (lastMovie) {
    movieInput.value = lastMovie;
    fetchMovie(lastMovie);
  }
});


movieInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});


function showError(message) {
  resultDiv.innerHTML = `<p style="color:red;">${message}</p>`;
}