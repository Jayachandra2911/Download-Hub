const SUPABASE_URL = "https://moejfbsshjwlqxocxmkb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZWpmYnNzaGp3bHF4b2N4bWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NzM4OTUsImV4cCI6MjA5NTI0OTg5NX0.wwWQiyKbi-V2i1S3GBkwdhSToDhZ1kis0l4BTdS2tsA";
const ADMIN_PASSWORD = "jaya@2911";
const FALLBACK_IMAGE = "https://placehold.co/300x180?text=No+Image";
const CATEGORIES = ["PDF", "ZIP", "APK", "Images", "Notes", "Software", "Other files"];

const state = {
  downloads: [],
  filtered: [],
  isAdmin: localStorage.getItem("downloadHubAdmin") === "true",
  realtimeChannel: null
};

const els = {
  cardsGrid: document.getElementById("cardsGrid"),
  loadingState: document.getElementById("loadingState"),
  emptyState: document.getElementById("emptyState"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  adminPanel: document.getElementById("adminPanel"),
  adminLogin: document.getElementById("adminLogin"),
  adminNavLink: document.getElementById("adminNavLink"),
  logoutButton: document.getElementById("logoutButton"),
  loginForm: document.getElementById("loginForm"),
  passwordInput: document.getElementById("passwordInput"),
  downloadForm: document.getElementById("downloadForm"),
  submitButton: document.getElementById("submitButton"),
  refreshButton: document.getElementById("refreshButton"),
  statusBanner: document.getElementById("statusBanner")
};

const supabaseConfigured = !SUPABASE_URL.includes("YOUR_PROJECT_ID") && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
const supabaseClient = supabaseConfigured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

function getGoogleDriveId(url) {
  if (!url) return "";
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/i,
    /drive\.google\.com\/open\?id=([^&]+)/i,
    /drive\.google\.com\/uc\?[^#]*id=([^&]+)/i,
    /[?&]id=([^&]+)/i
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return "";
}

function convertDownloadLink(url) {
  const fileId = getGoogleDriveId(url);
  return fileId ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}` : url;
}

function convertThumbnailLink(url) {
  const fileId = getGoogleDriveId(url);
  return fileId ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1000` : url;
}

function sanitize(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showStatus(message, type = "success") {
  els.statusBanner.textContent = message;
  els.statusBanner.className = `status-banner show ${type}`;
  window.clearTimeout(showStatus.timer);
  showStatus.timer = window.setTimeout(() => {
    els.statusBanner.className = "status-banner";
  }, 4200);
}

function setLoading(isLoading) {
  els.loadingState.classList.toggle("hidden", !isLoading);
}

function setAdminMode(isAdmin) {
  state.isAdmin = isAdmin;
  localStorage.setItem("downloadHubAdmin", String(isAdmin));
  els.logoutButton.classList.toggle("hidden", !isAdmin);
  renderRoute();
}

function renderRoute() {
  const isAdminRoute = window.location.hash === "#admin";
  els.adminLogin.classList.toggle("hidden", !isAdminRoute || state.isAdmin);
  els.adminPanel.classList.toggle("hidden", !isAdminRoute || !state.isAdmin);

  if (isAdminRoute && state.isAdmin) {
    els.adminPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  renderCards();
}

function updateCategoryFilter() {
  const usedCategories = new Set(state.downloads.map((item) => item.category).filter(Boolean));
  els.categoryFilter.innerHTML = '<option value="all">All categories</option>';
  CATEGORIES.forEach((category) => {
    if (usedCategories.has(category) || state.downloads.length === 0) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      els.categoryFilter.appendChild(option);
    }
  });
}

function applyFilters() {
  const searchTerm = els.searchInput.value.trim().toLowerCase();
  const selectedCategory = els.categoryFilter.value;

  state.filtered = state.downloads.filter((item) => {
    const haystack = `${item.name} ${item.category} ${item.description}`.toLowerCase();
    const matchesSearch = !searchTerm || haystack.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  renderCards();
}

function createNativeAdSlot(index) {
  const slot = document.createElement("div");
  slot.className = "native-ad-slot";
  slot.setAttribute("aria-label", "Advertisement");

  const frame = document.createElement("iframe");
  frame.className = "native-ad-frame";
  frame.title = "Advertisement";
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer-when-downgrade";
  frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups");
  frame.srcdoc = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { margin: 0; background: transparent; color: #9da8b8; font-family: system-ui, sans-serif; }
          #container-17fcfae12b288e2760c37dd3c08d066b { min-height: 140px; }
        </style>
      </head>
      <body>
        <div id="container-17fcfae12b288e2760c37dd3c08d066b"></div>
        <script async data-cfasync="false" src="https://pl29538097.effectivecpmnetwork.com/17fcfae12b288e2760c37dd3c08d066b/invoke.js"><\/script>
      </body>
    </html>
  `;
  slot.appendChild(frame);

  return slot;
}

function renderCards() {
  els.cardsGrid.innerHTML = "";
  els.emptyState.classList.toggle("hidden", state.filtered.length > 0 || !els.loadingState.classList.contains("hidden"));
  const showAdminActions = state.isAdmin && window.location.hash === "#admin";

  state.filtered.forEach((item, index) => {
    if (index > 0 && index % 6 === 0) {
      els.cardsGrid.appendChild(createNativeAdSlot(index / 6));
    }

    const card = document.createElement("article");
    card.className = "download-card";
    card.innerHTML = `
      <div class="thumb-wrap">
        <img src="${sanitize(convertThumbnailLink(item.thumbnail))}" alt="${sanitize(item.name)} thumbnail" loading="lazy">
        <span class="category-chip">${sanitize(item.category)}</span>
      </div>
      <div class="card-body">
        <h3>${sanitize(item.name)}</h3>
        <p>${sanitize(item.description)}</p>
        <div class="card-actions">
          <a class="download-link" href="${sanitize(convertDownloadLink(item.file_link))}" target="_blank" rel="noopener noreferrer" download>Download</a>
          ${showAdminActions ? `<button class="delete-button" type="button" data-id="${sanitize(item.id)}" aria-label="Delete ${sanitize(item.name)}">x</button>` : ""}
        </div>
      </div>
    `;

    const img = card.querySelector("img");
    img.addEventListener("error", () => {
      if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE;
    });

    els.cardsGrid.appendChild(card);
  });
}

async function loadDownloads() {
  setLoading(true);

  if (!supabaseClient) {
    state.downloads = [];
    state.filtered = [];
    setLoading(false);
    updateCategoryFilter();
    applyFilters();
    showStatus("Add your Supabase URL and anon key in script.js to load cloud downloads.", "error");
    return;
  }

  const { data, error } = await supabaseClient
    .from("downloads")
    .select("*")
    .order("id", { ascending: false });

  setLoading(false);
  console.log("Downloads:", data);
  console.log("Error:", error);

  if (error) {
    console.error(error);
    showStatus(`Could not load downloads: ${error.message}`, "error");
    return;
  }

  state.downloads = data ?? [];
  updateCategoryFilter();
  applyFilters();
}

const fetchDownloads = loadDownloads;

function validateForm(formData) {
  const payload = {
    name: formData.get("name")?.trim(),
    description: formData.get("description")?.trim(),
    category: formData.get("category")?.trim(),
    thumbnail: formData.get("thumbnail")?.trim(),
    file_link: formData.get("file_link")?.trim()
  };

  const missingField = Object.entries(payload).find(([, value]) => !value);
  if (missingField) {
    throw new Error("Please fill in every field.");
  }

  if (!CATEGORIES.includes(payload.category)) {
    throw new Error("Please choose a valid category.");
  }

  try {
    new URL(payload.thumbnail);
    new URL(payload.file_link);
  } catch {
    throw new Error("Thumbnail and download fields must be valid URLs.");
  }

  return payload;
}

async function addDownload(event) {
  event.preventDefault();

  if (!state.isAdmin) {
    showStatus("Please login as admin first.", "error");
    return;
  }

  if (!supabaseClient) {
    showStatus("Supabase is not configured yet.", "error");
    return;
  }

  let payload;
  try {
    payload = validateForm(new FormData(els.downloadForm));
  } catch (error) {
    showStatus(error.message, "error");
    return;
  }

  els.submitButton.disabled = true;
  els.submitButton.textContent = "Adding...";

  const { error } = await supabaseClient.rpc("admin_add_download", {
    admin_password: ADMIN_PASSWORD,
    p_name: payload.name,
    p_description: payload.description,
    p_category: payload.category,
    p_thumbnail: payload.thumbnail,
    p_file_link: payload.file_link
  });

  els.submitButton.disabled = false;
  els.submitButton.textContent = "Add file";

  if (error) {
    showStatus(`Upload failed: ${error.message}`, "error");
    return;
  }

  els.downloadForm.reset();
  showStatus("File uploaded successfully.");
  await fetchDownloads();
}

async function deleteDownload(id) {
  if (!state.isAdmin || !supabaseClient) return;
  const confirmed = window.confirm("Delete this file from Download Hub?");
  if (!confirmed) return;

  const { error } = await supabaseClient.rpc("admin_delete_download", {
    admin_password: ADMIN_PASSWORD,
    p_id: Number(id)
  });

  if (error) {
    showStatus(`Delete failed: ${error.message}`, "error");
    return;
  }

  showStatus("File deleted.");
  await fetchDownloads();
}

function setupRealtime() {
  if (!supabaseClient) return;
  state.realtimeChannel = supabaseClient
    .channel("downloads-live-sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "downloads" }, () => {
      loadDownloads();
    })
    .subscribe();
}

function bindEvents() {
  els.searchInput.addEventListener("input", applyFilters);
  els.categoryFilter.addEventListener("change", applyFilters);
  els.refreshButton.addEventListener("click", loadDownloads);
  els.downloadForm.addEventListener("submit", addDownload);
  els.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (els.passwordInput.value === ADMIN_PASSWORD) {
      els.passwordInput.value = "";
      setAdminMode(true);
      showStatus("Admin login successful.");
      window.location.hash = "#admin";
      return;
    }
    showStatus("Wrong admin password.", "error");
  });

  els.logoutButton.addEventListener("click", () => {
    setAdminMode(false);
    showStatus("Logged out.");
    window.location.hash = "#home";
  });

  els.cardsGrid.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-button");
    if (deleteButton) deleteDownload(deleteButton.dataset.id);
  });

  window.addEventListener("hashchange", renderRoute);
}

function init() {
  bindEvents();
  setAdminMode(state.isAdmin);
  loadDownloads();
  setupRealtime();
}

document.addEventListener("DOMContentLoaded", init);
