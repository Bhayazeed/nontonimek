

document.addEventListener("DOMContentLoaded", async () => {
  const ongoingList = document.getElementById("ongoing-anime-list");
  const completedList = document.getElementById("completed-anime-list");
  const sidebarRilis = document.getElementById("sidebar-rilis-list");
  const sidebarGenre = document.getElementById("sidebar-genre-list");

  if (ongoingList) showLoading(ongoingList);
  if (completedList) showLoading(completedList);
  if (sidebarRilis) showLoading(sidebarRilis);
  if (sidebarGenre) showLoading(sidebarGenre);

  try {
    const [ongoingData, completedData, genreData] = await Promise.all([
      fetchAPI("/ongoing?page=1"),
      fetchAPI("/completed?page=1"),
      fetchAPI("/genre"),
    ]);

    if (ongoingList && ongoingData.data?.animeList) {
      const animes = ongoingData.data.animeList.slice(0, 6);
      if (animes.length > 0) {
        ongoingList.innerHTML = animes
          .map((anime) => createAnimeCard(anime, "ongoing"))
          .join("");
      } else {
        ongoingList.innerHTML = `<p class="text-secondary">Tidak ada anime ongoing saat ini.</p>`;
      }
    }

    if (completedList && completedData.data?.animeList) {
      const animes = completedData.data.animeList.slice(0, 6);
      if (animes.length > 0) {
        completedList.innerHTML = animes
          .map((anime) => createAnimeCard(anime, "completed"))
          .join("");
      } else {
        completedList.innerHTML = `<p class="text-secondary">Tidak ada anime completed saat ini.</p>`;
      }
    }

    if (sidebarRilis && ongoingData.data?.animeList) {
      const latest = ongoingData.data.animeList.slice(0, 5);
      if (latest.length > 0) {
        sidebarRilis.innerHTML = latest
          .map((anime) => createSidebarItem(anime))
          .join("");
      } else {
        sidebarRilis.innerHTML = `<p class="text-secondary">Tidak ada data.</p>`;
      }
    }

    if (sidebarGenre && genreData.data?.genreList) {
      const genres = genreData.data.genreList;
      if (genres.length > 0) {
        sidebarGenre.innerHTML = genres
          .map(
            (genre) =>
              `<li><a href="genre.html?genreId=${genre.genreId}" class="badge bg-secondary rounded-pill py-2 anime-badge-type text-decoration-none">${genre.title}</a></li>`
          )
          .join("");
      } else {
        sidebarGenre.innerHTML = `<p class="text-secondary">Tidak ada genre.</p>`;
      }
    }
  } catch (error) {
    if (ongoingList)
      showError(
        ongoingList,
        "Gagal memuat data. Pastikan API server berjalan di localhost:3001"
      );
    if (completedList)
      showError(completedList, "Gagal memuat data anime completed.");
    if (sidebarRilis)
      showError(sidebarRilis, "Gagal memuat rilis terbaru.");
    if (sidebarGenre) showError(sidebarGenre, "Gagal memuat genre.");
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
