

document.addEventListener("DOMContentLoaded", async () => {
  const page = getParam("page") || "1";
  await loadCompletedAnime(page);

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

async function loadCompletedAnime(page) {
  const container = document.getElementById("completed-list-container");
  const paginationContainer = document.getElementById("completed-pagination");

  if (!container) return;
  showLoading(container);

  try {
    const result = await fetchAPI(`/completed?page=${page}`);
    const animes = result.data?.animeList || [];
    const pagination = result.pagination;

    if (animes.length > 0) {
      container.innerHTML = animes
        .map((anime) => createAnimeCard(anime, "completed", "col-6 col-md-4 col-lg-3 mt-4"))
        .join("");
    } else {
      container.innerHTML = `<p class="text-secondary text-center">Tidak ada anime completed ditemukan.</p>`;
    }

    if (paginationContainer && pagination) {
      renderPagination(paginationContainer, pagination, "completed.html");
    }
  } catch (error) {
    showError(container, "Gagal memuat anime completed.");
  }
}

function renderPagination(container, pagination, baseUrl) {
  let html = `<nav aria-label="Pagination"><ul class="pagination justify-content-center mt-4">`;

  if (pagination.hasPrevPage) {
    html += `<li class="page-item"><a class="page-link bg-dark text-white border-secondary" href="${baseUrl}?page=${pagination.prevPage}">« Prev</a></li>`;
  }

  html += `<li class="page-item active"><span class="page-link bg-danger border-danger">${pagination.currentPage}</span></li>`;

  if (pagination.hasNextPage) {
    html += `<li class="page-item"><a class="page-link bg-dark text-white border-secondary" href="${baseUrl}?page=${pagination.nextPage}">Next »</a></li>`;
  }

  if (pagination.totalPages) {
    html += `<li class="page-item disabled"><span class="page-link bg-dark text-secondary border-secondary">/ ${pagination.totalPages}</span></li>`;
  }

  html += `</ul></nav>`;
  container.innerHTML = html;
}
