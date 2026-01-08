const container = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search");

let allPokemons = [];
let offset = 0;
const limit = 20;
let isLoading = false;

async function buildGlobalMappingWithStats() {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}`
  );
  const data = await response.json();

  const batchSize = 0;
  for (let i = 0; i < data.results.length; i += batchSize) {
    const batch = data.results.slice(i, i + batchSize);

    const promises = batch.map(async (p) => {
      const detailsResp = await fetch(p.url);
      const details = await detailsResp.json();

      const speciesResp = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${details.id}`
      );
      const species = await speciesResp.json();

      const frNameObj = species.names.find((n) => n.language.name === "fr");
      const frenchName = frNameObj ? frNameObj.name : details.name;

      return {
        id: details.id,
        englishName: details.name.toLowerCase(),
        frenchName: frenchName.charAt(0).toUpperCase() + frenchName.slice(1),
        types: details.types.map((t) => t.type.name),
        stats: details.stats,
        sprite: details.sprites.front_default,
      };
    });

    const results = await Promise.all(promises);
    allPokemons.push(...results);
  }
}

function loadPokemonBlock() {
  if (isLoading || offset >= allPokemons.length) return;
  isLoading = true;

  const nextPokemons = allPokemons.slice(offset, offset + limit);
  DisplayPokemon(nextPokemons);

  offset += limit;
  isLoading = false;
}

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.trim().toLowerCase();
  const containerTop = container.getBoundingClientRect().top + window.scrollY;
  container.innerHTML = "";
  offset = 0;

  if (!value) {
    loadPokemonBlock();
    window.scrollTo({
      top: containerTop,
      behavior: "smooth",
    });
    return;
  }

  const filtered = allPokemons.filter((p) =>
    p.frenchName.toLowerCase().startsWith(value)
  );
  DisplayPokemon(filtered);

  window.scrollTo({
    top: containerTop,
    behavior: "smooth",
  });
});

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    loadPokemonBlock();
  }
});

function DisplayPokemon(pokemons) {
  for (const data of pokemons) {
    createPokemonCard(data);
  }
}

function getStatsInitial(statName) {
  return statName
    .split("-")
    .map((word) => word[0].toUpperCase())
    .join("-");
}

function createPokemonCard(data) {
  const hp = data.stats.find((stat) => stat.stat.name === "hp").base_stat;
  const firstType = data.types[0];
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
  const typeIcon = `<img src="${typeImages[firstType]}" alt="${firstType}" class="type-icon-img">`;

  const card = document.createElement("div");
  card.classList.add("pokemon-card");

  const statsFiltered = data.stats.filter((stat) => stat.stat.name !== "hp");
  let statsHTML = "";
  statsFiltered.forEach((stat) => {
    const widthPercent = (stat.base_stat / 150) * 100;
    const statInitial = getStatsInitial(stat.stat.name);
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
        <span class="type-icon">${typeIcon}</span>
      </div>

      <div class="card-image">
        <img src="${data.sprite}" alt="${data.englishName}">
      </div>

      <div class="card-info">
        <p class="stats">
          ${statsHTML}
        </p>
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

(async () => {
  searchInput.disabled = true;
  await buildGlobalMappingWithStats();
  searchInput.disabled = false;
  loadPokemonBlock();
})();
