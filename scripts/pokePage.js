import { getDetailedPokemonData } from "./data/dataExtractor.js";
import { capitalizeWords, statPercent } from "./utils/format.js";

function typesHtml(types) {
    let html = '';
    types.forEach(type => {
        html += `<div class="type ${type}">${capitalizeWords(type)}</div>`;
    });

    return html;
}

function abilitiesHtml(abilities) {
    let html = '';
    abilities.forEach(ability => {
        const hidden = ability.hidden;
        html += `<div><span class="ability-name">${capitalizeWords(ability.name)}</span> ${hidden ? '</span><span class="hidden-tag">(Hidden) </span>' : ''} <span class="ability-desc">${ability.effect}</span></div>`;
    });
    return html;
}

function renderErrorPage(type = 'not-found') {
    const container = document.querySelector('.js-hero-container');
    const detailsContainer = document.querySelector('.js-details-container');
    const footer = document.querySelector('.js-footer');

    // Clear other containers so the error is the focus
    if (detailsContainer) detailsContainer.innerHTML = '';
    if (footer) footer.innerHTML = '';

    let title, message, sprite;

    if (type === 'offline') {
        title = "No Internet Connection";
        message = "Please check your network and try again.";
    } else {
        title = "Pokemon Not Found";
        message = "We couldn't find the Pokémon you're looking for.";
        sprite = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png";
    }

    container.innerHTML = `
        <div class="error-state">
            <h2>${title}</h2>
            ${type === 'offline' ? '' : `<img class="poke-img" src="${sprite}" alt="Error">`}
            ${type === 'offline' ? `<p>${message}</p>` : ''}
            ${type === 'offline' ? '<br><button onclick="location.reload()" class="retry-btn">Retry Connection</button>' : ''}
        </div>
    `;
    document.title = title;
    document.getElementById('tree').innerHTML = '';
}

async function renderPokePage(pokemon) {
    if (!navigator.onLine) {
        renderErrorPage('offline');
        return;
    }

    let pokeData;
    try {
        pokeData = await getDetailedPokemonData(pokemon);
    } catch(error) {
        console.error("Navigation/Fetch Error:", error);
        // 2. Distinguish between Offline and Not Found
        if (error.message === "OFFLINE") {
            renderErrorPage('offline');
        } else {
            renderErrorPage('not-found');
        }
        return;
    }

    const heroHtml = `
    <img src="${pokeData.sprite}" alt="" class="poke-img">
        <div class="poke-info">
            <p><span class="poke-name">${capitalizeWords(pokeData.species)} </span><span class="poke-num">#${pokeData.id.toString().padStart(3, '0')}</span></p>
            <div class="types-container">
                ${typesHtml(pokeData.types)}
            </div>
            <div class="poke-flavor-text">
                ${pokeData.description}
            </div>
        </div>
    `;

    const deatilsHtml = `
    <div class="profile-container">
        <div class="base-stat">
            <p class="base-stat-name">Height</p>
            <p class="base-stat-val">${pokeData.height}</p>
        </div>
        <div class="base-stat">
            <p class="base-stat-name">Weight</p>
            <p class="base-stat-val">${pokeData.weight}</p>
        </div>
        <div class="base-stat">
            <p class="base-stat-name">Base Experience</p>
            <p class="base-stat-val">${pokeData.baseExp}</p>
        </div>
        <div class="base-stat">
            <p class="base-stat-name">Status</p>
            <p class="base-stat-val">${capitalizeWords(pokeData.status)}</p>
        </div>
        <div class="base-stat">
            <p class="base-stat-name">Happiness</p>
            <p class="base-stat-val">${pokeData.happiness}</p>
        </div>
        <div class="base-stat">
            <p class="base-stat-name">Growth Rate</p>
            <p class="base-stat-val">${capitalizeWords(pokeData.growthRate)}</p>
        </div>
    </div>
    <div class="stats-container">
        <div class="attack-stat">
            <div class="attack-stat-name">HP</div>
            <div class="bar" data-value="${pokeData.stats.hp}"><div class="${pokeData.types[0]}" style="width:${statPercent(pokeData.stats.hp)}%"></div></div>
        </div>
        <div class="attack-stat">
            <div class="attack-stat-name">Attack</div>
            <div class="bar" data-value="${pokeData.stats.attack}"><div class="${(pokeData.types.length > 1 ? pokeData.types[1] : pokeData.types[0])}" style="width:${statPercent(pokeData.stats.attack)}%"></div></div>
        </div>
        <div class="attack-stat">
            <div class="attack-stat-name">Defense</div>
            <div class="bar" data-value="${pokeData.stats.defense}"><div class="${pokeData.types[0]}" style="width:${statPercent(pokeData.stats.defense)}%"></div></div>
        </div>
        <div class="attack-stat">
            <div class="attack-stat-name">Special Attack</div>
            <div class="bar" data-value="${pokeData.stats.specialAtk}"><div class="${(pokeData.types.length > 1 ? pokeData.types[1] : pokeData.types[0])}" style="width:${statPercent(pokeData.stats.specialAtk)}%"></div></div>
        </div>
        <div class="attack-stat">
            <div class="attack-stat-name">Special Defense</div>
            <div class="bar" data-value="${pokeData.stats.specialDef}"><div class="${pokeData.types[0]}" style="width:${statPercent(pokeData.stats.specialDef)}%"></div></div>
        </div>
        <div class="attack-stat">
            <div class="attack-stat-name">Speed</div>
            <div class="bar" data-value="${pokeData.stats.speed}"><div class="${(pokeData.types.length > 1 ? pokeData.types[1] : pokeData.types[0])}" style="width:${statPercent(pokeData.stats.speed)}%"></div></div>
        </div>
    </div>
    <div class="abilities-container">
        <h2>Abilities</h2>
        ${abilitiesHtml(pokeData.abilities)}
    </div>
    `;

    const footerHtml = `
        <button class="poke-nav js-prev">Prev</button>
        <span id="pageInfo" class="footer-text">${pokeData.id} / 1025</span>
        <button class="poke-nav js-next">Next</button>
    `;

    document.querySelector('.js-footer').innerHTML = footerHtml;

    document.querySelector('.js-prev').addEventListener('click', () => {
        if (pokeData.id > 1) {
            window.location.href = `pokepage.html?pokemon=${pokeData.id - 1}`;
        }
    });

    document.querySelector('.js-next').addEventListener('click', () => {
        if (pokeData.id < 1025) {
            window.location.href = `pokepage.html?pokemon=${pokeData.id + 1}`;
        }
    });

    document.querySelector('.js-hero-container').innerHTML = heroHtml;
    document.querySelector('.js-details-container').innerHTML = deatilsHtml;
    document.title = capitalizeWords(pokeData.species);

    fetchEvolution(pokemon);
}

const pokemonCache = {};

async function getPokemonData(name) {
    if (pokemonCache[name]) return pokemonCache[name];
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error("Pokemon not found");
    const data = await res.json();
    pokemonCache[name] = data;
    return data;
}

// Modified to accept a name parameter
async function fetchEvolution(targetName) {
    const name = isNaN(targetName) ? targetName : Number(targetName);
    const treeContainer = document.getElementById("tree");

    if (!name) return;

    try {
        const pokemonData = await getPokemonData(name);
        const speciesRes = await fetch(pokemonData.species.url);
        const speciesData = await speciesRes.json();
        const evolutionRes = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionRes.json();

        treeContainer.innerHTML = "";
        const treeElement = await buildTree(evolutionData.chain, name);
        treeContainer.appendChild(treeElement);

    } catch (error) {
    }
}

async function buildTree(node, target, level = 1) {
    const ul = document.createElement("ul");
    ul.classList.add("tree");

    const li = document.createElement("li");

    // 1. Create the Anchor (Hyperlink)
    const link = document.createElement("a");
    const name = node.species.name;
    link.href = `pokepage.html?pokemon=${name}`;
    link.classList.add("node-link"); // Add this class to purge styles in CSS

    const container = document.createElement("div");
    container.classList.add("pokemon-node");

    const pokemonData = await getPokemonData(name);
    const id = pokemonData.id;

    // Stage badge
    const stageBadge = document.createElement("div");
    stageBadge.classList.add("stage-badge");
    stageBadge.textContent = `Stage ${level}`;

    const img = document.createElement("img");
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    img.alt = name;

    const label = document.createElement("div");
    label.textContent = `#${id.toString().padStart(3, '0')} ${capitalizeWords(name)}`;

    if (name === target || id === target) container.classList.add("highlight");

    container.appendChild(stageBadge);
    container.appendChild(img);
    container.appendChild(label);

    // 2. Wrap the container with the link
    link.appendChild(container);
    li.appendChild(link); 

    if (node.evolves_to.length > 0) {
        const childUl = document.createElement("ul");
        for (const evo of node.evolves_to) {
            childUl.appendChild(await buildTree(evo, target, level + 1));
        }
        li.appendChild(childUl);
    }

    ul.appendChild(li);
    const heading = document.querySelector('.js-evo-chain-heading');
    if (heading) heading.classList.remove('hidden');
    
    return ul;
}

const url = new URLSearchParams(window.location.search);
const pokemon = url.get("pokemon");

if (pokemon) {
    renderPokePage(pokemon);
} else {
    renderErrorPage();
}

window.addEventListener('online', () => {
    const heroContainer = document.querySelector('.js-hero-container');
    
    if (heroContainer.querySelector('.error-state')) {
        console.log("Internet restored! Attempting to reload...");

        const url = new URLSearchParams(window.location.search);
        const pokemon = url.get("pokemon");
        if (pokemon) {
            renderPokePage(pokemon);
        }
    }
});