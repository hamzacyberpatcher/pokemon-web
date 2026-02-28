import { getPokemonData } from "./data/dataExtractor.js"

function typesHtml(types) {
    let html = '';
    types.forEach(type => {
        html += `
            <p class="type ${type}">
                ${type.charAt(0).toUpperCase() + type.slice(1)}
            </p>
        `;
    });
    return html;
}

function abilitiesHtml(abilities) {
    let html = '';
    abilities.forEach(ability => {
        const hidden = ability.hidden;
        html += `<div class="ability">${(ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)).replace("-", " ")} ${hidden ? '<span class="hidden">(Hidden)</span>' : ''} </div>`;
    });
    return html;
}

async function renderPokeCard(pokemon) {
    const pokeData = await getPokemonData(pokemon);

    const cardHtml = `
    <div class="pokemon-card">

            <!-- pokemon info: dex num, name, types -->

            <div class="pokemon-creds">
                <div class="pokedex-num">#${pokeData.id}</div>
                <div class="poke-name">${pokeData.species}</div>
                <div class="types-container">
                    ${typesHtml(pokeData.types)}
                </div>
            </div>

            <!-- the image of the pokemon -->

            <img src="${pokeData.sprite}" alt="" class="poke-img">

            <!-- shows the basic stats of the pokemon -->

            <div class="basic-stats-container">
                <div class="basic-stat">
                    <div class="stat-type">HP</div>
                    <div class="stat-value">${pokeData.stats.hp}</div>
                </div>
                <div class="basic-stat">
                    <div class="stat-type">Height</div>
                    <div class="stat-value">${pokeData.height}</div>
                </div>
                <div class="basic-stat">
                    <div class="stat-type">Weight</div>
                    <div class="stat-value">${pokeData.weight}</div>
                </div>
            </div>

            <!-- battle stats -->

            <div class="battle-stats-container">
                <div class="battle-stat">
                    <div class="battle-stat-name">Attack</div>
                    <div class="bar"><div class="${pokeData.types[0]}" style="width: ${Math.round((pokeData.stats.attack / 255) * 100)}%"></div></div>
                </div>

                <div class="battle-stat">
                    <div class="battle-stat-name">Defense</div>
                    <div class="bar"><div class="${pokeData.types[0]}" style="width: ${Math.round((pokeData.stats.defense / 255) * 100)}%"></div></div>
                </div>

                <div class="battle-stat">
                    <div class="battle-stat-name">Speed</div>
                    <div class="bar"><div class="${pokeData.types[0]}" style="width: ${Math.round((pokeData.stats.speed / 255) * 100)}%"></div></div>
                </div>
            </div>

            <!-- pokemon's abilities -->

            <div class="abilities-container">
                <div class="abilities-header">Abilities</div>
                ${abilitiesHtml(pokeData.abilities)}
            </div>

            <!-- pokemon flavor text -->

            <div class="poke-flavor-text">
                ${pokeData.description}
            </div>

        </div>
    `;

    return cardHtml;
}

let currentPage = 1;
const itemsPerPage = 24;
const totalPokemon = 1025; // Update this to your total count
const totalPages = Math.ceil(totalPokemon / itemsPerPage);

async function renderPokeCards(page) {
    const container = document.querySelector('.js-card-container');
    container.innerHTML = '<div class="loading">Loading...</div>';

    const startId = (page - 1) * itemsPerPage + 1;
    const endId = Math.min(startId + itemsPerPage - 1, totalPokemon);

    const promises = [];
    for (let i = startId; i <= endId; i++) {
        promises.push(renderPokeCard(i));
    }

    const cards = await Promise.all(promises);
    container.innerHTML = cards.join('');
    
    renderPaginationControls();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPaginationControls() {
    const navContainer = document.getElementById('js-pagination-numbers');
    navContainer.innerHTML = '';

    // Previous Arrow
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&lt;';
    prevBtn.className = 'page-btn arrow';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; renderPokeCards(currentPage); };
    navContainer.appendChild(prevBtn);

    // Numbered Buttons (Showing a range around current page)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.innerText = i;
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.onclick = () => {
            currentPage = i;
            renderPokeCards(currentPage);
        };
        navContainer.appendChild(pageBtn);
    }

    // Next Arrow
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&gt;';
    nextBtn.className = 'page-btn arrow';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; renderPokeCards(currentPage); };
    navContainer.appendChild(nextBtn);
}

renderPokeCards(currentPage);