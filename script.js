const container = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search");

let allPokemons = [];
let offset = 0;
const limit = 50;
let isLoading = false;

// Mapping pour les icônes de type
const typeImages = {
  normal:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/normal.svg",
  fire: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/fire.svg",
  water:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/water.svg",
  grass:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/grass.svg",
  flying:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/flying.svg",
  fighting:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/fighting.svg",
  poison:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/poison.svg",
  electric:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/electric.svg",
  ground:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/ground.svg",
  rock: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/rock.svg",
  psychic:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/psychic.svg",
  ice: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/ice.svg",
  bug: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/bug.svg",
  ghost:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/ghost.svg",
  steel:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/refs/heads/main/icons/steel.svg",
  dragon:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/dragon.svg",
  dark: "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/dark.svg",
  fairy:
    "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/fcbe6978c61c359680bc07636c3f9bdc0f346b43/icons/fairy.svg",
};

// Charge un "batch" de Pokémon depuis l’API
async function loadPokemonBatch() {
  if (isLoading) return;
  isLoading = true;

  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  );
  const data = await response.json();

  const promises = data.results.map(async (p) => {
    const detailsResp = await fetch(p.url);
    const details = await detailsResp.json();

    const speciesResp = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${details.id}`
    );
    const species = await speciesResp.json();

    const frNameObj = species.names.find((n) => n.language.name === "fr");
    const frenchName = frNameObj
      ? frNameObj.name.charAt(0).toUpperCase() + frNameObj.name.slice(1)
      : details.name.charAt(0).toUpperCase() + details.name.slice(1);

    return {
      id: details.id,
      englishName: details.name.toLowerCase(),
      frenchName,
      types: details.types.map((t) => t.type.name),
      stats: details.stats,
      sprite: details.sprites.front_default,
    };
  });

  const pokemons = await Promise.all(promises);
  allPokemons.push(...pokemons);
  DisplayPokemon(pokemons);

  offset += limit;
  isLoading = false;
}

// Fonction pour créer la carte d’un Pokémon
function createPokemonCard(data) {
  const hp = data.stats.find((stat) => stat.stat.name === "hp").base_stat;
  const firstType = data.types[0];
  const typeIcon = `<img src="${typeImages[firstType]}" alt="${firstType}" class="type-icon-img">`;

  const card = document.createElement("div");
  card.classList.add("pokemon-card");

  const statsFiltered = data.stats.filter((stat) => stat.stat.name !== "hp");
  let statsHTML = "";
  statsFiltered.forEach((stat) => {
    const widthPercent = (stat.base_stat / 150) * 100;
    const statInitial = stat.stat.name
      .split("-")
      .map((w) => w[0].toUpperCase())
      .join("-");
    statsHTML += `
      <div class="stat-bar">
        <span class="stat-name">${statInitial}</span>
        <div class="stat-fill" style="width: ${widthPercent}%"></div>
        <div class="stat-number">${stat.base_stat}</div>
      </div>
    `;
  });

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-header">
        <span class="name">${data.frenchName}</span>
        <span class="hp">HP: ${hp}</span>
        ${typeIcon}
      </div>
      <div class="card-image">
        <img src="${data.sprite}" alt="${data.englishName}">
      </div>
      <div class="card-info">
        <p class="stats">${statsHTML}</p>
      </div>
    </div>
  `;

  const inner = card.querySelector(".card-inner");
  if (data.types.length === 1) {
    inner.style.background = `linear-gradient(135deg, var(--${data.types[0]}), #ffffff)`;
  } else {
    inner.style.background = `linear-gradient(135deg, var(--${data.types[0]}), var(--${data.types[1]}))`;
  }

  container.appendChild(card);
}

// Affiche plusieurs Pokémon
function DisplayPokemon(pokemons) {
  for (const p of pokemons) {
    createPokemonCard(p);
  }
}

// Scroll infini
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    loadPokemonBatch();
  }
});

// Recherche par nom français
searchInput.addEventListener("input", async (e) => {
  const value = e.target.value.trim().toLowerCase();
  container.innerHTML = "";
  if (!value) {
    DisplayPokemon(allPokemons);
    return;
  }
  let filtered = allPokemons.filter((p) =>
    p.frenchName.toLowerCase().startsWith(value)
  );

  if (filtered.length === 0) {
    try {
      // Cherche par nom anglais (l’API PokeAPI ne supporte pas la recherche par français directement)
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${value}`
      );
      if (!response.ok) throw new Error("Pokémon non trouvé");

      const details = await response.json();

      // Récupérer le nom français
      const speciesResp = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${details.id}`
      );
      const species = await speciesResp.json();
      const frNameObj = species.names.find((n) => n.language.name === "fr");
      const frenchName = frNameObj
        ? frNameObj.name.charAt(0).toUpperCase() + frNameObj.name.slice(1)
        : details.name.charAt(0).toUpperCase() + details.name.slice(1);

      const pokemonData = {
        id: details.id,
        englishName: details.name.toLowerCase(),
        frenchName,
        types: details.types.map((t) => t.type.name),
        stats: details.stats,
        sprite: details.sprites.front_default,
      };

      // Affiche le Pokémon trouvé
      createPokemonCard(pokemonData);
      // Optionnel : l’ajouter à allPokemons pour éviter de refaire la requête
      allPokemons.push(pokemonData);
    } catch (err) {
      container.innerHTML = `
        <div class="card-inner">
          <div class="card-header">
            <span class="name">Pokemon ???</span>
          </div>
          <div class="card-image">
          </div>
          <div class="card-info">
          </div>
        </div>`;
    }
  } else {
    DisplayPokemon(filtered);
  }
});

// Chargement initial
(async () => {
  searchInput.disabled = true;
  await loadPokemonBatch(); // charge le premier batch
  searchInput.disabled = false;
})();
