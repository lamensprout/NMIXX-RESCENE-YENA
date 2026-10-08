const input = document.getElementById("artistSearch");
const clearBtn = document.getElementById("clearBtn");
const results = document.getElementById("results");
const summary = document.getElementById("summary");
const updated = document.getElementById("updated");
const popular = document.getElementById("popular");
const template = document.getElementById("songTemplate");

let songs = [];

// 멜론에 현재 TOP100에 표시된 아티스트만 검색 대상으로 사용합니다.
// 괄호 안의 표기(예: RESCENE (리센느))는 자동으로 별칭으로 인식합니다.
// 멜론에 영문명만 표시되는 경우를 위해 별칭을 추가할 수도 있습니다.
const artistAliases = {
  "NMIXX": ["엔믹스", "nmixx"],
  "YENA (최예나)": ["예나", "최예나", "yena"],
  "WOODZ": ["우즈"],
  "aespa": ["에스파"],
  "PLAVE": ["플레이브"],
  "G-DRAGON": ["지드래곤", "권지용"],
  "ALLDAY PROJECT": ["올데이 프로젝트", "올데이프로젝트"],
  "BOYNEXTDOOR": ["보이넥스트도어"],
  "BLACKPINK": ["블랙핑크"],
  "KISS OF LIFE": ["키스 오브 라이프", "키스오브라이프", "KIOF"],
  "Lady Gaga": ["레이디 가가", "레이디가가"],
  "NewJeans": ["뉴진스"],
  "HUNTR/X": ["헌트릭스"],
  "BTOB": ["비투비"],
};

function getSearchNames(artist) {
  const names = [artist];
  const aliases = artistAliases[artist] || [];

  // "아티스트 (한국명)" 형태를 자동으로 분리합니다.
  const matches = artist.match(/\\(([^()]*)\\)/g) || [];
  for (const match of matches) {
    const alias = match.slice(1, -1).trim();
    if (alias) names.push(alias);
  }

  for (const alias of aliases) names.push(alias);
  return [...new Set(names)];
}

function escapeText(value) {
  return value == null ? "" : String(value);
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]/g, "");
}

function getSearchNames(artist) {
  const names = [artist];
  const aliases = artistAliases[artist] || [];
  return names.concat(aliases);
}

function matchesArtist(artist, query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return false;

  return getSearchNames(artist).some(name =>
    normalize(name).includes(normalizedQuery)
  );
}

function formatChange(change) {
  if (change > 0) return { text: `▲ ${change}`, className: "up" };
  if (change < 0) return { text: `▼ ${Math.abs(change)}`, className: "down" };
  return { text: "-", className: "same" };
}

function render(list, query) {
  results.innerHTML = "";

  if (!query) {
    summary.textContent = "아티스트를 검색해 주세요.";
    return;
  }

  if (!list.length) {
    summary.textContent = `"${query}" 검색 결과가 없습니다.`;
    results.innerHTML = '<div class="empty">TOP100에서 해당 아티스트를 찾지 못했습니다.</div>';
    return;
  }

  summary.textContent = `"${query}" 검색 결과 ${list.length}곡입니다.`;

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
  const q = query.trim();
  const filtered = q
    ? songs.filter(song => matchesArtist(song.artist, q))
    : [];
  render(filtered, q);
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
    if (!response.ok) throw new Error("차트 파일을 불러오지 못했습니다.");

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
    updated.textContent = "차트를 불러오지 못했습니다.";
    summary.textContent = error.message;
  }
}

load();
