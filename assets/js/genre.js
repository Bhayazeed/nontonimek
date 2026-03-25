

document.addEventListener("DOMContentLoaded", async () => {
  const genreId = getParam("genreId");
  const page = getParam("page") || "1";

  if (genreId) {

    await loadAnimeByGenre(genreId, page);
  } else {

    await loadAllGenres();
  }

  const searchForm = document.getElementById("form-pencarian");
  const searchInput = document.getElementById("input-pencarian");

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
      }
    });
  }
});
async function loadAllGenres() {
  const genreContainer = document.getElementById("genre-list-container");
  const sectionTitle = document.getElementById("genre-section-title");

  if (!genreContainer) return;

  if (sectionTitle) sectionTitle.textContent = "GENRE";
  showLoading(genreContainer);

  try {
    const result = await fetchAPI("/genre");
    const genres = result.data?.genreList || [];

    if (genres.length > 0) {

      const colors = [
        "bg-danger",
      ];

      genreContainer.innerHTML = genres
        .map(
          (genre, i) => `
          <div class="col-5 col-md-4 col-lg-3 mt-4 mb-4">
            <a href="genre.html?genreId=${genre.genreId}" class="text-decoration-none text-white">
              <div class="card ${colors[i % colors.length]} border-0 shadow-sm" style="transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <div class="card-body text-center p-3">
                  <h5 class="mt-1 mb-0 text-white fw-bold">${genre.title}</h5>
                </div>
              </div>
            </a>
          </div>`
        )
        .join("");
    } else {
      genreContainer.innerHTML = `<p class="text-secondary text-center">Tidak ada genre ditemukan.</p>`;
    }
  } catch (error) {
    showError(
      genreContainer,
      "Gagal memuat genre. Pastikan API server berjalan di localhost:3001"
    );
  }
}
async function loadAnimeByGenre(genreId, page) {
  const genreContainer = document.getElementById("genre-list-container");
  const sectionTitle = document.getElementById("genre-section-title");
  const paginationContainer = document.getElementById("genre-pagination");

  if (!genreContainer) return;

  if (sectionTitle)
    sectionTitle.textContent = `Genre: ${genreId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`;

  showLoading(genreContainer);

  try {
    const result = await fetchAPI(`/genre/${genreId}?page=${page}`);
    const animes = result.data?.animeList || [];
    const pagination = result.pagination;

    if (animes.length > 0) {
      genreContainer.innerHTML = animes
        .map(
          (anime) => `
          <div class="col-6 col-md-4 col-lg-3 mt-4">
            <div class="product_item anime-product-item">
              <a href="watch.html?id=${anime.animeId}" class="text-decoration-none">
                <div class="position-relative rounded product_item_pic set-bg anime-product-item-pic"
                  style="height: 250px; background-size: cover; background-position: center; background-image: url('${anime.poster}');">
                  <div class="ep position-absolute top-0 start-0 m-2 bg-warning text-dark px-2 py-1 rounded anime-product-ep-badge shadow-sm" style="font-size: 0.8rem;">
                    <i class="bi bi-star-fill me-1"></i>${anime.score || "-"}
                  </div>
                </div>
                <div class="product_item_text anime-product-item-text">
                  <ul class="list-unstyled d-flex gap-2 mt-3 mb-2 anime-product-badges">
                    <li class="badge bg-danger rounded-pill py-2 anime-badge-status">${anime.episodes || "?"} Eps</li>
                  </ul>
                  <h3 class="h5 mb-4 anime-product-title">
                    <span class="text-white text-decoration-none fw-bold anime-product-link">${anime.title}</span>
                  </h3>
                </div>
              </a>
            </div>
          </div>`
        )
        .join("");
    } else {
      genreContainer.innerHTML = `<p class="text-secondary text-center">Tidak ada anime ditemukan untuk genre ini.</p>`;
    }

    if (paginationContainer && pagination) {
      renderPagination(paginationContainer, pagination, genreId);
    }
  } catch (error) {
    showError(genreContainer, "Gagal memuat anime berdasarkan genre.");
  }
}
function renderPagination(container, pagination, genreId) {
  let html = `<nav aria-label="Pagination"><ul class="pagination justify-content-center mt-4">`;

  if (pagination.hasPrevPage) {
    html += `<li class="page-item"><a class="page-link bg-dark text-white border-secondary" href="genre.html?genreId=${genreId}&page=${pagination.prevPage}">« Prev</a></li>`;
  }

  html += `<li class="page-item active"><span class="page-link bg-danger border-danger">${pagination.currentPage}</span></li>`;

  if (pagination.hasNextPage) {
    html += `<li class="page-item"><a class="page-link bg-dark text-white border-secondary" href="genre.html?genreId=${genreId}&page=${pagination.nextPage}">Next »</a></li>`;
  }

  if (pagination.totalPages) {
    html += `<li class="page-item disabled"><span class="page-link bg-dark text-secondary border-secondary">/ ${pagination.totalPages}</span></li>`;
  }

  html += `</ul></nav>`;
  container.innerHTML = html;
}
