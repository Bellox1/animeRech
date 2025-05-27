const resultsDiv = document.getElementById('results');
const defaultAnimesDiv = document.getElementById('defaultAnimes');
const btnSearch = document.getElementById('btnSearch');
const btnRandom = document.getElementById('btnRandom');
const searchInput = document.getElementById('searchInput');
const resultCount = document.getElementById('resultCount');
const menuToggleButton = document.getElementById('menuToggleButton');
const mySidebar = document.getElementById('mySidebar');
const overlay = document.getElementById('overlay');
const header = document.querySelector('header');

// Configuration de l'API de traduction
const apiKey = 'AIzaSyB2SadMOnczEv9gwQI2I2rpZNme9eeMvM0';
const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

// Gestion du scroll pour le header
let lastScroll = 0;

window.addEventListener('scroll', function() {
  const currentScroll = window.pageYOffset;

  // Si on descend et qu'on a dépassé 100px, on cache le header
  if (currentScroll > lastScroll && currentScroll > 100) {
    header.classList.remove('visible');
    header.classList.add('hidden');
  }
  // Si on remonte ou qu'on est en haut, on montre le header
  else if (currentScroll < lastScroll || currentScroll <= 100) {
    header.classList.remove('hidden');
    header.classList.add('visible');
  }

  lastScroll = currentScroll;
});

// Sidebar functions
function openNav() {
  mySidebar.classList.add('open');
  overlay.classList.add('active');
  menuToggleButton.classList.add('open');
  document.body.style.overflow = "hidden";
}

function closeNav() {
  mySidebar.classList.remove('open');
  overlay.classList.remove('active');
  menuToggleButton.classList.remove('open');
  document.body.style.overflow = "";
}

// Toggle sidebar
menuToggleButton.addEventListener('click', () => {
  if (mySidebar.classList.contains('open')) {
    closeNav();
  } else {
    openNav();
  }
});

// Close sidebar when clicking on overlay
overlay.addEventListener('click', closeNav);

// Close sidebar when clicking on a link (except closebtn)
document.querySelectorAll('.sidebar a:not(.closebtn)').forEach(link => {
  link.addEventListener('click', closeNav);
});

// Close sidebar when pressing Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mySidebar.classList.contains('open')) {
    closeNav();
  }
});

const popularAnimes = [
  {
    id: 49596,
    title: "Blue Lock",
    description: "Dans un programme unique, cent attaquants talentueux sont enfermés dans une compétition féroce et sans merci afin de découvrir le meilleur attaquant du monde. Le récit explore la psychologie, les stratégies, et la détermination extrême nécessaires pour atteindre ce rêve fou."
  },
  {
    id: 20,
    title: "Naruto",
    description: "Naruto Uzumaki, un jeune ninja énergique et solitaire, aspire à devenir Hokage, le chef respecté de son village caché. Son parcours est marqué par des combats épiques, des amitiés profondes et la découverte de ses origines secrètes."
  },
  {
    id: 16498,
    title: "Attack on Titan",
    description: "Dans un monde où l'humanité est menacée d'extinction par d'immenses Titans mangeurs d'hommes, les survivants vivent derrière d'immenses murailles. L'histoire suit Eren Yeager et ses amis qui rejoignent l'armée pour combattre ces créatures terrifiantes et découvrir la vérité cachée derrière leur existence."
  },
  {
    id: 38000,
    title: "Demon Slayer",
    description: "Tanjiro Kamado, un jeune garçon au grand cœur, devient pourchasseur de démons après que sa famille ait été sauvagement assassinée. Avec sa sœur transformée en démon, il parcourt un monde sombre rempli de créatures maléfiques, cherchant un remède et la justice."
  },
  {
    id: 40748,
    title: "Jujutsu Kaisen",
    description: "Yuji Itadori, un lycéen ordinaire, découvre un monde secret peuplé de malédictions et de sorciers. Après avoir avalé un objet maudit extrêmement puissant, il rejoint une école de jujutsu où il combat des forces obscures pour protéger l'humanité."
  },
  {
    id: 21,
    title: "One Piece",
    description: "Monkey D. Luffy, un jeune pirate au chapeau de paille, voyage avec son équipage à travers les mers dangereuses du Grand Line. Leur objectif : trouver le légendaire trésor One Piece et devenir le Roi des Pirates, tout en affrontant ennemis et secrets du monde marin."
  },
  {
    id: 1535,
    title: "Death Note",
    description: "Light Yagami, un brillant étudiant, découvre un carnet surnaturel nommé 'Death Note' qui lui permet de tuer toute personne en écrivant simplement son nom. Sa quête pour purifier le monde entraîne un jeu de chat et souris avec le mystérieux détective L."
  },
  {
    id: 5114,
    title: "Fullmetal Alchemist",
    description: "Après une expérience d'alchimie interdite qui tourne mal, les frères Edward et Alphonse Elric partent en quête de la légendaire Pierre Philosophale afin de restaurer leurs corps perdus. Leur voyage les confronte à des mystères sombres et des conflits moraux puissants."
  },
  {
    id: 31964,
    title: "My Hero Academia",
    description: "Dans un univers où presque tout le monde possède des super-pouvoirs appelés 'Alter', Izuku Midoriya naît sans aucun. Déterminé à devenir un héros, il intègre la prestigieuse U.A. High School et apprend ce que signifie vraiment le courage et l'amitié."
  },
  {
    id: 42249,
    title: "Tokyo Revengers",
    description: "Takemichi Hanagaki, un jeune homme ordinaire, découvre qu'il peut voyager dans le temps. Il décide de retourner dans son passé pour sauver son amour de jeunesse et changer le destin tragique de son entourage impliqué dans des gangs violents."
  }
];

// Function to remove duplicates (same title)
function removeDuplicates(animes) {
  const uniqueTitles = new Set();
  return animes.filter(anime => {
    if (uniqueTitles.has(anime.title)) {
      return false;
    }
    uniqueTitles.add(anime.title);
    return true;
  });
}

// Fonction de traduction améliorée avec gestion d'erreur et cache
const translationCache = {};

async function translateText(text, targetLang = 'fr') {
  // Si le texte est vide ou déjà en français (pour les descriptions populaires)
  if (!text || text.trim() === '') return text;
  
  // Vérifier si la traduction est déjà en cache
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  // Vérifier si c'est une description populaire (déjà en français)
  const popularAnimeMatch = popularAnimes.find(anime => 
    anime.description && text.startsWith(anime.description.substring(0, 50))
  );
  if (popularAnimeMatch) {
    return popularAnimeMatch.description;
  }

  try {
    const response = await fetch(translateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: 'text',
      }),
    });

    const data = await response.json();

    if (data.data && data.data.translations && data.data.translations.length > 0) {
      const translatedText = data.data.translations[0].translatedText;
      // Mettre en cache le résultat
      translationCache[cacheKey] = translatedText;
      return translatedText;
    }

    return text; // Retourne le texte original si la traduction échoue
  } catch (error) {
    console.error("Erreur de traduction :", error);
    return text; // Retourne le texte original en cas d'erreur
  }
}
async function displayAnimes(animes, targetElement = resultsDiv, isDefault = false) {
  targetElement.innerHTML = '';

  if (!animes || animes.length === 0) {
    targetElement.innerHTML = `
      <div class="alert alert-warning" role="alert">
        <i class="fas fa-exclamation-triangle"></i> Aucun résultat trouvé.
      </div>`;
    return;
  }

  const uniqueAnimes = removeDuplicates(animes);

  // Créer un fragment de document pour une meilleure performance
  const fragment = document.createDocumentFragment();

  for (const anime of uniqueAnimes) {
    const imgUrl = anime.images?.jpg?.large_image_url
                         || anime.images?.jpg?.image_url
                         || 'https://via.placeholder.com/300x400?text=Pas+d\'image';

    const trailerUrl = anime.trailer?.url;
    const trailerLink = trailerUrl
      ? `<a href="${trailerUrl}" target="_blank" rel="noopener" class="btn-trailer" aria-label="Voir la bande-annonce de ${anime.title}">
          <i class="fas fa-play"></i> Bande-annonce
         </a>`
      : '';

    // Traduire la synopsis si nécessaire
    let synopsis = anime.synopsis;
    if (synopsis) {
      synopsis = await translateText(synopsis, 'fr');
    } else {
      synopsis = 'Pas de description disponible.';
    }

    // Créer l'élément de carte
    const card = document.createElement('article');
    card.className = 'anime-card';
    card.tabIndex = 0;
    card.setAttribute('aria-label', `Anime ${anime.title}`);
    
    // Ajouter le contenu à la carte
    card.innerHTML = `
      <div class="card-image-container">
        <img src="${imgUrl}" alt="Image de ${anime.title}" class="anime-image" loading="lazy" />
      </div>
      <div class="card-body">
        <h2 class="card-title">${anime.title}</h2>
        <p class="card-text">${synopsis ? synopsis.substring(0, 180) + (synopsis.length > 180 ? '...' : '') : 'Pas de description disponible.'}</p>
        <div class="card-meta">
          <span class="episodes"><i class="fas fa-tv"></i> ${anime.episodes ?? 'Inconnu'}</span>
          <span class="score"><i class="fas fa-star"></i> ${anime.score ? anime.score.toFixed(1) : 'N/A'}</span>
        </div>
        ${!isDefault ? trailerLink : ''}
      </div>
    `;

    // Ajouter l'événement click sur toute la carte
    card.addEventListener('click', () => {
      window.location.href = `details.html?id=${anime.mal_id}`;
    });

    // Ajouter la carte au fragment
    fragment.appendChild(card);
  }

  // Ajouter le fragment au DOM en une seule opération
  targetElement.appendChild(fragment);
}

function showLoading(message = "Chargement des animes...", targetElement = resultsDiv) {
  targetElement.innerHTML = `
    <div class="loading-spinner" role="status" aria-live="polite" aria-label="${message}">
      <div class="spinner-border"></div>
    </div>`;
}

async function fetchAnimeById(id) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Erreur de recherche:", error);
    return null;
  }
}

async function fetchAnimes(query, limit = 10) {
  try {
    showLoading();

    // Attempt 1: Exact search with closest match (priority to popularity)
    const exactUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw&order_by=popularity`;
    const exactResponse = await fetch(exactUrl);

    if (exactResponse.ok) {
      const exactData = await exactResponse.json();
      if (exactData.data?.length > 0) {
        return exactData.data;
      }
    }

    // Attempt 2: Broader search with scoring
    const broadUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw&order_by=score&sort=desc`;
    const broadResponse = await fetch(broadUrl);

    if (broadResponse.ok) {
      const broadData = await broadResponse.json();
      if (broadData.data?.length > 0) {
        return broadData.data;
      }
    }

    // Attempt 3: Search by first letter as fallback
    const letterUrl = `https://api.jikan.moe/v4/anime?letter=${encodeURIComponent(query.charAt(0))}&limit=${limit}&sfw`;
    const letterResponse = await fetch(letterUrl);

    if (letterResponse.ok) {
      const letterData = await letterResponse.json();
      if (letterData.data?.length > 0) {
        return letterData.data;
      }
    }

    throw new Error("Aucun résultat trouvé pour cette recherche");

  } catch (error) {
    console.error("Erreur de recherche:", error);
    resultsDiv.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <i class="fas fa-exclamation-circle"></i> ${error.message}
      </div>`;
    return null;
  }
}

// Load default animes
async function loadDefaultAnimes() {
  showLoading("Chargement des animes populaires...", defaultAnimesDiv);

  // Select 3 random animes from the popular list
  const shuffled = [...popularAnimes].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  // Fetch complete data for each selected anime
  const animePromises = selected.map(anime => fetchAnimeById(anime.id));
  const animeResults = await Promise.all(animePromises);

  // Add French descriptions
  const completeAnimes = animeResults.map((anime, index) => {
    if (anime) {
      return {
        ...anime,
        synopsis: selected[index].description
      };
    }
    return null;
  }).filter(anime => anime !== null);

  displayAnimes(completeAnimes, defaultAnimesDiv, true);
}

// Search when the search button is clicked
btnSearch.addEventListener('click', async () => {
  const query = searchInput.value.trim();
  if (!query) {
    resultsDiv.innerHTML = `
      <div class="alert alert-warning" role="alert">
        <i class="fas fa-info-circle"></i> Veuillez saisir un terme de recherche.
      </div>`;
    return;
  }
  const limit = parseInt(resultCount.value, 10);
  const animes = await fetchAnimes(query, limit);
  displayAnimes(animes);
});

// Random search
btnRandom.addEventListener('click', async () => {
  const randomIndex = Math.floor(Math.random() * popularAnimes.length);
  const randomQuery = popularAnimes[randomIndex].title;
  searchInput.value = randomQuery;
  const limit = parseInt(resultCount.value, 10);
  const animes = await fetchAnimes(randomQuery, limit);
  displayAnimes(animes);
});

// Search when the number of results changes
resultCount.addEventListener('change', async () => {
  const query = searchInput.value.trim();
  if (query) {
    const limit = parseInt(resultCount.value, 10);
    const animes = await fetchAnimes(query, limit);
    displayAnimes(animes);
  }
});

// Search when Enter key is pressed
searchInput.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    btnSearch.click();
  }
});

// Load default animes and a random search on page load
window.addEventListener('load', () => {
  loadDefaultAnimes();

  // Trigger a random search after a short delay
  setTimeout(() => {
    btnRandom.click();
  }, 500);
});
