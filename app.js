// --- SUPABASE CLIENT INITIALIZATION ---
const SUPABASE_URL = "https://jihhwwjtzdxatbhelqiy.supabase.co";
const SUPABASE_KEY = "sb_publishable_nHW4cG5wcI9bMEj3gmUHrw_MPGdYnGK";
const supabaseClient = (typeof supabase !== "undefined") ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- DEFAULT / FALLBACK DATA ---
const DEFAULT_DATA = {
  about: {
    text1: "Youth for Environment is a global youth-led movement that began in Brazil with the mission of empowering young people to protect their local biomes while participating in environmental governance and climate action.",
    text2: "Through reforestation initiatives, awareness campaigns, and youth-led policy discussions, we connect local environmental challenges to the global climate crisis.",
    text3: "We believe the generation most affected by climate change must also help shape the decisions surrounding it. That’s why we work to ensure young people are not just future leaders, but active voices in protecting ecosystems, influencing environmental policy, and building a more sustainable future: starting within their own communities."
  },
  societies: {
    YFC: {
      name: "Youth for Cerrado",
      about: "Youth for Cerrado acts directly in the preservation of the most biodiverse savanna in the world. We focus on raising awareness about local water scarcity, wildfire prevention, and planting tree species native to the Cerrado biome.",
      achievements: "Over 10,000 seedlings planted, 5 workshops on water resources held in local schools in Goiânia, and active participation in state-level environmental policy discussions."
    },
    YFA: {
      name: "Youth for Amazon",
      about: "Youth for Amazon operates in the heart of the largest rainforest in the world, focusing on deforestation monitoring, forest restoration in degraded areas, and supporting sustainable community projects for indigenous peoples.",
      achievements: "Restoration of 15 hectares of degraded areas along rivers, establishing community seed networks, and international awareness campaigns about threats to the biome."
    },
    YFAR: {
      name: "Youth for Atlantic Rainforest",
      about: "Youth for Atlantic Rainforest works on recovering one of the most devastated and fragmented biomes in Brazil. Our focus is to connect urban and rural forest fragments by planting ecological corridors.",
      achievements: "Creation of 3 new ecological corridors in private partnerships, cataloging local fauna in recovered areas, and engaging more than 2,000 urban volunteers in our actions."
    }
  },
  events: [
    {
      title: "Global Youth Climate Online Meeting",
      description: "International discussion on the role of youth governance in climate policies before the next global climate conference.",
      date: "July 25, 2026",
      type: "Virtual",
      location: "Zoom"
    },
    {
      title: "Reforestation Drive - Clean Cerrado",
      description: "Collective planting action of native species in the Cerrado to restore areas degraded by wildfires.",
      date: "August 12, 2026",
      type: "In-Person",
      location: "Goiânia, GO"
    },
    {
      title: "Climate Advocacy Workshop",
      description: "Practical training for young people on how to influence decision-makers and create local ecological public policies.",
      date: "September 5, 2026",
      type: "Virtual",
      location: "Google Meet"
    }
  ],
  map: {
    activeRegions: {
      "BR-GO": { actions: 12, area: "Cerrado - Goiânia and surrounding area" }
    }
  }
};

// State management
let siteData = { ...DEFAULT_DATA };
let activeSociety = "YFC";
let activeTab = "about";

// --- DYNAMIC DATA FETCHERS (SUPABASE) ---
async function fetchSupabaseData() {
  if (!supabaseClient) return;

  // 1. Fetch Site Content (About texts & Join description)
  try {
    const { data: contentData, error: contentErr } = await supabaseClient.from("site_content").select("*");
    if (!contentErr && contentData && contentData.length > 0) {
      contentData.forEach(item => {
        if (item.key === "about_text1") siteData.about.text1 = item.value;
        if (item.key === "about_text2") siteData.about.text2 = item.value;
        if (item.key === "about_text3") siteData.about.text3 = item.value;
        if (item.key === "join_description") {
          const joinEl = document.getElementById("join-description");
          if (joinEl) joinEl.textContent = item.value;
        }
        if (item.key === "stat1_num") { const el = document.getElementById("stat1-num"); if (el) el.textContent = item.value; }
        if (item.key === "stat1_lbl") { const el = document.getElementById("stat1-lbl"); if (el) el.textContent = item.value; }
        if (item.key === "stat2_num") { const el = document.getElementById("stat2-num"); if (el) el.textContent = item.value; }
        if (item.key === "stat2_lbl") { const el = document.getElementById("stat2-lbl"); if (el) el.textContent = item.value; }
        if (item.key === "stat3_num") { const el = document.getElementById("stat3-num"); if (el) el.textContent = item.value; }
        if (item.key === "stat3_lbl") { const el = document.getElementById("stat3-lbl"); if (el) el.textContent = item.value; }
        if (item.key === "stat4_num") { const el = document.getElementById("stat4-num"); if (el) el.textContent = item.value; }
        if (item.key === "stat4_lbl") { const el = document.getElementById("stat4-lbl"); if (el) el.textContent = item.value; }
      });
      renderAboutUs();
    }
  } catch (err) {
    console.error("Error fetching site content:", err);
  }

  // 2. Fetch Societies from Supabase
  try {
    const { data: socData, error: socError } = await supabaseClient.from("societies").select("*");
    if (!socError && socData && socData.length > 0) {
      socData.forEach(item => {
        siteData.societies[item.id] = {
          name: item.name,
          about: item.description || "",
          achievements: item.achievements || ""
        };
      });
      renderSocieties();
    }
  } catch (err) {
    console.error("Error fetching societies from Supabase:", err);
  }

  // 3. Fetch Events from Supabase
  try {
    const { data: evData, error: evError } = await supabaseClient.from("events").select("*").order("created_at", { ascending: false });
    if (!evError && evData && evData.length > 0) {
      siteData.events = evData.map(ev => ({
        id: ev.id,
        title: ev.title,
        description: ev.description || "",
        date: ev.date,
        type: ev.tag || "Event",
        location: ev.location || ""
      }));
      renderEvents();
    }
  } catch (err) {
    console.error("Error fetching events from Supabase:", err);
  }

  // 4. Fetch Active Regions for the Map from Supabase
  try {
    const { data: regData, error: regErr } = await supabaseClient.from("active_regions").select("*");
    if (!regErr && regData && regData.length > 0) {
      siteData.map.activeRegions = {};
      regData.forEach(reg => {
        siteData.map.activeRegions[reg.id] = { actions: 1, area: reg.name || reg.id };
      });
      highlightActiveMapRegions();
    }
  } catch (err) {
    console.error("Error fetching active regions:", err);
  }
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
    
    if (typeof MAP_DATA !== "undefined") {
      worldRes = MAP_DATA.WORLD_MAP_SVG;
      brazilRes = MAP_DATA.BRAZIL_STATES_SVG;
    } else {
      const [wText, bText] = await Promise.all([
        fetch("world-map.svg").then(r => r.text()),
        fetch("brazil-states.svg").then(r => r.text())
      ]);
      worldRes = wText;
      brazilRes = bText;
    }

    mapContainer.innerHTML = "";

    const parser = new DOMParser();
    const worldDoc = parser.parseFromString(worldRes, "image/svg+xml");
    const worldSvg = worldDoc.querySelector("svg");
    worldSvg.setAttribute("class", "map-svg");
    worldSvg.setAttribute("id", "interactive-world-map");
    mapContainer.appendChild(worldSvg);

    const brazilDoc = parser.parseFromString(brazilRes, "image/svg+xml");
    const styleEl = brazilDoc.querySelector("style");
    if (styleEl) styleEl.remove();

    const originalBrPath = worldSvg.querySelector("#br");
    if (originalBrPath) {
      const bbox = originalBrPath.getBBox();
      const brGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      brGroup.setAttribute("id", "brazil-states-group");

      const states = brazilDoc.querySelectorAll(".state");
      states.forEach(state => {
        state.setAttribute("stroke", "#FFFFFF");
        state.setAttribute("stroke-width", "0.8");
        
        const stateId = `BR-${state.id}`;
        if (siteData.map.activeRegions && siteData.map.activeRegions[stateId]) {
          state.setAttribute("class", "state active-region");
        }
        brGroup.appendChild(state.cloneNode(true));
      });

      const scaleX = bbox.width / 353.845;
      const scaleY = bbox.height / 367.766;
      brGroup.setAttribute("transform", `translate(${bbox.x}, ${bbox.y}) scale(${scaleX}, ${scaleY})`);
      originalBrPath.parentNode.replaceChild(brGroup, originalBrPath);
    }

    highlightActiveMapRegions();
    setupMapInteractivity();

  } catch (error) {
    console.error("Error loading the interactive map:", error);
    const loading = document.getElementById("map-loading");
    if (loading) loading.textContent = "Error loading the map.";
  }
}

function highlightActiveMapRegions() {
  const mapContainer = document.getElementById("map-container");
  if (!mapContainer) return;

  const activeRegions = siteData.map.activeRegions || {};

  mapContainer.querySelectorAll(".map-svg path, .map-svg polygon, .map-svg .state, .map-svg g").forEach(el => {
    let id = el.id;
    if (!id) return;
    if (id.length === 2 && el.classList.contains("state")) {
      id = `BR-${id}`;
    }

    if (activeRegions[id] || activeRegions[el.id]) {
      el.classList.add("active-region");
    } else {
      el.classList.remove("active-region");
    }
  });
}

function setupMapInteractivity() {
  const tooltip = document.getElementById("map-tooltip");
  if (!tooltip) return;

  const elements = document.querySelectorAll(".map-svg .state, .map-svg path, .map-svg polygon");

  elements.forEach(el => {
    el.addEventListener("mouseenter", (e) => {
      let regionId = el.id ? (el.id.length === 2 && el.classList.contains("state") ? `BR-${el.id}` : el.id) : null;
      const regionData = siteData.map.activeRegions ? (siteData.map.activeRegions[regionId] || siteData.map.activeRegions[el.id]) : null;

      if (regionData) {
        tooltip.style.opacity = "1";
        tooltip.innerHTML = `
          <strong>${regionData.area || regionId || "Active Region"}</strong><br/>
          🌱 Youth for Environment Action Zone
        `;
      }
    });

    el.addEventListener("mousemove", (e) => {
      const mapContainer = document.getElementById("map-container");
      if (!mapContainer) return;
      const mapBox = mapContainer.getBoundingClientRect();
      const x = e.clientX - mapBox.left + 15;
      const y = e.clientY - mapBox.top + 15;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    });

    el.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });
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
        alert("Please enter a valid donation amount.");
        return;
      }
    }

    // PayPal integration simulation
    alert(`Redirecting to PayPal to complete your donation of $${finalAmount}... (Test Mode)`);
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
  const links = document.querySelectorAll(".nav-link, #header-donate-btn");

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
    alert(`Thank you for signing up, ${name}! We will get in touch with you shortly.`);
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
  
  // Render initial content
  renderAboutUs();
  renderSocieties();
  renderEvents();
  
  // Load interactive map
  loadInteractiveMap();

  // Fetch dynamic data from Supabase database
  fetchSupabaseData();
});
