const input = document.getElementById("artistSearch");
const clearBtn = document.getElementById("clearBtn");
const results = document.getElementById("results");
const summary = document.getElementById("summary");
const updated = document.getElementById("updated");
const popular = document.getElementById("popular");
const template = document.getElementById("songTemplate");

let songs = [];

// 멜론의 현재 TOP100에 있는 아티스트만 검색 대상입니다.
// 공식 표기, 한국어 이름, 영문 이름, 자주 쓰는 줄임말을 함께 검색할 수 있습니다.
// 검색어의 대소문자·공백·일부 특수문자는 자동으로 무시합니다.
const artistAliases = {
  "NMIXX": ["엔믹스", "nmixx", "믹스"],
  "RESCENE (리센느)": ["리센느", "rescene", "리센"],
  "YENA (최예나)": ["예나", "최예나", "yena"],
  "소연 (SOYEON)": ["소연", "전소연", "soyeon"],
  "아이오아이 (I.O.I)": ["아이오아이", "아이오아이", "ioi", "i.o.i", "아오아"],
  "CORTIS (코르티스)": ["코르티스", "cortis"],
  "ATEEZ(에이티즈)": ["에이티즈", "ateez"],
  "태연 (TAEYEON)": ["태연", "taeyeon", "탱구"],
  "BIGBANG (빅뱅)": ["빅뱅", "bigbang", "bb"],
  "WOODZ": ["우즈", "woodz", "승연"],
  "aespa": ["에스파", "aespa", "에셉"],
  "BIG Naughty (서동현)": ["빅나티", "big naughty", "bignaughty"],
  "아일릿(ILLIT)": ["아일릿", "illit"],
  "한로로": ["한로로"],
  "아이유": ["아이유", "iu"],
  "화사 (HWASA)": ["화사", "hwasa"],
  "임영웅": ["임영웅", "영웅", "imyoungwoong", "limyoungwoong"],
  "Hearts2Hearts (하츠투하츠)": ["하츠투하츠", "하투하", "hearts2hearts", "h2h"],
  "최유리": ["최유리"],
  "도경수(D.O.)": ["도경수", "디오", "d.o.", "do"],
  "AKMU (악뮤)": ["악뮤", "악동뮤지션", "akmu"],
  "PLAVE": ["플레이브", "플브", "plave"],
  "성시경": ["성시경", "시경"],
  "다비치": ["다비치", "다비"],
  "G-DRAGON": ["지드래곤", "지디", "권지용", "gdragon", "gd"],
  "볼빨간사춘기": ["볼빨간사춘기", "볼사", "볼빨간", "bol4"],
  "소녀시대-효리수 (Girls' Generation-HRS)": ["소녀시대효리수", "girls generation hrs", "hrs"],
  "ALLDAY PROJECT": ["올데이 프로젝트", "올데이프로젝트", "올데프", "alldayproject", "adp"],
  "로이킴": ["로이킴", "로킴", "roykim"],
  "KiiiKiii (키키)": ["키키", "kiikiii"],
  "김나영": ["김나영"],
  "우디 (Woody)": ["우디", "woody"],
  "BOYNEXTDOOR": ["보이넥스트도어", "보넥도", "보넥도어", "boynextdoor", "bnd"],
  "너드커넥션 (Nerd Connection)": ["너드커넥션", "너커", "nerdconnection", "nerd connection", "nc"],
  "이창섭": ["이창섭", "창섭"],
  "로제 (ROSÉ)": ["로제", "rose", "rosé"],
  "잔나비": ["잔나비", "jannabi"],
  "DAY6 (데이식스)": ["데이식스", "데식", "day6", "d6"],
  "방탄소년단": ["방탄소년단", "방탄", "bts", "비티에스"],
  "IVE (아이브)": ["아이브", "ive"],
  "폴킴": ["폴킴", "paulkim"],
  "이찬혁": ["이찬혁", "찬혁"],
  "정국": ["정국", "jungkook", "jk"],
  "조째즈": ["조째즈"],
  "10CM": ["십센치", "10cm", "텐센치"],
  "이클립스 (ECLIPSE)": ["이클립스", "eclipse"],
  "베스티": ["베스티", "bestie"],
  "BLACKPINK": ["블랙핑크", "블핑", "blackpink", "bp"],
  "이무진": ["이무진"],
  "박재정": ["박재정"],
  "카더가든": ["카더가든", "카더", "car the garden"],
  "제니 (JENNIE)": ["제니", "jennie"],
  "HUNTR/X": ["헌트릭스", "huntrx"],
  "황가람": ["황가람"],
  "에픽하이 (EPIK HIGH)": ["에픽하이", "에픽", "epikhigh", "epik high"],
  "멜로망스": ["멜로망스", "멜로"],
  "Lady Gaga": ["레이디 가가", "레이디가가", "ladygaga"],
  "NewJeans": ["뉴진스", "뉴진", "newjeans", "nj"],
  "TWS (투어스)": ["투어스", "tws"],
  "경서예지": ["경서예지"],
  "프로미스나인": ["프로미스나인", "프나", "프미나", "fromis9", "fromis_9"],
  "임현정": ["임현정"],
  "KISS OF LIFE": ["키스 오브 라이프", "키스오브라이프", "키오프", "KIOF", "kiof"],
  "BTOB": ["비투비", "btob"]
};

function getEnglishAcronyms(value) {
  // "KISS OF LIFE" -> "KIOF", "DAY6" -> "D6" 같은 약칭을 자동으로 만듭니다.
  const tokens = String(value)
    .split(/[^0-9A-Za-zÀ-ÿ]+/)
    .filter(Boolean);

  if (tokens.length >= 2) {
    const acronym = tokens.map(token => token[0]).join("");
    if (acronym.length >= 2) return [acronym];
  }

  return [];
}

function getKoreanInitials(value) {
  const CHOSEONG = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  const result = [];

  for (const char of String(value)) {
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      result.push(CHOSEONG[Math.floor((code - 0xAC00) / 588)]);
    }
  }

  return result.join("");
}

function getEnglishAcronyms(value) {
  const tokens = String(value)
    .split(/[^0-9A-Za-zÀ-ÿ]+/)
    .filter(Boolean);

  const results = [];
  if (tokens.length >= 2) {
    results.push(tokens.map(token => token[0]).join(""));
  }

  return results;
}

function getSearchNames(artist) {
  const names = [artist];

  // "RESCENE (리센느)", "IVE (아이브)"처럼 괄호 안의 표기를 자동 인식합니다.
  const matches = artist.match(/\\(([^()]*)\\)/g) || [];
  for (const match of matches) {
    const alias = match.slice(1, -1).trim();
    if (alias) names.push(alias);
  }

  for (const name of [...names]) {
    names.push(...getEnglishAcronyms(name));
    names.push(getKoreanInitials(name));
  }

  names.push(...(artistAliases[artist] || []));

  for (const alias of [...names]) {
    names.push(getKoreanInitials(alias));
    names.push(...getEnglishAcronyms(alias));
  }

  return [...new Set(names.filter(Boolean))];
}

function formatChange(change) {(change) {
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
