const BASE_URL = 'https://pokeapi.co/api/v2';

async function fetchPokemonList(limit = 20, offset = 0) {
	const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
	if (!res.ok) throw new Error(`Failed to load Pokémon list (${res.status})`);
	return res.json();
}

async function fetchPokemon(nameOrId) {
	const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
	if (!res.ok) throw new Error(`Failed to load Pokémon "${nameOrId}" (${res.status})`);
	return res.json();
}

async function fetchAllPokemonNames() {
	const res = await fetch(`${BASE_URL}/pokemon?limit=10000`);
	if (!res.ok) throw new Error(`Failed to load Pokémon names (${res.status})`);
	const data = await res.json();
	return data.results.map(p => p.name);
}
