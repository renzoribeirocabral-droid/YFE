// --- DEFAULT / FALLBACK DATA (Based on outline) ---
const DEFAULT_DATA = {
  about: {
    text1: "Youth for the Environment is a global youth-led movement that began in Brazil with the mission of empowering young people to protect their local biomes while participating in environmental governance and climate action.",
    text2: "Through reforestation initiatives, awareness campaigns, and youth-led policy discussions, we connect local environmental challenges to the global climate crisis.",
    text3: "We believe the generation most affected by climate change must also help shape the decisions surrounding it. That’s why we work to ensure young people are not just future leaders, but active voices in protecting ecosystems, influencing environmental policy, and building a more sustainable future: starting within their own communities."
  },
  societies: {
    YFC: {
      name: "Youth for Cerrado",
      about: "A Youth for Cerrado atua diretamente na preservação da savana mais rica em biodiversidade do mundo. Focamos na conscientização da escassez de água local, contenção de queimadas e plantio de espécies nativas arbóreas do bioma Cerrado.",
      achievements: "Mais de 10.000 mudas plantadas, 5 workshops sobre recursos hídricos realizados em escolas locais de Goiânia, e participação ativa em discussões estaduais de políticas ambientais."
    },
    YFA: {
      name: "Youth for Amazon",
      about: "A Youth for Amazon atua no coração da maior floresta tropical do mundo, focando no monitoramento do desmatamento, restauração florestal em áreas degradadas e apoio a projetos comunitários sustentáveis de povos nativos.",
      achievements: "Restauração de 15 hectares de áreas degradadas ao longo de rios, estabelecimento de redes de sementes comunitárias, e campanhas internacionais de conscientização sobre as ameaças ao bioma."
    },
    YFAR: {
      name: "Youth for Atlantic Rainforest",
      about: "A Youth for Atlantic Rainforest atua na recuperação de um dos biomas mais devastados e fragmentados do Brasil. Nosso foco é conectar fragmentos florestais urbanos e rurais através do plantio de corredores ecológicos.",
      achievements: "Criação de 3 novos corredores ecológicos em parcerias privadas, catalogação de fauna local em áreas recuperadas, e engajamento de mais de 2.000 voluntários urbanos nas ações."
    }
  },
  events: [
    {
      title: "Encontro Global Online de Jovens pelo Clima",
      description: "Discussão internacional sobre o papel da governança jovem nas políticas de clima antes da próxima conferência global do clima.",
      date: "25 de Julho, 2026",
      type: "Virtual",
      location: "Zoom"
    },
    {
      title: "Mutirão de Reflorestamento - Cerrado Limpo",
      description: "Ação de plantio coletivo de espécies nativas no Cerrado para recuperar áreas degradadas por queimadas.",
      date: "12 de Agosto, 2026",
      type: "Presencial",
      location: "Goiânia, GO"
    },
    {
      title: "Workshop de Advocacia Climática",
      description: "Capacitação prática para jovens sobre como influenciar tomadores de decisão e criar políticas públicas ecológicas locais.",
      date: "05 de Setembro, 2026",
      type: "Virtual",
      location: "Google Meet"
    }
  ],
  map: {
    activeRegions: {
      "BR-GO": { actions: 12, area: "Cerrado - Goiânia e Entorno" }
    }
  }
};

// State management
let siteData = { ...DEFAULT_DATA };
let activeSociety = "YFC";
let activeTab = "about";

// --- DYNAMIC LOADING SYSTEM ---
async function fetchDriveData() {
  try {
    // Tenta carregar os dados locais gerados pelo script de sincronização do Drive.
    // Como os arquivos são gerados dinamicamente na pasta content/drive-cache/,
    // tentamos buscar e fazer o merge para atualizar o site em tempo real.
    
    const responses = await Promise.allSettled([
      fetch("content/drive-cache/YFE/about-text.json").then(r => r.json()),
      fetch("content/drive-cache/YFE/societies.json").then(r => r.json()),
      fetch("content/drive-cache/YFE/events.json").then(r => r.json()),
      fetch("content/drive-cache/YFE/map-data.json").then(r => r.json())
    ]);

    if (responses[0].status === "fulfilled") siteData.about = responses[0].value;
    if (responses[1].status === "fulfilled") siteData.societies = responses[1].value;
    if (responses[2].status === "fulfilled") siteData.events = responses[2].value;
    if (responses[3].status === "fulfilled") siteData.map = responses[3].value;

    console.log("Dados do Google Drive carregados com sucesso!");
  } catch (error) {
    console.warn("Google Drive não sincronizado ainda ou arquivos em branco. Usando dados padrão da Youth for the Environment.", error);
  }
  
  // Atualiza as seções após o carregamento
  renderAboutUs();
  renderSocieties();
  renderEvents();
}

// --- DOM RENDERING FUNCTIONS ---

function renderAboutUs() {
  const container = document.getElementById("about-content");
  if (!container) return;
  
  container.innerHTML = `
    <p>${siteData.about.text1}</p>
    <p>${siteData.about.text2}</p>
    <p>${siteData.about.text3}</p>
  `;
}

function renderSocieties() {
  const soc = siteData.societies[activeSociety];
  if (!soc) return;

  const aboutText = document.getElementById("society-about-text");
  const achievementsText = document.getElementById("society-achievements-text");

  if (aboutText) aboutText.textContent = soc.about;
  if (achievementsText) achievementsText.textContent = soc.achievements;
}

function renderEvents() {
  const grid = document.getElementById("events-grid");
  if (!grid) return;

  grid.innerHTML = siteData.events.map(event => `
    <div class="glass-card event-card">
      <div>
        <div class="event-date">${event.date}</div>
        <h3 class="event-title">${event.title}</h3>
        <p class="event-description">${event.description}</p>
      </div>
      <div class="event-footer">
        <span>📍 ${event.location}</span>
        <span class="event-tag">${event.type}</span>
      </div>
    </div>
  `).join("");
}

// --- TAB & SOCIETY CONTROLLERS ---

function setupSocietiesNav() {
  const buttons = document.querySelectorAll(".society-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeSociety = btn.getAttribute("data-society");
      renderSocieties();
    });
  });

  const tabLinks = document.querySelectorAll(".tab-link");
  tabLinks.forEach(link => {
    link.addEventListener("click", () => {
      tabLinks.forEach(t => t.classList.remove("active"));
      link.classList.add("active");
      
      const tab = link.getAttribute("data-tab");
      document.querySelectorAll(".tab-pane").forEach(pane => {
        pane.classList.remove("active");
      });
      document.getElementById(`pane-${tab}`).classList.add("active");
      activeTab = tab;
      renderSocieties();
    });
  });
}

// --- SVG MAP INTEGRATION & ALIGNMENT ---

async function loadInteractiveMap() {
  const mapContainer = document.getElementById("map-container");
  if (!mapContainer) return;

  try {
    let worldRes, brazilRes;
    
    // Check if map data is pre-loaded to prevent CORS issues (e.g. running via file://)
    if (typeof MAP_DATA !== "undefined") {
      worldRes = MAP_DATA.WORLD_MAP_SVG;
      brazilRes = MAP_DATA.BRAZIL_STATES_SVG;
    } else {
      // Fallback to fetch if MAP_DATA is not defined
      const [wText, bText] = await Promise.all([
        fetch("world-map.svg").then(r => r.text()),
        fetch("brazil-states.svg").then(r => r.text())
      ]);
      worldRes = wText;
      brazilRes = bText;
    }

    // Limpa o container
    mapContainer.innerHTML = "";

    // 2. Injeta o mapa do mundo
    const parser = new DOMParser();
    const worldDoc = parser.parseFromString(worldRes, "image/svg+xml");
    const worldSvg = worldDoc.querySelector("svg");
    worldSvg.setAttribute("class", "map-svg");
    worldSvg.setAttribute("id", "interactive-world-map");
    mapContainer.appendChild(worldSvg);

    // 3. Injeta e alinha os estados do Brasil
    const brazilDoc = parser.parseFromString(brazilRes, "image/svg+xml");
    const brazilSvg = brazilDoc.querySelector("svg");
    
    // Pega o caminho original do Brasil no mapa mundi
    const originalBrPath = worldSvg.querySelector("#br");
    if (!originalBrPath) {
      console.error("Path com id 'br' não encontrado no mapa mundi.");
      return;
    }

    // Calcula o bounding box original do Brasil no mapa mundi
    // Nota: Como o SVG foi adicionado ao DOM, getBBox funciona perfeitamente
    const bbox = originalBrPath.getBBox();

    // Cria um grupo para os estados do Brasil
    const brGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    brGroup.setAttribute("id", "brazil-states-group");

    // Move os caminhos (estados) do SVG do Brasil para o novo grupo
    const states = brazilDoc.querySelectorAll(".state");
    states.forEach(state => {
      // Adiciona classe e borda
      state.setAttribute("stroke", "#B5BFB9");
      state.setAttribute("stroke-width", "0.5");
      
      // Verifica se o estado é ativo para destacar
      const stateId = `BR-${state.id}`;
      if (siteData.map.activeRegions[stateId]) {
        state.setAttribute("class", "state active-region");
      }

      brGroup.appendChild(state.cloneNode(true));
    });

    // Alinha os estados do Brasil com a escala e tradução exatas do path original
    // A viewBox do mapa do Brasil é "0 0 353.845 367.766"
    const scaleX = bbox.width / 353.845;
    const scaleY = bbox.height / 367.766;
    brGroup.setAttribute("transform", `translate(${bbox.x}, ${bbox.y}) scale(${scaleX}, ${scaleY})`);

    // Substitui o path original do Brasil pelo grupo de estados
    originalBrPath.parentNode.replaceChild(brGroup, originalBrPath);

    // 4. Configura interatividade do mapa (Tooltip / Hover)
    setupMapInteractivity();

  } catch (error) {
    console.error("Erro ao carregar o mapa interativo:", error);
    document.getElementById("map-loading").textContent = "Erro ao carregar o mapa interativo. Verifique as configurações.";
  }
}

function setupMapInteractivity() {
  const tooltip = document.getElementById("map-tooltip");
  const activeElements = document.querySelectorAll(".map-svg .active-region, .map-svg path, .map-svg polygon");

  activeElements.forEach(el => {
    // Só adiciona efeito interativo nos estados demarcados como ativos ou em países que queiramos
    const regionId = el.id ? (el.id.length === 2 ? `BR-${el.id}` : el.id) : null;
    const regionData = siteData.map.activeRegions[regionId];

    if (regionData) {
      el.classList.add("active-region");
      
      el.addEventListener("mouseenter", (e) => {
        tooltip.style.opacity = "1";
        tooltip.innerHTML = `
          <strong>${el.getAttribute("id") || "Região"}</strong><br/>
          📍 Foco: ${regionData.area}<br/>
          🌱 Ações: ${regionData.actions}
        `;
      });

      el.addEventListener("mousemove", (e) => {
        const mapBox = document.getElementById("map-container").getBoundingClientRect();
        const x = e.clientX - mapBox.left + 15;
        const y = e.clientY - mapBox.top + 15;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      });

      el.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
      });
    }
  });
}

// --- DONATION SYSTEM ---

function setupDonationSystem() {
  const presetButtons = document.querySelectorAll(".donation-option");
  const customWrapper = document.getElementById("custom-donation-wrapper");
  const customInput = document.getElementById("custom-amount-input");
  const paypalBtn = document.getElementById("btn-donate-paypal");
  
  let selectedAmount = "3";

  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      presetButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const val = btn.getAttribute("data-amount");
      selectedAmount = val;

      if (val === "custom") {
        customWrapper.style.display = "block";
        customInput.focus();
      } else {
        customWrapper.style.display = "none";
      }
    });
  });

  paypalBtn.addEventListener("click", () => {
    let finalAmount = selectedAmount;
    if (selectedAmount === "custom") {
      finalAmount = customInput.value;
      if (!finalAmount || finalAmount <= 0) {
        alert("Por favor, insira um valor válido para doação.");
        return;
      }
    }

    // PayPal integration simulation
    alert(`Redirecionando para o PayPal para realizar a doação de $${finalAmount}... (Modo de teste)`);
    window.open(`https://www.paypal.com/donate/?business=renzoribeirocabral@gmail.com&amount=${finalAmount}&currency_code=USD`, "_blank");
  });
}

// --- GENERAL INTERFACE CONTROLLER ---

function setupHeaderScroll() {
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

function setupBurgerMenu() {
  const burger = document.getElementById("burger-menu");
  const menu = document.getElementById("nav-menu");
  const links = document.querySelectorAll(".nav-link");

  burger.addEventListener("click", () => {
    menu.classList.toggle("open");
    burger.classList.toggle("toggle");
  });

  links.forEach(l => {
    l.addEventListener("click", () => {
      menu.classList.remove("open");
      burger.classList.remove("toggle");
    });
  });
}

function setupModal() {
  const modal = document.getElementById("form-modal");
  const openBtn = document.getElementById("btn-open-form");
  const closeBtn = document.getElementById("btn-close-modal");
  const form = document.getElementById("signup-form");

  openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("form-name").value;
    alert(`Obrigado pela inscrição, ${name}! Nós entraremos em contato em breve.`);
    modal.style.display = "none";
    form.reset();
  });
}

// --- INIT APP ---
document.addEventListener("DOMContentLoaded", () => {
  setupHeaderScroll();
  setupBurgerMenu();
  setupSocietiesNav();
  setupDonationSystem();
  setupModal();
  
  // Carrega os dados assincronamente
  fetchDriveData();
  
  // Carrega o mapa interativo
  loadInteractiveMap();
});
