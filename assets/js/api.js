

const API_BASE = window.ENV ? window.ENV.API_BASE : "https://wajik-anime-api-nine.vercel.app/otakudesu";
async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`[API] Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}
function createAnimeCard(anime, badgeType, colClass = "col-4 col-md-4 col-lg-4") {
  const statusBadge =
    badgeType === "ongoing"
      ? `<li class="badge bg-danger rounded-pill py-2 anime-badge-status">Ongoing</li>`
      : `<li class="badge bg-success rounded-pill py-2 anime-badge-status">Completed</li>`;

  const epBadge =
    badgeType === "ongoing"
      ? anime.episodes + " Eps"
      : anime.episodes + " Eps";

  return `
    <div class="${colClass}">
      <div class="product_item anime-product-item">
        <a href="watch.html?id=${anime.animeId}" class="text-decoration-none">
          <div class="position-relative rounded product_item_pic set-bg anime-product-item-pic"
            style="height: 200px; background-size: cover; background-position: center; background-image: url('${anime.poster}');">
            <div class="ep position-absolute top-0 start-0 m-2 bg-danger text-white px-2 py-1 rounded anime-product-ep-badge">
              ${epBadge}</div>
          </div>
          <div class="product_item_text anime-product-item-text">
            <ul class="list-unstyled d-flex gap-2 mt-3 mb-2 anime-product-badges">
              ${statusBadge}
            </ul>
            <h3 class="h5 mb-5 anime-product-title">
              <span class="text-white text-decoration-none fw-bold anime-product-link">${anime.title}</span>
            </h3>
          </div>
        </a>
      </div>
    </div>`;
}
function createSidebarItem(anime) {
  return `
    <div class="product_sidebar_newrelease_item d-flex gap-3 mb-4 anime-sidebar-item">
      <a href="watch.html?id=${anime.animeId}" class="d-flex gap-3 text-decoration-none">
        <div class="product_sidebar_newrelease_item_pic flex-shrink-0 rounded position-float set-bg anime-sidebar-item-pic"
          style="width: 90px; height: 130px; background-size: cover; background-position: center; background-image: url('${anime.poster}');">
        </div>
        <div class="product_sidebar_newrelease_item_text py-1 anime-sidebar-item-text">
          <ul class="list-unstyled d-flex gap-2 mb-2 anime-product-badges">
            <li class="badge bg-secondary rounded-pill py-2 anime-badge-status">
              ${anime.releaseDay || anime.lastReleaseDate || "New"}
            </li>
          </ul>
          <h3 class="h5 anime-sidebar-title">
            <span class="text-white text-decoration-none fw-bold anime-sidebar-link">${anime.title}</span>
          </h3>
          <p class="anime-sidebar-ep mb-0 text-secondary">Episode: ${anime.episodes}</p>
        </div>
      </a>
    </div>`;
}
function showLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5 w-100">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>`;
}
function showError(container, message) {
  container.innerHTML = `
    <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>${message}</span>
    </div>`;
}
