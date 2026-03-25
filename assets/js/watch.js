

document.addEventListener("DOMContentLoaded", async () => {
  const animeId = getParam("id");
  const episodeId = getParam("ep");

  if (!animeId) {
    const main = document.getElementById("anime-watch-section");
    if (main)
      showError(
        main,
        'Anime ID tidak ditemukan. Kembali ke <a href="index.html" class="alert-link">Beranda</a>.'
      );
    return;
  }

  await loadAnimeDetails(animeId, episodeId);

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
async function loadAnimeDetails(animeId, episodeId) {
  const posterEl = document.getElementById("anime-detail-poster");
  const titleEl = document.getElementById("anime-detail-title");
  const badgesEl = document.getElementById("anime-detail-badges");
  const synopsisEl = document.getElementById("anime-detail-synopsis");
  const episodeContainer = document.getElementById("wadah-tombol-episode");
  const episodeBadge = document.getElementById("badge-total-eps");
  const recommendContainer = document.getElementById("recommendation-list");

  if (episodeContainer) showLoading(episodeContainer);
  if (recommendContainer) showLoading(recommendContainer);

  try {
    const result = await fetchAPI(`/anime/${animeId}`);
    const details = result.data?.details;

    if (!details) {
      showError(
        document.getElementById("anime-detail-info"),
        "Anime tidak ditemukan."
      );
      return;
    }

    document.title = `Nonton ${details.title} - Nontonimek`;

    if (posterEl) {
      posterEl.src = details.poster;
      posterEl.alt = `Poster ${details.title}`;
    }

    if (titleEl) titleEl.textContent = details.title;

    if (badgesEl) {
      let badgeHTML = "";
      if (details.score)
        badgeHTML += `<span class="badge bg-warning text-dark rounded-pill px-3 py-2"><i class="bi bi-star-fill me-1"></i> ${details.score}</span>`;
      if (details.status)
        badgeHTML += `<span class="badge ${details.status.toLowerCase() === "ongoing" ? "bg-danger" : "bg-success"} rounded-pill px-3 py-2">${details.status}</span>`;
      if (details.type)
        badgeHTML += `<span class="badge bg-info text-dark rounded-pill px-3 py-2">${details.type}</span>`;
      if (details.genreList) {
        details.genreList.forEach((genre) => {
          badgeHTML += `<span class="badge bg-secondary border border-light rounded-pill px-3 py-2">${genre.title}</span>`;
        });
      }
      badgesEl.innerHTML = badgeHTML;
    }

    if (synopsisEl && details.synopsis) {
      synopsisEl.innerHTML = details.synopsis.paragraphList
        .map((p) => `<p>${p}</p>`)
        .join("");
    }

    if (episodeBadge) {
      episodeBadge.textContent = `${details.episodes || details.episodeList?.length || "?"} Eps`;
    }

    if (episodeContainer && details.episodeList) {
      const episodes = [...details.episodeList].reverse();
      if (episodes.length > 0) {
        episodeContainer.innerHTML = episodes
          .map((ep, index) => {
            const epNum = ep.title.replace(/[^0-9]/g, "") || episodes.length - index;
            const isActive =
              episodeId === ep.episodeId ? "btn-danger" : "btn-outline-light";
            return `
              <div class="col-3 col-sm-2 col-md-2 col-lg-3">
                <a href="watch.html?id=${animeId}&ep=${ep.episodeId}"
                   class="btn ${isActive} w-100 fw-bold rounded-1 py-2 episode-btn"
                   data-episode-id="${ep.episodeId}">${epNum}</a>
              </div>`;
          })
          .join("");
      } else {
        episodeContainer.innerHTML = `<p class="text-secondary">Belum ada episode.</p>`;
      }

      if (!episodeId && episodes.length > 0) {
        await loadEpisode(episodes[0].episodeId, animeId);

        const firstBtn = episodeContainer.querySelector(".episode-btn");
        if (firstBtn) {
          firstBtn.classList.remove("btn-outline-light");
          firstBtn.classList.add("btn-danger");
        }
      } else if (episodeId) {
        await loadEpisode(episodeId, animeId);
      }
    }

    if (recommendContainer && details.recommendedAnimeList) {
      const recs = details.recommendedAnimeList;
      if (recs.length > 0) {
        recommendContainer.innerHTML = recs
          .map(
            (anime) => `
            <div class="col-6 col-md-4 col-lg-2 my-3">
              <a href="watch.html?id=${anime.animeId}" class="text-decoration-none">
                <div class="card text-bg-dark h-100 shadow-sm border-secondary border-opacity-50" style="transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                  <img src="${anime.poster}" class="card-img-top" alt="${anime.title}" style="height: 200px; object-fit: cover;" loading="lazy">
                  <div class="card-body p-2 text-center">
                    <h6 class="card-title fw-bold mb-0 text-truncate" title="${anime.title}">${anime.title}</h6>
                  </div>
                </div>
              </a>
            </div>`
          )
          .join("");
      } else {
        recommendContainer.innerHTML = `<p class="text-secondary">Tidak ada rekomendasi.</p>`;
      }
    }
  } catch (error) {
    const infoEl = document.getElementById("anime-detail-info");
    if (infoEl)
      showError(
        infoEl,
        "Gagal memuat detail anime. Pastikan API server berjalan."
      );
  }
}
async function loadEpisode(episodeId, animeId) {
  const iframe = document.getElementById("anime-video-iframe");
  const epTitle = document.getElementById("anime-current-episode-title");
  const serverAccordion = document.getElementById("accordionServer");

  if (serverAccordion) showLoading(serverAccordion);

  try {
    const result = await fetchAPI(`/episode/${episodeId}`);
    const details = result.data?.details;

    if (!details) return;

    if (iframe && details.defaultStreamingUrl) {
      iframe.src = details.defaultStreamingUrl;
    }

    if (epTitle) epTitle.textContent = details.title || "Episode";

    if (serverAccordion && details.server?.qualityList) {
      const qualities = details.server.qualityList;
      serverAccordion.innerHTML = qualities
        .map(
          (quality, index) => `
          <div class="accordion-item bg-transparent border-secondary ${index < qualities.length - 1 ? "border-bottom" : ""}">
            <h2 class="accordion-header">
              <button class="accordion-button ${index === 0 ? "" : "collapsed"} bg-transparent text-white fw-bold shadow-none p-3"
                type="button" data-bs-toggle="collapse" data-bs-target="#collapseServer${index}"
                aria-expanded="${index === 0 ? "true" : "false"}">
                ${quality.title || `Mirror ${index + 1}`}
              </button>
            </h2>
            <div id="collapseServer${index}" class="accordion-collapse collapse ${index === 0 ? "show" : ""}"
              data-bs-parent="#accordionServer">
              <div class="accordion-body p-3 pt-0 d-flex flex-wrap gap-2">
                ${
                  quality.serverList
                    ? quality.serverList
                        .map(
                          (server, sIdx) =>
                            `<button class="btn btn-sm ${sIdx === 0 && index === 0 ? "btn-danger" : "btn-outline-light"} px-3 server-btn"
                              data-server-id="${server.serverId}"
                              onclick="switchServer('${server.serverId}', this)">${server.title}</button>`
                        )
                        .join("")
                    : '<span class="text-secondary">No servers</span>'
                }
              </div>
            </div>
          </div>`
        )
        .join("");
    }

    const allEpBtns = document.querySelectorAll(".episode-btn");
    allEpBtns.forEach((btn) => {
      btn.classList.remove("btn-danger");
      btn.classList.add("btn-outline-light");
      if (btn.dataset.episodeId === episodeId) {
        btn.classList.remove("btn-outline-light");
        btn.classList.add("btn-danger");
      }
    });

    const newUrl = `watch.html?id=${animeId}&ep=${episodeId}`;
    window.history.replaceState({}, "", newUrl);
  } catch (error) {
    console.error("Failed to load episode:", error);
    if (serverAccordion)
      showError(serverAccordion, "Gagal memuat data episode.");
  }
}
async function switchServer(serverId, btnEl) {
  const iframe = document.getElementById("anime-video-iframe");

  document.querySelectorAll(".server-btn").forEach((btn) => {
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-outline-light");
  });
  if (btnEl) {
    btnEl.classList.remove("btn-outline-light");
    btnEl.classList.add("btn-danger");
  }

  try {
    const result = await fetchAPI(`/server/${serverId}`);
    const url = result.data?.details?.url;

    if (iframe && url) {
      iframe.src = url;
    }
  } catch (error) {
    console.error("Failed to switch server:", error);
  }
}
