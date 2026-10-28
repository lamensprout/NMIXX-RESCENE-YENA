function setChartStatus(message, hideAfterMs = 0, loading = false, state = "") {
  if (window.MelonitorChartPopup) {
    window.MelonitorChartPopup.set(message, hideAfterMs, loading, state);
    return;
  }
  if (!chartStatus) return;
  chartStatus.classList.toggle("is-loading", Boolean(loading));
  chartStatus.classList.toggle("is-success", state === "success");
  chartStatus.classList.toggle("is-error", state === "error");
  chartStatus.setAttribute("aria-busy", loading ? "true" : "false");
  chartStatus.dataset.message = message || "";
  chartStatus.title = message || "";
  chartStatus.textContent = message || "";
  chartStatus.hidden = !message;
}

async function loadChartData(manual = false, silent = false) {
  if (chartLoadInProgress) return;
  chartLoadInProgress = true;

  if (!silent && refreshChartButton) {
    refreshChartButton.disabled = true;
    refreshChartButton.textContent = "↻ 차트 불러오는 중...";
  }
  if (manual) {
    setChartStatus("차트를 불러오는 중입니다.\n잠시만 기다려주세요.", 0, true);
  } else if (!silent) {
    setChartStatus("차트를 불러오는 중입니다.\n잠시만 기다려주세요.", 0, true);
  }

  try {
    let data;

    if (manual) {
      // 버튼 클릭 시 정적 파일 재요청이 아니라 서버에서 멜론을 다시 수집합니다.
      data = await requestServerChart("POST");
    } else {
      // 저장된 최신 공용 캐시를 먼저 확인하고, 서버에 문제가 있으면 정적 차트를 사용합니다.
      try {
        data = await requestServerChart("GET");
      } catch (serverError) {
        console.warn("최신 차트 서버를 사용할 수 없어 저장된 파일을 불러옵니다:", serverError);
        data = await requestStaticChart();
      }
    }

    songs = canonicalizeChartSongs(data.songs);
    chartReferenceTime = data.updated_at || data.updatedAt || data.fetched_at || data.fetchedAt || new Date().toISOString();
    rememberChartSongs(songs);
    chartHasLoaded = true;
    buildMelonArtistCatalog();
    if (favoriteInput && favoriteInput.value.trim()) {
      renderFavoriteSearchResults();
    }

    await loadPopularSearches();
    await renderFavoriteArtists();

    if (input.value.trim()) {
      search(input.value);
    } else {
      summary.textContent = "아티스트를 검색해 주세요.";
      results.innerHTML = "";
    }

    if (manual) {
      setChartStatus("차트가 새로고침되었습니다.", 1800, false, "success");
    } else if (!silent) {
      setChartStatus("차트 갱신에 성공했습니다.", 1800, false, "success");
    }
  } catch (error) {
    console.error("차트 갱신 실패:", error);
    if (!silent) {
      const errorMessage = String(error && error.message ? error.message : "알 수 없는 오류").slice(0, 180);
      if (manual) {
        setChartStatus("차트를 불러오지 못했습니다.", 2200, false, "error");
      } else {
        setChartStatus("");
      }

      if (!chartHasLoaded) {
        summary.textContent = errorMessage || "차트를 불러오지 못했습니다.";
      } else if (manual) {
        summary.textContent = (input.value.trim()
          ? "멜론 TOP100을 갱신하지 못했어요. 이전 차트를 계속 표시합니다."
          : "멜론 TOP100을 갱신하지 못했어요. 이전 차트 데이터를 계속 표시합니다.") + " (원인: " + errorMessage + ")";
      }
    }
  } finally {
    chartLoadInProgress = false;
    if (!silent && refreshChartButton) {
      refreshChartButton.disabled = false;
      refreshChartButton.textContent = "↻ 차트 새로고침";
    }
  }
}

async function load() {
  const initialArtist = new URLSearchParams(window.location.search).get("artist");
  if (initialArtist && input && !input.value.trim()) input.value = initialArtist;

  if (window.MonitorStore) {
    try {
      await MonitorStore.init();
    } catch (accountError) {
      console.warn("계정 상태를 확인하지 못했습니다:", accountError);
    }
  }
  updatePersonalPanels();
  await loadChartData(false);
}

if (refreshChartButton) {
  refreshChartButton.addEventListener("click", function() {
    loadChartData(true);
  });
}

// 서버의 공용 TOP100은 서버 스케줄러가 매분 수집합니다.
// 이 화면도 매분 최신 캐시를 다시 읽어 열어 둔 페이지를 갱신합니다.
const CHART_AUTO_REFRESH_MS = 60_000;
setInterval(function() {
  if (document.visibilityState === "visible" && !chartLoadInProgress) {
    loadChartData(false, true);
  }
}, CHART_AUTO_REFRESH_MS);

document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "visible" && chartHasLoaded && !chartLoadInProgress) {
    loadChartData(false, true);
  }
});

window.addEventListener("melonitor-auth-change", async function() {
  updatePersonalPanels();
  await loadPopularSearches();
  await renderFavoriteArtists();
});
load();
