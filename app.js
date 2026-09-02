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
      location: "Zoom",
      link: "https://zoom.us"
    },
    {
      title: "Reforestation Drive - Clean Cerrado",
      description: "Collective planting action of native species in the Cerrado to restore areas degraded by wildfires.",
      date: "August 12, 2026",
      type: "In-Person",
      location: "Goiânia, GO",
      link: ""
    },
    {
      title: "Climate Advocacy Workshop",
      description: "Practical training for young people on how to influence decision-makers and create local ecological public policies.",
      date: "September 5, 2026",
      type: "Virtual",
      location: "Google Meet",
      link: "https://meet.google.com"
    }
  ],
  map: {
    activeRegions: {
      "BR-GO": { actions: 12, area: "Cerrado - Goiânia and surrounding area" }
    },
    customLocations: []
  }
};

// State management
let siteData = { ...DEFAULT_DATA };
let activeSociety = "YFC";
let activeTab = "about";

// --- DOM RENDERING FUNCTIONS ---

function renderAboutUs() {
  const container = document.getElementById("about-content");
  if (!container || !siteData.about) return;
  
  container.innerHTML = `
    <p>${siteData.about.text1}</p>
    <p>${siteData.about.text2}</p>
    <p>${siteData.about.text3}</p>
  `;
}

function renderSocieties() {
  if (!siteData.societies) return;
  const soc = siteData.societies[activeSociety];
  if (!soc) return;

  const aboutText = document.getElementById("society-about-text");
  const achievementsText = document.getElementById("society-achievements-text");

  if (aboutText) aboutText.textContent = soc.about;
  if (achievementsText) achievementsText.textContent = soc.achievements;
}

function renderEvents() {
  const grid = document.getElementById("events-grid");
  if (!grid || !siteData.events) return;

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
      ${event.link ? `
        <div style="border-top: 1px solid rgba(255,255,255,0.08); padding: 0.8rem 2.5rem; width: 100%; text-align: center;">
          <a href="${event.link}" target="_blank" class="btn btn-primary" style="padding: 0.4rem 1.2rem; font-size: 0.85rem; width: 100%; text-decoration: none;">Register / View Event ↗</a>
        </div>
      ` : ""}
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
      const [wText, bText] = await Promise.all([
        fetch("world-map.svg").then(r => r.text()),
        fetch("brazil-states.svg").then(r => r.text())
      ]);
      worldRes = wText;
      brazilRes = bText;
    }

    mapContainer.innerHTML = "";

    // Inject World Map SVG
    const parser = new DOMParser();
    const worldDoc = parser.parseFromString(worldRes, "image/svg+xml");
    const worldSvg = worldDoc.querySelector("svg");
    worldSvg.setAttribute("class", "map-svg");
    worldSvg.setAttribute("id", "interactive-world-map");
    mapContainer.appendChild(worldSvg);

    // Inject and align Brazil states
    const brazilDoc = parser.parseFromString(brazilRes, "image/svg+xml");
    const styleEl = brazilDoc.querySelector("style");
    if (styleEl) styleEl.remove();

    const brazilSvg = brazilDoc.querySelector("svg");
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
        if (siteData.map && siteData.map.activeRegions && siteData.map.activeRegions[stateId]) {
          state.setAttribute("class", "state active-region");
        }

        brGroup.appendChild(state.cloneNode(true));
      });

      const scaleX = bbox.width / 353.845;
      const scaleY = bbox.height / 367.766;
      brGroup.setAttribute("transform", `translate(${bbox.x}, ${bbox.y}) scale(${scaleX}, ${scaleY})`);
      originalBrPath.parentNode.replaceChild(brGroup, originalBrPath);
    }

    // Render Custom Map Location Pins
    renderMapPins(worldSvg);

    // Configure map interactivity (Tooltip / Hover)
    setupMapInteractivity();

  } catch (error) {
    console.error("Error loading the interactive map:", error);
    const loadingEl = document.getElementById("map-loading");
    if (loadingEl) loadingEl.textContent = "Error loading the interactive map. Please check your settings.";
  }
}

function renderMapPins(worldSvg) {
  if (!siteData || !siteData.map || !siteData.map.customLocations) return;

  const existingGroup = worldSvg.querySelector("#custom-pins-group");
  if (existingGroup) existingGroup.remove();

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("id", "custom-pins-group");

  const tooltip = document.getElementById("map-tooltip");

  siteData.map.customLocations.forEach(loc => {
    const viewBox = worldSvg.getAttribute("viewBox") ? worldSvg.getAttribute("viewBox").split(" ").map(Number) : [0, 0, 1010, 666];
    const vbWidth = viewBox[2] || 1010;
    const vbHeight = viewBox[3] || 666;

    const cx = (loc.xPct / 100) * vbWidth;
    const cy = (loc.yPct / 100) * vbHeight;

    const pin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    pin.setAttribute("cx", cx);
    pin.setAttribute("cy", cy);
    pin.setAttribute("r", "9");
    pin.setAttribute("fill", "#52B788");
    pin.setAttribute("stroke", "#FFFFFF");
    pin.setAttribute("stroke-width", "2.5");
    pin.style.cursor = "pointer";
    pin.style.filter = "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))";

    pin.addEventListener("mouseenter", () => {
      tooltip.style.opacity = "1";
      tooltip.innerHTML = `
        <strong>📍 ${loc.name}</strong><br/>
        🌱 Biome: ${loc.biome}<br/>
        🌍 Lat/Lng: ${loc.lat}, ${loc.lng}<br/>
        <span style="font-size: 0.8rem; opacity: 0.9;">${loc.description}</span>
      `;
    });

    pin.addEventListener("mousemove", (e) => {
      const mapBox = document.getElementById("map-container").getBoundingClientRect();
      const x = e.clientX - mapBox.left + 15;
      const y = e.clientY - mapBox.top + 15;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    });

    pin.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });

    group.appendChild(pin);
  });

  worldSvg.appendChild(group);
}

function setupMapInteractivity() {
  const tooltip = document.getElementById("map-tooltip");
  const activeElements = document.querySelectorAll(".map-svg .active-region, .map-svg path, .map-svg polygon");

  activeElements.forEach(el => {
    const regionId = el.id ? (el.id.length === 2 ? `BR-${el.id}` : el.id) : null;
    const regionData = siteData.map && siteData.map.activeRegions ? siteData.map.activeRegions[regionId] : null;

    if (regionData) {
      el.classList.add("active-region");
      
      el.addEventListener("mouseenter", () => {
        tooltip.style.opacity = "1";
        tooltip.innerHTML = `
          <strong>${el.getAttribute("id") || "Region"}</strong><br/>
          📍 Focus: ${regionData.area}<br/>
          🌱 Actions: ${regionData.actions}
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
        alert("Please enter a valid donation amount.");
        return;
      }
    }

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

  if (!burger || !menu) return;

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

  if (!modal || !openBtn || !closeBtn) return;

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
document.addEventListener("DOMContentLoaded", async () => {
  setupHeaderScroll();
  setupBurgerMenu();
  setupSocietiesNav();
  setupDonationSystem();
  setupModal();
  
  // Load dynamic data from cloud / LocalStorage fallback
  if (typeof DB !== "undefined") {
    siteData = await DB.loadData();
  }

  // Render content
  renderAboutUs();
  renderSocieties();
  renderEvents();
  
  // Load interactive map
  loadInteractiveMap();
});
