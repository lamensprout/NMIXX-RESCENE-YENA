const input = document.getElementById("artistSearch");
const clearBtn = document.getElementById("clearBtn");
const results = document.getElementById("results");
const summary = document.getElementById("summary");
const updated = document.getElementById("updated");
const popular = document.getElementById("popular");
const template = document.getElementById("songTemplate");

let songs = [];

const artistAliases = {
  "NMIXX": ["엔믹스", "믹스"],
  "RESCENE (리센느)": ["리센느", "리센"],
  "YENA (최예나)": ["예나", "최예나", "옌"],
  "소연 (SOYEON)": ["소연", "전소연"],
  "아이오아이 (I.O.I)": ["아이오아이", "아오아"],
  "CORTIS (코르티스)": ["코르티스"],
  "ATEEZ(에이티즈)": ["에이티즈"],
  "태연 (TAEYEON)": ["태연", "탱구"],
  "BIGBANG (빅뱅)": ["빅뱅"],
  "WOODZ": ["우즈", "승연"],
  "aespa": ["에스파", "에셉"],
  "BIG Naughty (서동현)": ["빅나티"],
  "아일릿(ILLIT)": ["아일릿"],
  "아이유": ["아이유", "IU"],
  "화사 (HWASA)": ["화사"],
  "임영웅": ["영웅"],
  "Hearts2Hearts (하츠투하츠)": ["하츠투하츠", "하투하"],
  "도경수(D.O.)": ["도경수", "디오"],
  "AKMU (악뮤)": ["악뮤", "악동뮤지션"],
  "PLAVE": ["플레이브", "플브"],
  "G-DRAGON": ["지드래곤", "지디", "권지용", "GD"],
  "볼빨간사춘기": ["볼사", "볼빨간", "BOL4"],
  "ALLDAY PROJECT": ["올데이 프로젝트", "올데이프로젝트", "올데프", "ADP"],
  "로이킴": ["로킴"],
  "KiiiKiii (키키)": ["키키"],
  "우디 (Woody)": ["우디"],
  "BOYNEXTDOOR": ["보이넥스트도어", "보넥도", "BND"],
  "너드커넥션 (Nerd Connection)": ["너드커넥션", "너커"],
  "로제 (ROSÉ)": ["로제", "ROSÉ"],
  "DAY6 (데이식스)": ["데이식스", "데식", "D6"],
  "방탄소년단": ["방탄", "BTS", "비티에스"],
  "IVE (아이브)": ["아이브"],
  "폴킴": ["폴킴"],
  "정국": ["정국", "JUNGKOOK", "JK"],
  "10CM": ["십센치", "텐센치"],
  "이클립스 (ECLIPSE)": ["이클립스"],
  "BLACKPINK": ["블랙핑크", "블핑", "BP"],
  "카더가든": ["카더"],
  "제니 (JENNIE)": ["제니"],
  "HUNTR/X": ["헌트릭스"],
  "에픽하이 (EPIK HIGH)": ["에픽하이", "에픽"],
  "멜로망스": ["멜로"],
  "Lady Gaga": ["레이디 가가", "레이디가가"],
  "NewJeans": ["뉴진스", "뉴진"],
  "프로미스나인": ["프나", "프미나"],
  "KISS OF LIFE": ["키스 오브 라이프", "키스오브라이프", "키오프", "KIOF"],
  "BTOB": ["비투비"]
};

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^0-9a-z가-힣ㄱ-ㅎ]/g, "");
}

function getKoreanInitials(value) {
  const initials = [
    "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ",
    "ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
  ];

  let result = "";

  for (const char of String(value || "")) {
    const code = char.charCodeAt(0);

    if (code >= 0xAC00 && code <= 0xD7A3) {
      result += initials[Math.floor((code - 0xAC00) / 588)];
    } else if (/^[ㄱ-ㅎ]$/.test(char)) {
      result += char;
    }
  }

  return result;
}

function getParenthesizedNames(artist) {
  const names = [];
  const matches = String(artist).match(/\(([^()]*)\)/g) || [];

  for (const match of matches) {
    const name = match.slice(1, -1).trim();
    if (name) names.push(name);
  }

  return names;
}

function getEnglishAcronyms(value) {
  const tokens = String(value || "")
    .split(/[^0-9A-Za-zÀ-ÿ]+/)
    .filter(Boolean);

  if (tokens.length < 2) return [];
  return [tokens.map(function(token) { return token.charAt(0); }).join("")];
}

function getSearchNames(artist) {
  const names = [artist];

  getParenthesizedNames(artist).forEach(function(name) {
    names.push(name);
  });

  names.push.apply(names, artistAliases[artist] || []);
  names.push.apply(names, getEnglishAcronyms(artist));

  const snapshot = names.slice();

  snapshot.forEach(function(name) {
    const initials = getKoreanInitials(name);
    if (initials) names.push(initials);

    getEnglishAcronyms(name).forEach(function(acronym) {
      names.push(acronym);
    });
  });

  return Array.from(new Set(names.filter(Boolean)));
}

function matchesArtist(artist, query) {
  const q = normalize(query);
  if (!q) return false;

  return getSearchNames(artist).some(function(name) {
    return normalize(name).indexOf(q) !== -1;
  });
}

function formatChange(change) {
  if (change > 0) {
    return { text: "▲ " + change, className: "up" };
  }

  if (change < 0) {
    return { text: "▼ " + Math.abs(change), className: "down" };
  }

  return { text: "-", className: "same" };
}

function render(list, query) {
  results.innerHTML = "";

  if (!query) {
    summary.textContent = "아티스트를 검색해 주세요.";
    return;
  }

  if (!list.length) {
    summary.textContent = '"' + query + '" 검색 결과가 없습니다.';
    results.innerHTML =
      '<div class="empty">TOP100에서 해당 아티스트를 찾지 못했습니다.</div>';
    return;
  }

  summary.textContent =
    '"' + query + '" 검색 결과 ' + list.length + "곡입니다.";

  list.forEach(function(song) {
    const node = template.content.cloneNode(true);

    node.querySelector(".rank").textContent = song.rank;

    const change = formatChange(song.change || 0);
    const changeEl = node.querySelector(".change");
    changeEl.textContent = change.text;
    changeEl.classList.add(change.className);

    const image = node.querySelector(".album-image");

    if (song.album_image) {
      image.src = song.album_image;
      image.alt = song.title + " 앨범아트";
      image.style.visibility = "visible";
    } else {
      image.style.visibility = "hidden";
    }

    node.querySelector(".title").textContent = song.title || "";
    node.querySelector(".artist").textContent = song.artist || "";
    node.querySelector(".album").textContent = song.album || "";

    results.appendChild(node);
  });
}

function search(query) {
  const q = String(query || "").trim();

  const filtered = q
    ? songs.filter(function(song) {
        return matchesArtist(song.artist, q);
      })
    : [];

  render(filtered, q);
}

input.addEventListener("input", function() {
  search(input.value);
});

clearBtn.addEventListener("click", function() {
  input.value = "";
  search("");
  input.focus();
});

async function load() {
  try {
    const response = await fetch("./chart.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("차트 파일을 불러오지 못했습니다.");
    }

    const data = await response.json();
    songs = Array.isArray(data.songs) ? data.songs : [];

    if (data.updated_at) {
      const date = new Date(data.updated_at);
      updated.textContent =
        "업데이트: " + date.toLocaleString("ko-KR");
    } else {
      updated.textContent = "업데이트 정보를 확인할 수 없습니다.";
    }

    const artistCounts = new Map();

    songs.forEach(function(song) {
      artistCounts.set(
        song.artist,
        (artistCounts.get(song.artist) || 0) + 1
      );
    });

    const topArtists = Array.from(artistCounts.entries())
      .sort(function(a, b) {
        return b[1] - a[1];
      })
      .slice(0, 8);

    popular.innerHTML = "";

    topArtists.forEach(function(entry) {
      const artist = entry[0];
      const button = document.createElement("button");

      button.className = "chip";
      button.type = "button";
      button.textContent = artist;

      button.addEventListener("click", function() {
        input.value = artist;
        search(artist);
      });

      popular.appendChild(button);
    });

    summary.textContent = "아티스트를 검색해 주세요.";
  } catch (error) {
    updated.textContent = "차트를 불러오지 못했습니다.";
    summary.textContent = error.message;
  }
}

load();
