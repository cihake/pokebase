const PAGE_SIZE = 20;

const state = {
	offset: 0,
	total: 0,
	isSearching: false,
	lastFocusedCard: null,
	allNames: null,
	searchResults: [],
	searchOffset: 0,
};

// ===== PAGINATION =====
function updatePagination() {
	const nav = document.querySelector('.pagination');
	const prevBtn = document.getElementById('prev-btn');
	const nextBtn = document.getElementById('next-btn');
	const info = document.getElementById('page-info');

	if (state.isSearching) {
		const totalResults = state.searchResults.length;
		if (totalResults <= PAGE_SIZE) {
			nav.hidden = true;
			return;
		}
		nav.hidden = false;
		prevBtn.disabled = state.searchOffset === 0;
		nextBtn.disabled = state.searchOffset + PAGE_SIZE >= totalResults;
		const current = Math.floor(state.searchOffset / PAGE_SIZE) + 1;
		const total = Math.ceil(totalResults / PAGE_SIZE);
		info.textContent = `Page ${current} of ${total}`;
		return;
	}

	nav.hidden = false;
	prevBtn.disabled = state.offset === 0;
	nextBtn.disabled = state.offset + PAGE_SIZE >= state.total;

	const current = Math.floor(state.offset / PAGE_SIZE) + 1;
	const total = Math.ceil(state.total / PAGE_SIZE);
	info.textContent = `Page ${current} of ${total}`;
}

// ===== PAGE LOADING =====
async function loadPage() {
	renderLoading();
	try {
		const list = await fetchPokemonList(PAGE_SIZE, state.offset);
		state.total = list.count;

		const pokemon = await Promise.all(list.results.map(p => fetchPokemon(p.name)));
		renderGrid(pokemon);
		updatePagination();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	} catch (err) {
		renderError(err.message);
		updatePagination();
	}
}

async function runSearch(query) {
	if (!query.trim()) {
		state.isSearching = false;
		state.offset = 0;
		loadPage();
		return;
	}

	state.isSearching = true;
	renderLoading();

	try {
		if (query.trim().startsWith('#')) {
			const id = parseInt(query.trim().slice(1), 10);
			if (isNaN(id)) {
				renderEmpty(query.trim());
				updatePagination();
				return;
			}
			const pokemon = await fetchPokemon(id);
			state.searchResults = [pokemon.name];
			state.searchOffset = 0;
			renderGrid([pokemon]);
			updatePagination();
			return;
		}

		if (!state.allNames) {
			state.allNames = await fetchAllPokemonNames();
		}

		const q = query.trim().toLowerCase();
		state.searchResults = state.allNames.filter(name => name.includes(q));
		state.searchOffset = 0;

		if (state.searchResults.length === 0) {
			renderEmpty(query.trim());
			updatePagination();
			return;
		}

		await loadSearchPage();
	} catch (err) {
		if (err.message.includes('404')) {
			renderEmpty(query.trim());
			updatePagination();
		} else {
			renderError(err.message);
		}
	}
}

async function loadSearchPage() {
	renderLoading();
	try {
		const page = state.searchResults.slice(state.searchOffset, state.searchOffset + PAGE_SIZE);
		const pokemon = await Promise.all(page.map(name => fetchPokemon(name)));
		renderGrid(pokemon);
		updatePagination();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	} catch (err) {
		renderError(err.message);
		updatePagination();
	}
}

// ===== DETAIL MODAL =====
function openDetail(name) {
	state.lastFocusedCard = document.querySelector(`[data-name="${name}"]`);

	// Show overlay with a loading spinner while fetching
	document.getElementById('detail-content').innerHTML = `
		<div class="loading-wrapper" style="padding:3rem">
			<div class="spinner" aria-hidden="true"></div>
			<p>Loading…</p>
		</div>
	`;
	openDetailOverlay();

	fetchPokemon(name)
		.then(pokemon => renderDetail(pokemon))
		.catch(err => {
			closeDetailOverlay();
			renderError(err.message);
		});
}

function closeDetail() {
	closeDetailOverlay();
	if (state.lastFocusedCard) {
		state.lastFocusedCard.focus();
		state.lastFocusedCard = null;
	}
}

// ===== EVENT HANDLING =====
document.addEventListener('DOMContentLoaded', () => {
	loadPage();

	// Card click / keyboard
	const grid = document.getElementById('pokemon-grid');
	grid.addEventListener('click', e => {
		const card = e.target.closest('.pokemon-card');
		if (card) openDetail(card.dataset.name);
	});
	grid.addEventListener('keydown', e => {
		if (e.key === 'Enter' || e.key === ' ') {
			const card = e.target.closest('.pokemon-card');
			if (card) { e.preventDefault(); openDetail(card.dataset.name); }
		}
	});

	// Close modal
	document.getElementById('close-detail').addEventListener('click', closeDetail);
	document.getElementById('detail-overlay').addEventListener('click', e => {
		if (e.target === e.currentTarget) closeDetail();
	});
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape' && !document.getElementById('detail-overlay').hidden) {
			closeDetail();
		}
	});

	// Pagination
	document.getElementById('prev-btn').addEventListener('click', () => {
		if (state.isSearching) {
			if (state.searchOffset >= PAGE_SIZE) { state.searchOffset -= PAGE_SIZE; loadSearchPage(); }
		} else {
			if (state.offset >= PAGE_SIZE) { state.offset -= PAGE_SIZE; loadPage(); }
		}
	});
	document.getElementById('next-btn').addEventListener('click', () => {
		if (state.isSearching) {
			state.searchOffset += PAGE_SIZE; loadSearchPage();
		} else {
			state.offset += PAGE_SIZE; loadPage();
		}
	});

	// Search (debounced 350 ms)
	let searchTimer;
	document.getElementById('search-input').addEventListener('input', e => {
		clearTimeout(searchTimer);
		const query = e.target.value;
		searchTimer = setTimeout(() => runSearch(query), 350);
	});
});
