# Fetch 'Em All: Simple Pokédex

A client-side JavaScript web app that fetches live Pokémon data from [PokéAPI](https://pokeapi.co/) and displays it in an accessible, interactive interface.

## Features

 - Paginated grid of Pokémon with sprite images and type badges
 - Search by name or National Pokédex number
 - Detail modal with official artwork, height/weight, abilities, and base stats
 - Loading, error, and empty states
 - Keyboard-navigable and screen-reader friendly (ARIA roles, focus management)

## Project Structure

```
fetch-em-all/
  index.html        main HTML shell
  css/styles.css    all styling
  js/api.js         fetch helpers (PokéAPI)
  js/ui.js          DOM rendering functions
  js/app.js         state, event wiring, pagination
```

## Running Locally

No build step needed. Open `index.html` directly in a browser, or use any static file server:

```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx serve .
```

## API Used

- `GET https://pokeapi.co/api/v2/pokemon?limit=20&offset=0` > paginated list
- `GET https://pokeapi.co/api/v2/pokemon/{name}` > single Pokémon detail