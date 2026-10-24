// 즐겨찾기 전용 페이지 로직: Melonitor 홈과 같은 계정 저장소를 사용합니다.
const favoriteInput = document.getElementById("favoriteInput");
const favoriteForm = document.getElementById("favoriteForm");
const favoriteAddButton = document.getElementById("favoriteAddButton");
const favoriteSearchResults = document.getElementById("favoriteSearchResults");
const favoriteArtists = document.getElementById("favoriteArtists");
const favoritesNote = document.getElementById("favoritesNote");
const favoritesLoginGate = document.getElementById("favoritesLoginGate");
const accountLinkLabel = document.getElementById("accountLinkLabel");

let songs = [];
let melonArtistCatalog = [];
let melonArtistCatalogSignature = "";
let selectedFavoriteArtist = "";
let favoriteSearchComposing = false;

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
  "Hearts2Hearts (하츠투하츠)": ["하츠투하츠", "하투하", "하투하츠", "H2H"],
  "도경수(D.O.)": ["도경수", "디오"],
  "AKMU (악뮤)": ["악뮤", "악동뮤지션", "Akdong Musician", "AkdongMusician"],
  "AKMU": ["악뮤", "악동뮤지션", "Akdong Musician"],
  "악동뮤지션": ["AKMU", "악뮤", "Akdong Musician"],
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
  "BTOB": ["비투비"],

  // 공식 그룹명 변경/개명 이력 검색
  "i-dle": ["아이들", "(여자)아이들", "여자아이들", "(G)I-DLE", "G-I-DLE", "GIDLE", "여자 아이들"],
  "아이들": ["i-dle", "(여자)아이들", "여자아이들", "(G)I-DLE", "G-I-DLE", "GIDLE"],
  "(여자)아이들": ["i-dle", "아이들", "여자아이들", "(G)I-DLE", "G-I-DLE", "GIDLE"],
  "여자아이들": ["i-dle", "아이들", "(여자)아이들", "(G)I-DLE", "G-I-DLE", "GIDLE"],
  "(G)I-DLE": ["i-dle", "아이들", "(여자)아이들", "여자아이들", "GIDLE", "G-I-DLE"],
  "GIDLE": ["i-dle", "아이들", "(여자)아이들", "여자아이들", "(G)I-DLE"],

  "HIGHLIGHT": ["하이라이트", "BEAST", "비스트"],
  "하이라이트": ["HIGHLIGHT", "BEAST", "비스트"],
  "BEAST": ["HIGHLIGHT", "하이라이트", "비스트"],
  "비스트": ["HIGHLIGHT", "하이라이트", "BEAST"],

  "Dreamcatcher": ["드림캐쳐", "MINX", "밍스", "Dream Catcher"],
  "드림캐쳐": ["Dreamcatcher", "MINX", "밍스"],
  "MINX": ["Dreamcatcher", "드림캐쳐", "밍스"],

  "DKZ": ["디케이지", "DONGKIZ", "동키즈"],
  "디케이지": ["DKZ", "DONGKIZ", "동키즈"],
  "DONGKIZ": ["DKZ", "디케이지", "동키즈"],
  "동키즈": ["DKZ", "디케이지", "DONGKIZ"],

  "TO1": ["티오원", "TOO", "티오오"],
  "티오원": ["TO1", "TOO", "티오오"],
  "TOO": ["TO1", "티오원", "티오오"],

  "ALICE": ["앨리스", "ELRIS", "엘리스"],
  "앨리스": ["ALICE", "ELRIS", "엘리스"],
  "ELRIS": ["ALICE", "앨리스", "엘리스"],

  "BBGIRLS": ["BB GIRLS", "비비걸스", "브브걸", "Brave Girls", "브레이브걸스"],
  "BB GIRLS": ["BBGIRLS", "비비걸스", "브브걸", "Brave Girls", "브레이브걸스"],
  "Brave Girls": ["BBGIRLS", "BB GIRLS", "비비걸스", "브브걸", "브레이브걸스"],
  "브레이브걸스": ["BBGIRLS", "BB GIRLS", "Brave Girls", "비비걸스", "브브걸"],

  "ONEWE": ["원위", "M.A.S 0094", "MAS", "마스"],
  "원위": ["ONEWE", "M.A.S 0094", "MAS", "마스"],
  "M.A.S 0094": ["ONEWE", "원위", "MAS", "마스"],
  "MAS": ["ONEWE", "원위", "M.A.S 0094", "마스"],

  "DMTN": ["달마시안", "Dalmatian"],
  "Dalmatian": ["DMTN", "달마시안"],
  "달마시안": ["DMTN", "Dalmatian"],

  "The New Six": ["TNX", "더뉴식스"],
  "TNX": ["The New Six", "더뉴식스"],
  "더뉴식스": ["The New Six", "TNX"],

  "GIRLSET": ["VCHA", "걸셋"],
  "VCHA": ["GIRLSET", "걸셋"],
  "걸셋": ["GIRLSET", "VCHA"],

  "The KingDom": ["KINGDOM", "더킹덤"],
  "KINGDOM": ["The KingDom", "더킹덤"],
  "더킹덤": ["The KingDom", "KINGDOM"],

  "SEVENUS": ["세븐어스", "MASC", "마스크"],
  "세븐어스": ["SEVENUS", "MASC", "마스크"],
  "MASC": ["SEVENUS", "세븐어스", "마스크"],

  "XENO-T": ["제노티", "TOPPDOGG", "탑독"],
  "제노티": ["XENO-T", "TOPPDOGG", "탑독"],
  "TOPPDOGG": ["XENO-T", "제노티", "탑독"],

  "Blackswan": ["블랙스완", "Rania", "BP Rania", "라니아"],
  "블랙스완": ["Blackswan", "Rania", "BP Rania", "라니아"],
  "Rania": ["Blackswan", "블랙스완", "BP Rania", "라니아"],
  "BP Rania": ["Blackswan", "블랙스완", "Rania", "라니아"]
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

  const knownForms = names.map(normalize);
  Object.entries(artistAliases).forEach(function(entry) {
    const key = normalize(entry[0]);
    const aliases = entry[1] || [];
    const aliasForms = aliases.map(normalize);

    const matches = knownForms.some(function(form) {
      return form && (form === key || aliasForms.indexOf(form) !== -1);
    });

    if (matches) {
      names.push(entry[0]);
      names.push.apply(names, aliases);
    }
  });

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



function getArtistIdentityTokens(artist) {
  const tokens = [normalize(artist)];
  getParenthesizedNames(artist).forEach(function(name) {
    tokens.push(normalize(name));
  });
  return tokens.filter(Boolean);
}

function areSameArtist(a, b) {
  const aTokens = getArtistIdentityTokens(a);
  const bTokens = getArtistIdentityTokens(b);
  const knownForms = new Set(aTokens.concat(bTokens));

  let changed = true;
  while (changed) {
    changed = false;

    Object.entries(artistAliases).forEach(function(entry) {
      const group = [entry[0]].concat(entry[1] || []).map(normalize).filter(Boolean);
      const touchesKnownForm = group.some(function(name) {
        return knownForms.has(name);
      });

      if (touchesKnownForm) {
        group.forEach(function(name) {
          if (!knownForms.has(name)) {
            knownForms.add(name);
            changed = true;
          }
        });
      }
    });
  }

  return aTokens.some(function(token) {
    return knownForms.has(token) && bTokens.some(function(other) {
      return knownForms.has(other) && token === other;
    });
  }) || aTokens.some(function(token) {
    return bTokens.some(function(other) {
      if (token === other) return true;
      const aNames = getAliasClosure(token);
      return aNames.has(other);
    });
  });
}

function getAliasClosure(value) {
  const knownForms = new Set([normalize(value)]);
  let changed = true;

  while (changed) {
    changed = false;
    Object.entries(artistAliases).forEach(function(entry) {
      const group = [entry[0]].concat(entry[1] || []).map(normalize).filter(Boolean);
      if (group.some(function(name) { return knownForms.has(name); })) {
        group.forEach(function(name) {
          if (!knownForms.has(name)) {
            knownForms.add(name);
            changed = true;
          }
        });
      }
    });
  }

  return knownForms;
}

function getCanonicalChartArtist(artist) {
  const chartArtists = [];
  songs.forEach(function(song) {
    if (song.artist && chartArtists.indexOf(song.artist) === -1) {
      chartArtists.push(song.artist);
    }
  });

  // 멜론 차트에 실제 표시된 이름을 대표 표기로 사용합니다.
  return chartArtists.find(function(candidate) {
    return normalize(candidate) === normalize(artist) || areSameArtist(candidate, artist);
  }) || artist;
}

function canonicalizeChartSongs(chartSongs) {
  const representatives = [];
  chartSongs.forEach(function(song) {
    const artist = String(song && song.artist || "").trim();
    if (!artist) return;
    if (!representatives.some(function(name) {
      return normalize(name) === normalize(artist) || areSameArtist(name, artist);
    })) representatives.push(artist);
  });
  return chartSongs.map(function(song) {
    const artist = String(song && song.artist || "").trim();
    if (!artist) return song;
    const canonical = representatives.find(function(name) {
      return normalize(name) === normalize(artist) || areSameArtist(name, artist);
    }) || artist;
    return Object.assign({}, song, { artist: canonical });
  });
}

function matchesArtist(artist, query) {
  const q = normalize(query);
  if (!q) return false;

  return getSearchNames(artist).some(function(name) {
    return normalize(name).indexOf(q) !== -1;
  });
}



function getCanonicalPopularArtist(artist) {
  const value = String(artist || "").trim();
  if (!value) return "";

  const chartMatch = songs.find(function(song) {
    return song.artist && areSameArtist(song.artist, value);
  });
  if (chartMatch) return getCanonicalChartArtist(chartMatch.artist);

  const query = normalize(value);
  const aliasEntry = Object.entries(artistAliases).find(function(entry) {
    const key = entry[0];
    const bareKey = key.replace(/\s*\([^()]*\)\s*/g, " ").trim();
    const forms = [key, bareKey].concat(getParenthesizedNames(key), entry[1] || []);
    return forms.some(function(name) {
      return normalize(name) === query;
    });
  });

  return aliasEntry ? aliasEntry[0] : value;
}



// Build a local, pre-normalized list of known Melon artist names and aliases.
// This keeps favorite-artist suggestions responsive while typing.
function buildMelonArtistCatalog() {
  const signature = Array.from(new Set(
    songs.map(function(song) { return song.artist; }).filter(Boolean)
  )).sort().join("|");
  if (signature && signature === melonArtistCatalogSignature && melonArtistCatalog.length) return;

  const candidates = [];

  function addCandidate(canonical, forms) {
    const requestedName = String(canonical || "").trim();
    if (!requestedName) return;
    const displayName = getCanonicalChartArtist(requestedName);

    let item = candidates.find(function(candidate) {
      return normalize(candidate.canonical) === normalize(displayName) ||
        areSameArtist(candidate.canonical, displayName);
    });

    if (!item) {
      item = { canonical: displayName, forms: new Set() };
      candidates.push(item);
    } else if (songs.some(function(song) {
      return song.artist && normalize(song.artist) === normalize(displayName);
    })) {
      item.canonical = displayName;
    }

    [requestedName, displayName].concat(forms || []).forEach(function(form) {
      const normalized = normalize(form);
      if (normalized) item.forms.add(normalized);
      getSearchNames(form).forEach(function(searchName) {
        const searchable = normalize(searchName);
        if (searchable) item.forms.add(searchable);
      });
    });
  }

  Array.from(new Set(songs.map(function(song) { return song.artist; }).filter(Boolean)))
    .forEach(function(artist) {
      addCandidate(artist, [artist].concat(getSearchNames(artist)));
    });

  Object.entries(artistAliases).forEach(function(entry) {
    const name = entry[0];
    const aliases = entry[1] || [];
    const bareName = name.replace(/\s*\([^()]*\)\s*/g, " ").trim();
    addCandidate(name, [bareName].concat(getParenthesizedNames(name), aliases, getSearchNames(name)));
  });

  melonArtistCatalog = candidates.map(function(item) {
    return { canonical: item.canonical, forms: Array.from(item.forms) };
  });
  melonArtistCatalogSignature = signature;
}

function resolveKnownMelonArtist(query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return "";

  const match = melonArtistCatalog.find(function(item) {
    return item.forms.indexOf(normalizedQuery) !== -1;
  });
  return match ? match.canonical : "";
}



function updateAccountMenuLabel() {
  if (!accountLinkLabel) return;
  const hasUser = !!(window.MonitorStore && MonitorStore.getUser());
  const ready = !!(window.MonitorStore && MonitorStore.isReady());
  const nickname = ready ? MonitorStore.getNickname() : "";
  accountLinkLabel.textContent = !hasUser
    ? "로그인 / 회원가입"
    : (ready ? (nickname || "내 계정") : "닉네임 설정하기");
}

function findFavoriteArtistMatches(query) {
  const q = normalize(String(query || "").trim());
  if (!q) return [];
  const seen = new Set();
  return melonArtistCatalog
    .filter(item => item.forms.some(form => form.includes(q)))
    .map(item => item.canonical)
    .filter(name => {
      const key = normalize(name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.localeCompare(b, "ko"))
    .slice(0, 8);
}

function renderFavoriteSearchResults() {
  if (!favoriteInput || !favoriteSearchResults) return;
  const query = favoriteInput.value.trim();
  favoriteSearchResults.innerHTML = "";
  selectedFavoriteArtist = "";
  if (favoriteAddButton) favoriteAddButton.disabled = true;

  if (!query) {
    favoriteSearchResults.hidden = true;
    favoriteInput.setAttribute("aria-expanded", "false");
    return;
  }

  const matches = findFavoriteArtistMatches(query);
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "favorite-search-empty";
    empty.textContent = "검색 결과가 없어요. 아티스트 이름을 다시 확인해 주세요.";
    favoriteSearchResults.appendChild(empty);
    favoriteSearchResults.hidden = false;
    favoriteInput.setAttribute("aria-expanded", "true");
    return;
  }

  matches.forEach(artist => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "favorite-search-option";
    option.setAttribute("role", "option");
    option.textContent = artist;
    option.addEventListener("click", () => {
      selectedFavoriteArtist = artist;
      favoriteInput.value = artist;
      favoriteSearchResults.innerHTML = "";
      const chosen = document.createElement("div");
      chosen.className = "favorite-search-selected";
      chosen.textContent = "선택됨: " + artist;
      favoriteSearchResults.appendChild(chosen);
      favoriteSearchResults.hidden = false;
      favoriteInput.setAttribute("aria-expanded", "false");
      if (favoriteAddButton) favoriteAddButton.disabled = false;
      if (favoritesNote) favoritesNote.textContent = "선택한 아티스트를 추가할 수 있어요.";
    });
    favoriteSearchResults.appendChild(option);
  });
  favoriteSearchResults.hidden = false;
  favoriteInput.setAttribute("aria-expanded", "true");
}

async function loadArtistCatalog() {
  let data = null;
  try {
    const config = window.MELONITOR_SUPABASE_CONFIG || {};
    if (config.projectUrl && config.publishableKey) {
      const response = await fetch("/api/melon-chart", {
        headers: { apikey: config.publishableKey },
        cache: "no-store"
      });
      if (response.ok) data = await response.json();
    }
  } catch (error) {
    console.warn("최신 아티스트 목록을 불러오지 못했어요:", error);
  }

  if (!data || !Array.isArray(data.songs) || data.songs.length !== 100) {
    try {
      const response = await fetch("./chart.json?favorites=" + Date.now(), { cache: "no-store" });
      if (response.ok) data = await response.json();
    } catch (error) {
      console.warn("저장된 아티스트 목록을 불러오지 못했어요:", error);
    }
  }
  songs = data && Array.isArray(data.songs) ? canonicalizeChartSongs(data.songs) : [];
  buildMelonArtistCatalog();
}

function updateAccessView() {
  const ready = !!(window.MonitorStore && MonitorStore.isReady());
  updateAccountMenuLabel();
  if (favoritesLoginGate) favoritesLoginGate.hidden = ready;
  if (favoriteForm) favoriteForm.hidden = !ready;
  if (favoriteArtists) favoriteArtists.hidden = !ready;

  if (!ready) {
    if (favoriteSearchResults) favoriteSearchResults.hidden = true;
    if (favoritesNote) favoritesNote.textContent = "좋아하는 아티스트 목록을 보거나 수정하려면 이메일 인증과 계정 설정을 완료하고 로그인해 주세요.";
  }
  return ready;
}

async function renderFavorites() {
  if (!favoriteArtists || !window.MonitorStore || !MonitorStore.isReady()) return;
  favoriteArtists.innerHTML = "";
  let names = [];
  try {
    names = await MonitorStore.getFavorites();
  } catch (error) {
    console.warn("즐겨찾기를 불러오지 못했습니다:", error);
  }

  // 예전에 다른 표기로 저장된 같은 아티스트도 한 개의 즐겨찾기로 묶습니다.
  const groups = [];
  names.forEach(function(storedName) {
    const canonical = getCanonicalPopularArtist(storedName);
    const key = normalize(canonical);
    if (!key) return;
    const existing = groups.find(function(group) {
      return normalize(group.canonical) === key || areSameArtist(group.canonical, canonical);
    });
    if (existing) {
      if (!existing.storedNames.includes(storedName)) existing.storedNames.push(storedName);
      // 멜론 차트에 존재하는 아티스트명은 항상 그 표기를 대표 이름으로 유지합니다.
      const chartName = getCanonicalChartArtist(canonical);
      if (songs.some(song => normalize(song.artist) === normalize(chartName))) existing.canonical = chartName;
    } else {
      groups.push({ canonical: getCanonicalChartArtist(canonical), storedNames: [storedName] });
    }
  });

  if (favoritesNote) {
    favoritesNote.textContent = groups.length
      ? "계정에 저장된 즐겨찾기예요. 아티스트를 누르면 해당 아티스트의 차트로 이동합니다."
      : "아직 등록한 아티스트가 없어요. 위에서 좋아하는 아티스트를 검색해 추가해 보세요.";
  }

  groups.forEach(group => {
    const artist = group.canonical;
    const wrap = document.createElement("span");
    wrap.className = "favorite-item";

    const open = document.createElement("button");
    open.className = "chip favorite-chip";
    open.type = "button";
    open.textContent = artist;
    open.title = artist + " 멜론차트 검색";
    open.addEventListener("click", () => {
      window.location.href = "/html/?artist=" + encodeURIComponent(artist);
    });

    const remove = document.createElement("button");
    remove.className = "favorite-remove";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", artist + " 즐겨찾기 삭제");
    remove.title = "즐겨찾기에서 삭제";
    remove.addEventListener("click", async () => {
      remove.disabled = true;
      const results = await Promise.all(group.storedNames.map(name => MonitorStore.removeFavorite(name)));
      if (results.every(result => result && result.ok)) {
        await renderFavorites();
      } else {
        remove.disabled = false;
        if (favoritesNote) favoritesNote.textContent = "일부 항목을 삭제하지 못했어요. 다시 시도해 주세요.";
      }
    });

    wrap.appendChild(open);
    wrap.appendChild(remove);
    favoriteArtists.appendChild(wrap);
  });
}

if (favoriteInput) {
  favoriteInput.addEventListener("compositionstart", () => { favoriteSearchComposing = true; });
  favoriteInput.addEventListener("compositionend", () => {
    favoriteSearchComposing = false;
    renderFavoriteSearchResults();
  });
  favoriteInput.addEventListener("input", event => {
    if (favoriteSearchComposing || event.isComposing) return;
    renderFavoriteSearchResults();
  });
}

if (favoriteForm) {
  favoriteForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!selectedFavoriteArtist) {
      if (favoritesNote) favoritesNote.textContent = "먼저 검색 결과에서 아티스트를 선택해 주세요.";
      renderFavoriteSearchResults();
      return;
    }

    const artist = selectedFavoriteArtist;
    favoriteAddButton.disabled = true;
    const result = await MonitorStore.addFavorite(artist);
    if (favoriteInput) favoriteInput.value = "";
    selectedFavoriteArtist = "";
    if (favoriteSearchResults) {
      favoriteSearchResults.innerHTML = "";
      favoriteSearchResults.hidden = true;
    }

    if (result && result.ok) {
      await renderFavorites();
      if (favoritesNote) favoritesNote.textContent = "좋아하는 아티스트에 추가했어요.";
    } else {
      if (favoritesNote) favoritesNote.textContent = "추가하지 못했어요. 로그인 상태를 확인하고 다시 시도해 주세요.";
    }
    favoriteAddButton.disabled = false;
  });
}

async function initializeFavoritesPage() {
  if (window.MonitorStore) {
    try {
      await MonitorStore.init();
    } catch (error) {
      console.warn("계정 상태를 확인하지 못했습니다:", error);
    }
  }

  const ready = updateAccessView();
  if (ready) {
    if (favoritesNote) favoritesNote.textContent = "아티스트 목록을 불러오는 중이에요...";
    await loadArtistCatalog();
    await renderFavorites();
  }
}

window.addEventListener("melonitor-auth-change", async () => {
  const ready = updateAccessView();
  if (ready) {
    await loadArtistCatalog();
    await renderFavorites();
  }
});

initializeFavoritesPage();
