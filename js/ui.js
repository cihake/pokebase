const TYPE_COLORS = {
	fire: '#f44336',
	water: '#2196f3', 
	grass: '#4caf50',
	electric: '#ffc107',
	psychic: '#e91e63',
	ice: '#00bcd4',
	dragon: '#673ab7',
	dark: '#455a64',
	fairy: '#f48fb1',
	fighting: '#795548',
	flying: '#90caf9',
	poison: '#9c27b0',
	ground: '#ff8f00',
	rock: '#8d6e63',
	bug: '#8bc34a',
	ghost: '#7e57c2',
	steel: '#78909c',
	normal: '#9e9e9e',
};

const STAT_LABELS = {
	hp: 'HP',
	attack: 'Attack',
	defense: 'Defense',
	'special-attack': 'Sp. Atk',
	'special-defense': 'Sp. Def',
	speed: 'Speed',
};

function typeBadge(type) {
	return `<span class="type-badge" data-type="${type}">${type}</span>`;
}

function statBarClass(value) {
	if (value >= 150) return 'max';
	if (value >= 90) return 'high';
	if (value >= 50) return 'mid';
	return 'low';
}

// ===== CARD =====
function buildCardHTML(pokemon) {
	const { id, name, types, sprites } = pokemon;
	const primaryType = types[0].type.name;
	const color = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
	const paddedId = String(id).padStart(4, '0');
	const typeNames = types.map(t => t.type.name).join(' and ');

	const spriteEl = sprites.front_default
		? `<img class="card-sprite" src="${sprites.front_default}" alt="" width="96" height="96" loading="lazy">`
		: `<div class="card-sprite-placeholder" aria-hidden="true">?</div>`;

	return `
		<article
			class="pokemon-card"
			role="listitem"
			tabindex="0"
			data-name="${name}"
			style="--card-color:${color}"
			aria-label="${name}, number ${paddedId}, ${typeNames} type"
		>
			<span class="card-id">#${paddedId}</span>
			${spriteEl}
			<span class="card-name">${name}</span>
			<div class="card-types" aria-hidden="true">
				${types.map(t => typeBadge(t.type.name)).join('')}
			</div>
		</article>
	`;
}

// ===== GRID =====
function renderGrid(pokemonList) {
	document.getElementById('pokemon-grid').innerHTML = pokemonList.map(buildCardHTML).join('');
	document.getElementById('status-message').innerHTML = '';
}

// ===== LOADING =====
function renderLoading() {
	document.getElementById('pokemon-grid').innerHTML = '';
	document.getElementById('status-message').innerHTML = `
	<div class="loading-wrapper" role="status" aria-label="Loading Pokémon">
	<div class="spinner" aria-hidden="true"></div>
	<p>Loading Pokémon…</p>
	</div>
	`;
}

// ===== ERROR =====
function renderError(message) {
	document.getElementById('pokemon-grid').innerHTML = '';
	document.getElementById('status-message').innerHTML =
	`<p role="alert">⚠️ ${message}</p>`;
}

// ===== EMPTY =====
function renderEmpty(query) {
	document.getElementById('pokemon-grid').innerHTML = '';
	document.getElementById('status-message').innerHTML =
		`<p>No Pokémon found for "<strong>${query}</strong>". Try an exact name like <em>pikachu</em>.</p>`;
}

// ===== DETAIL MODAL =====
function renderDetail(pokemon) {
	const { id, name, types, sprites, stats, height, weight, abilities, base_experience } = pokemon;
	const primaryType = types[0].type.name;
	const color = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
	const paddedId = String(id).padStart(4, '0');

	const spriteUrl = sprites.other?.['official-artwork']?.front_default || sprites.front_default;
	const abilityNames = abilities.map(a => a.ability.name.replace(/-/g, ' ')).join(', ');

	const battleStatsHTML = stats.map(({ stat, base_stat }) => {
		const label = STAT_LABELS[stat.name] || stat.name;
		const pct = Math.min(100, Math.round((base_stat / 255) * 100));
		const cls = statBarClass(base_stat);
		return `
			<div class="battle-stat">
				<span class="battle-stat-name">${label}</span>
				<span class="battle-stat-value">${base_stat}</span>
				<div class="battle-stat-bar-track" aria-hidden="true">
					<div class="battle-stat-bar-fill ${cls}" style="width:${pct}%"></div>
				</div>
			</div>
		`;
	}).join('');

	document.getElementById('detail-content').innerHTML = `
		<div class="detail-hero">
			<div class="detail-hero-bg" style="background:${color}"></div>
			<p class="detail-id">#${paddedId}</p>
			<img class="detail-sprite" src="${spriteUrl}" alt="${name}" width="180" height="180">
			<h2 class="detail-name" id="detail-name">${name}</h2>
			<div class="detail-types">
				${types.map(t => typeBadge(t.type.name)).join('')}
			</div>
		</div>
		<div class="detail-body">
			<div class="detail-meta">
				<div class="stat-item">
					<span class="stat-label">Height</span>
					<span class="stat-value">${(height / 10).toFixed(1)} m</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Weight</span>
					<span class="stat-value">${(weight / 10).toFixed(1)} kg</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Abilities</span>
					<span class="stat-value">${abilityNames}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Base XP</span>
					<span class="stat-value">${base_experience ?? '—'}</span>
				</div>
			</div>
			<h3 class="section-heading">Base Stats</h3>
			<div class="battle-stats">${battleStatsHTML}</div>
		</div>
	`;
}

function openDetailOverlay() {
	const overlay = document.getElementById('detail-overlay');
	overlay.hidden = false;
	document.getElementById('close-detail').focus();
}

function closeDetailOverlay() {
	document.getElementById('detail-overlay').hidden = true;
}
