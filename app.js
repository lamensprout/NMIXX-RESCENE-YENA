const input = document.getElementById("artistSearch");
const clearBtn = document.getElementById("clearBtn");
const results = document.getElementById("results");
const summary = document.getElementById("summary");
const updated = document.getElementById("updated");
const popular = document.getElementById("popular");
const template = document.getElementById("songTemplate");

let songs = [];

function escapeText(value) {
  return value == null ? "" : String(value);
}

function formatChange(change) {
  if (change > 0) return { text: `▲ ${change}`, className: "up" };
  if (change < 0) return { text: `▼ ${Math.abs(change)}`, className: "down" };
  return { text: "-", className: "same" };
}

function render(list, query) {
  results.innerHTML = "";

  if (!query) {
    summary.textContent = "아티스트를 검색해봐.";
    return;
  }

  if (!list.length) {
    summary.textContent = `"${query}" 검색 결과가 없어.`;
    results.innerHTML = '<div class="empty">TOP100에서 해당 아티스트를 찾지 못했어.</div>';
    return;
  }

  summary.textContent = `"${query}" 검색 결과 ${list.length}곡`;

  for (const song of list) {
    const node = template.content.cloneNode(true);
    node.querySelector(".rank").textContent = song.rank;
    const change = formatChange(song.change || 0);
    const changeEl = node.querySelector(".change");
    changeEl.textContent = change.text;
    changeEl.classList.add(change.className);

    const image = node.querySelector(".album-image");
    if (song.album_image) {
      image.src = song.album_image;
      image.alt = `${song.title} 앨범아트`;
    } else {
      image.style.visibility = "hidden";
    }

    node.querySelector(".title").textContent = escapeText(song.title);
    node.querySelector(".artist").textContent = escapeText(song.artist);
    node.querySelector(".album").textContent = escapeText(song.album);

    results.appendChild(node);
  }
}

function search(query) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? songs.filter(song => song.artist.toLowerCase().includes(q))
    : [];
  render(filtered, query.trim());
}

input.addEventListener("input", () => search(input.value));
clearBtn.addEventListener("click", () => {
  input.value = "";
  search("");
  input.focus();
});

async function load() {
  try {
    const response = await fetch("chart.json", { cache: "no-store" });
    if (!response.ok) throw new Error("차트 파일을 불러오지 못했어.");
    const data = await response.json();
    songs = Array.isArray(data.songs) ? data.songs : [];

    if (data.updated_at) {
      const date = new Date(data.updated_at);
      updated.textContent = `업데이트: ${date.toLocaleString("ko-KR")}`;
    }

    const artistCounts = new Map();
    for (const song of songs) {
      artistCounts.set(song.artist, (artistCounts.get(song.artist) || 0) + 1);
    }

    const topArtists = [...artistCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    popular.innerHTML = "";
    for (const [artist] of topArtists) {
      const button = document.createElement("button");
      button.className = "chip";
      button.type = "button";
      button.textContent = artist;
      button.addEventListener("click", () => {
        input.value = artist;
        search(artist);
      });
      popular.appendChild(button);
    }
  } catch (error) {
    updated.textContent = "차트 불러오기 실패";
    summary.textContent = error.message;
  }
}

load();
