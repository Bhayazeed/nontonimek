

document.addEventListener("DOMContentLoaded", async () => {
  const query = getParam("q");

  if (query) {

    const searchInput = document.getElementById("input-pencarian");
    if (searchInput) searchInput.value = query;

    await loadSearchResults(query);
  } else {

    const container = document.getElementById("search-list-container");
    if (container) {
      container.innerHTML = `<p class="text-secondary text-center mt-5">Masukkan kata kunci pencarian anime yang ingin Anda cari.</p>`;
    }
  }

  const searchForm = document.getElementById("form-pencarian");
  const newInput = document.getElementById("input-pencarian");

  if (searchForm && newInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = newInput.value.trim();
      if (q) {
        window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      }
    });
  }
});
async function loadSearchResults(query) {
  const container = document.getElementById("search-list-container");
  const sectionTitle = document.getElementById("search-section-title");

  if (!container) return;

  if (sectionTitle) {
    sectionTitle.textContent = `Menampilkan hasil pencarian untuk: "${query}"`;
  }

  showLoading(container);

  try {
    const result = await fetchAPI(`/search?q=${encodeURIComponent(query)}`);
    const animes = result.data?.animeList || [];

    if (animes.length > 0) {
      container.innerHTML = animes
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
                    <li class="badge ${anime.status === 'Ongoing' ? 'bg-danger' : 'bg-success'} rounded-pill py-2 anime-badge-status">${anime.status || "?"}</li>
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
      container.innerHTML = `
        <div class="col-12 mt-5 text-center px-4">
          <i class="bi bi-search h1 text-secondary opacity-50 mb-3 d-block"></i>
          <h5 class="text-white">Tidak ada anime yang cocok.</h5>
          <p class="text-secondary">Kami tidak menemukan anime yang sesuai dengan pencarian "${query}".<br>Coba gunakan kata kunci berbeda.</p>
        </div>`;
    }

  } catch (error) {
    showError(container, "Gagal memuat hasil pencarian.");
  }
}
