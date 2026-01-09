const container = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search");

const overlay = document.getElementById("overlay");
const overlayContent = overlay.querySelector(".overlay-content");
const closeBtn = overlay.querySelector(".close-btn");

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
  const card = document.createElement("div");
  card.classList.add("pokemon-card");

  // Création de card-inner
  const cardInner = document.createElement("div");
  cardInner.classList.add("card-inner");

  // Version pour l'overlay inner
  const overlayInner = document.createElement("div");
  overlayInner.classList.add("overlay-card-inner");

  // Header
  const header = document.createElement("div");
  header.classList.add("card-header");
  header.innerHTML = `
    <span class="name">${data.frenchName}</span>
    <span class="hp">HP: ${
      data.stats.find((s) => s.stat.name === "hp").base_stat
    }</span>
    <img src="${typeImages[data.types[0]]}" class="type-icon-img" />
  `;
  cardInner.appendChild(header);

  // Version pour l'overlay Header

  // Image
  const imgDiv = document.createElement("div");
  imgDiv.classList.add("card-image");
  const img = document.createElement("img");
  img.src = data.sprite;
  img.alt = data.englishName;
  imgDiv.appendChild(img);
  cardInner.appendChild(imgDiv);

  // Stats
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("card-info");
  infoDiv.innerHTML = data.stats
    .filter((stat) => stat.stat.name !== "hp")
    .map((stat) => {
      const widthPercent = (stat.base_stat / 150) * 100;
      const statInitial = stat.stat.name
        .split("-")
        .map((w) => w[0].toUpperCase())
        .join("-");
      return `
        <div class="stat-bar">
          <span class="stat-name">${statInitial}</span>
          <div class="stat-fill" style="width: ${widthPercent}%"></div>
          <div class="stat-number">${stat.base_stat}</div>
        </div>
      `;
    })
    .join("");
  cardInner.appendChild(infoDiv);

  card.appendChild(cardInner);

  // Ajout du clic sur la carte
  cardInner.addEventListener("click", () => openOverlay(data));

  // Dégradé selon les types
  if (data.types.length === 1) {
    cardInner.style.background = `linear-gradient(135deg, var(--${data.types[0]}), #ffffff)`;
  } else {
    cardInner.style.background = `linear-gradient(135deg, var(--${data.types[0]}), var(--${data.types[1]}))`;
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
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;

  if (scrollPosition >= pageHeight - 300) {
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
      // Cherche par nom anglais (PokeAPI ne supporte pas la recherche par français directement)
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
      // Ajouter à "allPokemons" pour éviter de refaire la requête
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

function openOverlay(data) {
  // Générer le HTML de la carte dans l’overlay
  const hp = data.stats.find((stat) => stat.stat.name === "hp").base_stat;
  const firstType = data.types[0];

  const statsHTML = data.stats
    .filter((stat) => stat.stat.name !== "hp")
    .map((stat) => {
      const widthPercent = (stat.base_stat / 150) * 100;
      const statInitial = stat.stat.name
        .split("-")
        .map((w) => w[0].toUpperCase())
        .join("-");
      return `
        <div class="stat-bar">
          <span class="stat-name">${statInitial}</span>
          <div class="stat-fill" style="width: ${widthPercent}%"></div>
          <div class="stat-number">${stat.base_stat}</div>
        </div>
      `;
    })
    .join("");

  overlayContent.innerHTML = `
    <div class="overlay-card-inner" style="background: linear-gradient(135deg, var(--${firstType}), ${
    data.types[1] ? "var(--" + data.types[1] + ")" : "#ffffff"
  })">
      <div class="card-header">
        <span class="name">${data.frenchName}</span>
        <span class="hp">HP: ${hp}</span>
        <img src="${typeImages[firstType]}" class="type-icon-img">
      </div>
      <div class="card-image">
        <img src="${data.sprite}" alt="${data.englishName}">
      </div>
      <div class="card-info">
        <p class="stats">${statsHTML}</p>
      </div>
    </div>
  `;

  overlay.classList.add("active");
}

// Fermer l’overlay
closeBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
});

// Fermer en cliquant sur le fond
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) overlay.classList.remove("active");
});

// Chargement initial
(async () => {
  searchInput.disabled = true;
  await loadPokemonBatch(); // Charge le premier batch
  searchInput.disabled = false;
})();
