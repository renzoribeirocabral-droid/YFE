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

  // 1. Fetch Societies from Supabase
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

  // 2. Fetch Events from Supabase
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

let mainMapInstance = null;

async function loadInteractiveMap() {
  const mapContainer = document.getElementById("map-container");
  if (!mapContainer) return;

  // Render Leaflet Map if L library is loaded
  if (typeof L !== 'undefined') {
    mapContainer.style.height = "500px";
    mapContainer.style.width = "100%";
    mapContainer.style.borderRadius = "20px";
    mapContainer.style.overflow = "hidden";
    mapContainer.style.position = "relative";
    mapContainer.style.zIndex = "1";

    if (!mainMapInstance) {
      mapContainer.innerHTML = "";
      mainMapInstance = L.map("map-container", {
        center: [-14.235, -51.925],
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mainMapInstance);
    }

    // Clear previous markers
    mainMapInstance.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mainMapInstance.removeLayer(layer);
      }
    });

    // Custom Green Leaf Pin Icon
    const greenPinIcon = L.divIcon({
      className: 'yfe-map-pin',
      html: `<div style="background: #2D6A4F; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">🌱</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    // Fetch locations from Supabase
    let locationsList = [];
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from("locations").select("*");
      if (!error && data) {
        locationsList = data;
      }
    }

    const validCoords = [];
    locationsList.forEach(loc => {
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        validCoords.push([lat, lng]);
        const marker = L.marker([lat, lng], { icon: greenPinIcon }).addTo(mainMapInstance);
        marker.bindPopup(`
          <div style="font-family: var(--font-sans); padding: 4px; color: #0F1D15; max-width: 220px;">
            <span style="font-size: 10px; font-weight: 800; color: #2D6A4F; text-transform: uppercase; letter-spacing: 1px;">${loc.biome || 'Location'}</span>
            <h4 style="margin: 4px 0 6px 0; font-family: var(--font-headings); font-size: 15px; font-weight: 700; color: #0F1D15;">${loc.name}</h4>
            <p style="margin: 0; font-size: 12px; color: #4A5D52; line-height: 1.4;">${loc.description || ''}</p>
          </div>
        `);
      }
    });

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      if (bounds.isValid()) {
        mainMapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
      }
    }
  }
}

function setupMapInteractivity() {
  const tooltip = document.getElementById("map-tooltip");
  const activeElements = document.querySelectorAll(".map-svg .active-region, .map-svg path, .map-svg polygon");

  activeElements.forEach(el => {
    // Only add interactive effects to regions marked as active
    const regionId = el.id ? (el.id.length === 2 ? `BR-${el.id}` : el.id) : null;
    const regionData = siteData.map.activeRegions[regionId];

    if (regionData) {
      el.classList.add("active-region");
      
      el.addEventListener("mouseenter", (e) => {
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
