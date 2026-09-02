/* ==========================================================================
   YFE ADMIN PANEL CONTROLLER (admin.js)
   ========================================================================== */

let currentSiteData = null;
let selectedClickCoords = { lat: -16.6869, lng: -49.2648, xPct: 50, yPct: 50 };

// --- 1. AUTHENTICATION CONTROLLER ---

function checkAuthState() {
  const isAuth = sessionStorage.getItem("yfe_admin_authenticated");
  const authOverlay = document.getElementById("auth-overlay");
  const adminDashboard = document.getElementById("admin-dashboard");

  if (isAuth === "true") {
    authOverlay.style.display = "none";
    adminDashboard.style.display = "block";
    initAdminPanel();
  } else {
    authOverlay.style.display = "flex";
    adminDashboard.style.display = "none";
  }
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const passwordInput = document.getElementById("auth-password");
  const errorMsg = document.getElementById("auth-error");

  if (passwordInput.value === "renzo_lindo") {
    sessionStorage.setItem("yfe_admin_authenticated", "true");
    errorMsg.style.display = "none";
    checkAuthState();
    showToast("Acesso autorizado com sucesso!");
  } else {
    errorMsg.style.display = "block";
    passwordInput.value = "";
    passwordInput.focus();
  }
}

function handleLogout() {
  sessionStorage.removeItem("yfe_admin_authenticated");
  checkAuthState();
}

function showToast(message) {
  const toast = document.getElementById("toast-msg");
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// --- 2. INIT ADMIN DATA & VIEWS ---

async function initAdminPanel() {
  currentSiteData = await DB.loadData();

  // Load active society into form
  const societySelect = document.getElementById("select-society");
  loadSocietyForm(societySelect ? societySelect.value : "YFC");

  // Load events
  renderAdminEvents();

  // Load locations
  renderAdminLocations();

  // Render Admin Interactive Map
  loadAdminMap();
}

// --- 3. SOCIETIES & ACHIEVEMENTS MANAGER ---

function loadSocietyForm(societyKey) {
  if (!currentSiteData || !currentSiteData.societies) return;
  const soc = currentSiteData.societies[societyKey];
  if (!soc) return;

  document.getElementById("society-about").value = soc.about || "";
  document.getElementById("society-achievements").value = soc.achievements || "";
}

async function handleUpdateSociety(event) {
  event.preventDefault();
  const societyKey = document.getElementById("select-society").value;
  const about = document.getElementById("society-about").value;
  const achievements = document.getElementById("society-achievements").value;

  currentSiteData = await DB.updateSociety(societyKey, about, achievements);
  showToast("Sociedade atualizada com sucesso!");
}

// --- 4. EVENTS MANAGER ---

function renderAdminEvents() {
  const grid = document.getElementById("admin-events-grid");
  if (!grid || !currentSiteData) return;

  if (!currentSiteData.events || currentSiteData.events.length === 0) {
    grid.innerHTML = `<p style="color: rgba(255,255,255,0.5);">Nenhum evento cadastrado.</p>`;
    return;
  }

  grid.innerHTML = currentSiteData.events.map(evt => `
    <div class="admin-item-card">
      <div>
        <div style="font-weight: 700; color: var(--yfe-green-light); font-size: 0.8rem; text-transform: uppercase; margin-bottom: 0.5rem;">
          ${evt.date} • ${evt.type}
        </div>
        <h4 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; color: #FFF;">${evt.title}</h4>
        <p style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 0.8rem;">${evt.description}</p>
        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5);">📍 ${evt.location}</div>
        ${evt.link ? `<a href="${evt.link}" target="_blank" style="font-size: 0.85rem; color: var(--yfe-green-light); display: inline-block; margin-top: 0.5rem;">🔗 Link de Acesso</a>` : ""}
      </div>
      <div style="text-align: right; margin-top: 1rem;">
        <button onclick="handleDeleteEvent('${evt.id}')" class="admin-btn admin-btn-danger" style="padding: 0.4rem 1rem; font-size: 0.85rem;">🗑️ Excluir</button>
      </div>
    </div>
  `).join("");
}

async function handleCreateEvent(event) {
  event.preventDefault();
  const title = document.getElementById("evt-title").value;
  const date = document.getElementById("evt-date").value;
  const type = document.getElementById("evt-type").value;
  const location = document.getElementById("evt-location").value;
  const link = document.getElementById("evt-link").value;
  const description = document.getElementById("evt-desc").value;

  const newEvt = { title, date, type, location, link, description };
  currentSiteData = await DB.addEvent(newEvt);
  
  document.getElementById("event-form").reset();
  renderAdminEvents();
  showToast("Evento cadastrado com sucesso!");
}

async function handleDeleteEvent(eventId) {
  if (confirm("Tem certeza que deseja excluir este evento?")) {
    currentSiteData = await DB.deleteEvent(eventId);
    renderAdminEvents();
    showToast("Evento excluído com sucesso.");
  }
}

// --- 5. INTERACTIVE MAP MANAGER ---

async function loadAdminMap() {
  const mapContainer = document.getElementById("admin-map-container");
  if (!mapContainer) return;

  try {
    let worldRes;
    if (typeof MAP_DATA !== "undefined") {
      worldRes = MAP_DATA.WORLD_MAP_SVG;
    } else {
      worldRes = await fetch("world-map.svg").then(r => r.text());
    }

    mapContainer.innerHTML = "";

    const parser = new DOMParser();
    const worldDoc = parser.parseFromString(worldRes, "image/svg+xml");
    const worldSvg = worldDoc.querySelector("svg");
    worldSvg.setAttribute("class", "map-svg");
    worldSvg.setAttribute("id", "admin-interactive-world-map");
    worldSvg.style.width = "100%";
    worldSvg.style.height = "auto";

    mapContainer.appendChild(worldSvg);

    // Render Pin Markers for custom locations
    renderAdminMapPins(worldSvg);

    // Map Click Listener to capture Lat/Long coordinates
    worldSvg.addEventListener("click", (e) => {
      const rect = worldSvg.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;

      // Approximate Lat/Lng conversion for World SVG
      // X maps from -180 (0%) to +180 (100%)
      // Y maps from +85 (0%) to -60 (100%)
      const lng = (xPct / 100) * 360 - 180;
      const lat = 85 - (yPct / 100) * 145;

      selectedClickCoords = {
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        xPct: parseFloat(xPct.toFixed(2)),
        yPct: parseFloat(yPct.toFixed(2))
      };

      document.getElementById("loc-lat").value = selectedClickCoords.lat;
      document.getElementById("loc-lng").value = selectedClickCoords.lng;
      document.getElementById("form-location-header").textContent = `📍 Adicionar Local nas Coordenadas (${selectedClickCoords.lat}, ${selectedClickCoords.lng})`;
      
      // Draw temporary click pin
      drawTempPin(worldSvg, selectedClickCoords.xPct, selectedClickCoords.yPct);
      
      document.getElementById("loc-name").focus();
      showToast(`Coordenadas capturadas: Lat ${selectedClickCoords.lat}, Lng ${selectedClickCoords.lng}`);
    });

  } catch (err) {
    console.error("Error loading admin map:", err);
  }
}

function renderAdminMapPins(svgEl) {
  if (!currentSiteData || !currentSiteData.map || !currentSiteData.map.customLocations) return;

  // Remove existing pins
  const existingGroup = svgEl.querySelector("#custom-pins-group");
  if (existingGroup) existingGroup.remove();

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("id", "custom-pins-group");

  currentSiteData.map.customLocations.forEach(loc => {
    // Convert xPct/yPct to SVG viewBox coordinates (1010 x 666 default or calculated)
    const viewBox = svgEl.getAttribute("viewBox") ? svgEl.getAttribute("viewBox").split(" ").map(Number) : [0, 0, 1010, 666];
    const vbWidth = viewBox[2] || 1010;
    const vbHeight = viewBox[3] || 666;

    const cx = (loc.xPct / 100) * vbWidth;
    const cy = (loc.yPct / 100) * vbHeight;

    const pin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    pin.setAttribute("cx", cx);
    pin.setAttribute("cy", cy);
    pin.setAttribute("r", "8");
    pin.setAttribute("fill", "#52B788");
    pin.setAttribute("stroke", "#FFFFFF");
    pin.setAttribute("stroke-width", "2");
    pin.style.cursor = "pointer";

    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${loc.name} (${loc.biome})`;
    pin.appendChild(title);

    group.appendChild(pin);
  });

  svgEl.appendChild(group);
}

function drawTempPin(svgEl, xPct, yPct) {
  const viewBox = svgEl.getAttribute("viewBox") ? svgEl.getAttribute("viewBox").split(" ").map(Number) : [0, 0, 1010, 666];
  const vbWidth = viewBox[2] || 1010;
  const vbHeight = viewBox[3] || 666;

  const cx = (xPct / 100) * vbWidth;
  const cy = (yPct / 100) * vbHeight;

  let tempPin = svgEl.querySelector("#temp-click-pin");
  if (!tempPin) {
    tempPin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    tempPin.setAttribute("id", "temp-click-pin");
    tempPin.setAttribute("r", "10");
    tempPin.setAttribute("fill", "#FF6B6B");
    tempPin.setAttribute("stroke", "#FFFFFF");
    tempPin.setAttribute("stroke-width", "3");
    svgEl.appendChild(tempPin);
  }

  tempPin.setAttribute("cx", cx);
  tempPin.setAttribute("cy", cy);
}

function renderAdminLocations() {
  const tbody = document.getElementById("locations-table-body");
  if (!tbody || !currentSiteData) return;

  const locations = currentSiteData.map && currentSiteData.map.customLocations ? currentSiteData.map.customLocations : [];

  if (locations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: rgba(255,255,255,0.5);">Nenhum local cadastrado. Clique no mapa para adicionar.</td></tr>`;
    return;
  }

  tbody.innerHTML = locations.map(loc => `
    <tr>
      <td style="font-weight: 700; color: #FFF;">📍 ${loc.name}</td>
      <td><span class="event-tag" style="font-size: 0.75rem;">${loc.biome}</span></td>
      <td style="font-family: monospace; font-size: 0.85rem; color: rgba(255,255,255,0.7);">${loc.lat}, ${loc.lng}</td>
      <td style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">${loc.description}</td>
      <td>
        <button onclick="handleDeleteLocation('${loc.id}')" class="admin-btn admin-btn-danger" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">🗑️ Excluir</button>
      </td>
    </tr>
  `).join("");
}

async function handleSaveLocation(event) {
  event.preventDefault();
  const name = document.getElementById("loc-name").value;
  const biome = document.getElementById("loc-biome").value;
  const lat = parseFloat(document.getElementById("loc-lat").value);
  const lng = parseFloat(document.getElementById("loc-lng").value);
  const description = document.getElementById("loc-desc").value;

  const locationObj = {
    name,
    biome,
    lat,
    lng,
    xPct: selectedClickCoords.xPct,
    yPct: selectedClickCoords.yPct,
    description
  };

  currentSiteData = await DB.addMapLocation(locationObj);
  document.getElementById("map-location-form").reset();
  document.getElementById("form-location-header").textContent = "Adicionar Novo Local no Mapa";
  
  renderAdminLocations();
  loadAdminMap();
  showToast("Local cadastrado e salvo com sucesso!");
}

async function handleDeleteLocation(locationId) {
  if (confirm("Tem certeza que deseja remover este local do mapa?")) {
    currentSiteData = await DB.deleteMapLocation(locationId);
    renderAdminLocations();
    loadAdminMap();
    showToast("Local removido do mapa.");
  }
}

// Check authentication status on DOM load
document.addEventListener("DOMContentLoaded", () => {
  checkAuthState();
});
