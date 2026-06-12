# CinemaSearch - OMDb Movie Search App

A small single-page app for searching movies, series, and episodes using the OMDb API. Built with plain HTML, CSS, and JavaScript as part of an internship application project.

## What it does

- Search for a title and see its details: title, year, genre, director, cast, runtime, plot, IMDb rating, and poster
- Filter results by type (movie, series, or episode) and by year
- Shows a clear message if a title isn't found or if something goes wrong with the request
- You can search as many times as you want without reloading the page
- If you refresh the page, your last search comes back automatically (saved in the URL and in local storage)
- Repeated searches for the same title don't trigger extra API calls, since results are cached in memory
- Works on phones, tablets, and desktops

## Files

- `index.html` - page structure
- `style.css` - styling and layout
- `script.js` - search logic, API calls, and state handling

## Running it

No setup needed. Just open `index.html` in a browser.


## Deploying to GitHub Pages

1. Push the project files to a public repo named `omdb-project`.
2. In the repo, go to Settings, then Pages.
3. Under Source, choose the `main` branch and the root folder.
4. After a minute or two, the app will be live at:
   ` https://yusufdrmz.github.io/omdb-project/`

## API

This project uses the OMDb API (omdbapi.com) to fetch movie data. The API key used here is for testing/demo purposes.
