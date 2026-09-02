/* ==========================================================================
   YFE DATABASE LAYER (Supabase Cloud + LocalStorage Fallback)
   ========================================================================== */

// Configurable Supabase credentials (Users can add their Supabase URL & Anon Key here)
const SUPABASE_CONFIG = {
  url: "",      // e.g. "https://xyzcompany.supabase.co"
  anonKey: ""   // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};

// Initial default data fallback
const DEFAULT_SITE_DATA = {
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
      id: "event-1",
      title: "Global Youth Climate Online Meeting",
      description: "International discussion on the role of youth governance in climate policies before the next global climate conference.",
      date: "July 25, 2026",
      type: "Virtual",
      location: "Zoom",
      link: "https://zoom.us"
    },
    {
      id: "event-2",
      title: "Reforestation Drive - Clean Cerrado",
      description: "Collective planting action of native species in the Cerrado to restore areas degraded by wildfires.",
      date: "August 12, 2026",
      type: "In-Person",
      location: "Goiânia, GO",
      link: ""
    },
    {
      id: "event-3",
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
    customLocations: [
      {
        id: "loc-1",
        name: "Goiânia Central Action Base",
        biome: "Cerrado",
        description: "Headquarters for seed collection and seedling nurseries in Central Brazil.",
        lat: -16.6869,
        lng: -49.2648,
        xPct: 54.8,
        yPct: 62.5
      }
    ]
  }
};

let supabaseClient = null;

// Initialize Supabase if credentials are provided
if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && window.supabase) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  } catch (e) {
    console.warn("Supabase init failed, falling back to LocalStorage:", e);
  }
}

const DB = {
  // Load full site data from Cloud or LocalStorage or Default
  async loadData() {
    // 1. Try Supabase cloud if connected
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from("site_data")
          .select("*")
          .single();
        if (!error && data && data.payload) {
          localStorage.setItem("yfe_site_data", JSON.stringify(data.payload));
          return data.payload;
        }
      } catch (err) {
        console.warn("Error fetching from Supabase, using local cache:", err);
      }
    }

    // 2. Try LocalStorage
    const stored = localStorage.getItem("yfe_site_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.map) parsed.map = DEFAULT_SITE_DATA.map;
        if (!parsed.map.customLocations) parsed.map.customLocations = DEFAULT_SITE_DATA.map.customLocations;
        return parsed;
      } catch (e) {
        console.error("Error parsing stored data:", e);
      }
    }

    // 3. Fallback to default site data
    localStorage.setItem("yfe_site_data", JSON.stringify(DEFAULT_SITE_DATA));
    return DEFAULT_SITE_DATA;
  },

  // Save complete site data to Cloud and LocalStorage
  async saveData(data) {
    localStorage.setItem("yfe_site_data", JSON.stringify(data));

    if (supabaseClient) {
      try {
        await supabaseClient
          .from("site_data")
          .upsert({ id: 1, payload: data, updated_at: new Date().toISOString() });
      } catch (err) {
        console.error("Error saving to Supabase:", err);
      }
    }
    return data;
  },

  // Update a specific society (about & achievements)
  async updateSociety(societyKey, about, achievements) {
    const data = await this.loadData();
    if (!data.societies[societyKey]) return;
    
    data.societies[societyKey].about = about;
    data.societies[societyKey].achievements = achievements;
    await this.saveData(data);
    return data;
  },

  // Add a new event
  async addEvent(eventObj) {
    const data = await this.loadData();
    if (!data.events) data.events = [];
    eventObj.id = "event-" + Date.now();
    data.events.unshift(eventObj);
    await this.saveData(data);
    return data;
  },

  // Delete an event
  async deleteEvent(eventId) {
    const data = await this.loadData();
    if (data.events) {
      data.events = data.events.filter(e => e.id !== eventId);
      await this.saveData(data);
    }
    return data;
  },

  // Add a map location
  async addMapLocation(locationObj) {
    const data = await this.loadData();
    if (!data.map) data.map = { activeRegions: {}, customLocations: [] };
    if (!data.map.customLocations) data.map.customLocations = [];
    
    locationObj.id = "loc-" + Date.now();
    data.map.customLocations.push(locationObj);
    await this.saveData(data);
    return data;
  },

  // Delete a map location
  async deleteMapLocation(locationId) {
    const data = await this.loadData();
    if (data.map && data.map.customLocations) {
      data.map.customLocations = data.map.customLocations.filter(l => l.id !== locationId);
      await this.saveData(data);
    }
    return data;
  }
};

window.DB = DB;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
