// 즐겨찾기 전용 페이지 로직: Melonitor 홈과 같은 계정 저장소를 사용합니다.
const favoriteInput = document.getElementById("favoriteInput");
const favoriteForm = document.getElementById("favoriteForm");
const favoriteAddButton = document.getElementById("favoriteAddButton");
const favoriteSearchResults = document.getElementById("favoriteSearchResults");
const favoriteArtists = document.getElementById("favoriteArtists");
const favoritesNote = document.getElementById("favoritesNote");
const favoritesLoginGate = document.getElementById("favoritesLoginGate");
const accountLinkLabel = document.getElementById("accountLinkLabel");
const rankGraphColorInput = document.getElementById("rankGraphColor");
const rankGraphColorValue = document.getElementById("rankGraphColorValue");
const rankHistoryStatus = document.getElementById("rankHistoryStatus");
const rankGraphRangeSelect = document.getElementById("rankGraphRange");

let rankHistorySnapshots = [];
let songs = [];
let melonArtistCatalog = [];
let melonArtistCatalogSignature = "";
let selectedFavoriteArtist = "";
let favoriteArtistNames = [];
let favoritesRenderVersion = 0;
const selectedSongArtists = new Set();
const FAVORITE_SONG_COLORS_KEY = "melonitor-favorite-song-colors-v1";
const FAVORITE_SONG_HISTORY_KEY = "melonitor-chart-song-history-v1";
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

const searchNamesCache = new Map();
const aliasClosureCache = new Map();

function getSearchNames(artist) {
  const cacheKey = String(artist || "");
  if (searchNamesCache.has(cacheKey)) return searchNamesCache.get(cacheKey);

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

  const result = Array.from(new Set(names.filter(Boolean)));
  searchNamesCache.set(cacheKey, result);
  return result;
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

  // Alias groups are static, so reuse each artist's transitive alias set.
  // This avoids scanning the full alias table for every song comparison.
  return aTokens.some(function(token) {
    const aliases = getAliasClosure(token);
    return bTokens.some(function(other) {
      return token === other || aliases.has(other);
    });
  });
}

function getAliasClosure(value) {
  const cacheKey = normalize(value);
  if (aliasClosureCache.has(cacheKey)) return aliasClosureCache.get(cacheKey);

  const knownForms = new Set([cacheKey]);
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

  aliasClosureCache.set(cacheKey, knownForms);
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
  accountLinkLabel.textContent = hasUser
    ? "설정"
    : "로그인 / 회원가입";
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

function saveFavoriteChartSnapshot() {
  if (!Array.isArray(songs) || songs.length !== 100) return;
  const snapshotSongs = songs.map(function(song) {
    return {
      title: String(song.title || ""),
      artist: String(song.artist || ""),
      rank: Number(song.rank) || 0,
      album: String(song.album || ""),
      album_image: String(song.album_image || "")
    };
  }).filter(function(song) { return song.title && song.artist && song.rank > 0; });
  if (!snapshotSongs.length) return;
  const fingerprint = snapshotSongs.map(favoriteSongKey).join(";");
  let snapshots = [];
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITE_SONG_HISTORY_KEY) || "[]");
    if (Array.isArray(saved)) snapshots = saved.filter(function(snapshot) {
      return snapshot && Array.isArray(snapshot.songs) && Number(snapshot.capturedAt) > Date.now() - 7 * 24 * 60 * 60 * 1000;
    });
  } catch (_) {}
  const latest = snapshots.length ? snapshots[snapshots.length - 1] : null;
  const latestFingerprint = latest ? latest.songs.map(favoriteSongKey).join(";") : "";
  if (fingerprint === latestFingerprint) return;
  snapshots.push({ capturedAt: Date.now(), songs: snapshotSongs });
  try {
    localStorage.setItem(FAVORITE_SONG_HISTORY_KEY, JSON.stringify(snapshots.slice(-48)));
  } catch (error) {
    console.warn("차트 순위 기록을 저장하지 못했어요:", error);
  }
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
  saveFavoriteChartSnapshot();
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

function getRankGraphColorStorageKey() {
  const user = window.MonitorStore && MonitorStore.getUser();
  return "melonitor-test-rank-graph-color-" + (user && user.id ? user.id : "guest");
}

function loadSavedRankGraphColor() {
  if (!rankGraphColorInput) return;
  let color = "#168a35";
  try {
    const saved = localStorage.getItem(getRankGraphColorStorageKey()) || "";
    if (/^#[0-9a-f]{6}$/i.test(saved)) color = saved;
  } catch (_) {}
  rankGraphColorInput.value = color;
  if (rankGraphColorValue) rankGraphColorValue.textContent = color.toUpperCase();
}

async function loadRankHistory() {
  const requestedHours = Number(rankGraphRangeSelect && rankGraphRangeSelect.value || 24);
  const hours = Number.isFinite(requestedHours) ? Math.max(1, Math.min(8760, requestedHours)) : 24;
  if (rankHistoryStatus) rankHistoryStatus.textContent = "선택한 기간의 순위 기록을 불러오는 중...";
  try {
    const config = window.MELONITOR_SUPABASE_CONFIG || {};
    if (!config.projectUrl || !config.publishableKey) throw new Error("차트 서버 설정을 찾을 수 없어요.");
    const url = new URL("/api/melon-chart", window.location.origin);
    url.searchParams.set("history", "1");
    url.searchParams.set("hours", String(hours));
    const response = await fetch(url.toString(), {
      headers: { apikey: config.publishableKey },
      cache: "no-store"
    });
    if (!response.ok) {
      let detail = "";
      try { detail = (await response.json()).error || ""; } catch (_) {}
      throw new Error(detail || "순위 기록 서버에 연결하지 못했어요.");
    }
    const payload = await response.json();
    rankHistorySnapshots = Array.isArray(payload.snapshots) ? payload.snapshots : [];
    if (rankHistoryStatus) {
      if (!rankHistorySnapshots.length) {
        rankHistoryStatus.textContent = "순위 기록을 모으는 중이에요. 첫 기록이 저장된 뒤 그래프가 표시됩니다.";
      } else {
        rankHistoryStatus.textContent = "선택한 기간 · " + rankHistorySnapshots.length + "회 서버 기록";
      }
    }
  } catch (error) {
    rankHistorySnapshots = [];
    if (rankHistoryStatus) {
      rankHistoryStatus.textContent = "순위 기록을 불러오지 못했어요. 잠시 후 다시 열어 주세요.";
    }
    console.warn("순위 기록을 불러오지 못했습니다:", error);
  }
}

function getCurrentArtistRank(artist) {
  const matched = songs.filter(function(song) {
    return song.artist && (normalize(song.artist) === normalize(artist) || areSameArtist(song.artist, artist));
  }).sort(function(a, b) { return Number(a.rank) - Number(b.rank); });
  return matched.length ? { rank: Number(matched[0].rank), title: matched[0].title } : null;
}

function getArtistRankInSnapshot(snapshot, artist) {
  const entries = Array.isArray(snapshot && snapshot.artist_ranks) ? snapshot.artist_ranks : [];
  const matches = entries.filter(function(entry) {
    return entry && entry.artist && (normalize(entry.artist) === normalize(artist) || areSameArtist(entry.artist, artist));
  }).sort(function(a, b) { return Number(a.rank) - Number(b.rank); });
  return matches.length ? Number(matches[0].rank) : null;
}

function createArtistRankGraph(artist, color) {
  const wrapper = document.createElement("div");
  wrapper.className = "rank-graph-wrap";
  const rangeSelect = document.getElementById("rankGraphRange");
  const period = String(rangeSelect && rangeSelect.value || "24");
  const hourly = period === "24";
  const now = new Date();
  const width = 1000, height = 620, left = 72, right = 984, top = 28, bottom = 560;
  const y = rank => top + (Math.max(1, Math.min(100, Number(rank) || 100)) - 1) / 99 * (bottom - top);
  const artistSongMap = new Map();
  const addArtistSong = (entry, entryArtist, rank) => {
    const songArtist = String(entryArtist || entry && entry.artist || "").trim();
    if (!entry || !entry.title || !songArtist ||
        !(normalize(songArtist) === normalize(artist) || areSameArtist(songArtist, artist))) return;
    const key = normalize(entry.title) + "|" + normalize(songArtist);
    const existing = artistSongMap.get(key);
    const currentRank = Number(rank ?? entry.rank);
    artistSongMap.set(key, {
      title: entry.title,
      artist: songArtist,
      album: entry.album || (existing && existing.album) || "",
      rank: Number.isFinite(currentRank) ? currentRank : (existing ? existing.rank : 101)
    });
  };
  // 홈의 현재 TOP100 데이터도 그래프 곡 목록에 포함합니다.
  songs.forEach(song => addArtistSong(song, song.artist, song.rank));
  // 홈에서 저장한 순위 스냅샷은 아티스트별 songs 배열에 곡별 rank를 담습니다.
  // 과거 구형 스냅샷의 대표곡 형식도 함께 지원합니다.
  rankHistorySnapshots.forEach(snapshot => {
    (Array.isArray(snapshot && snapshot.artist_ranks) ? snapshot.artist_ranks : [])
      .forEach(entry => {
        const entryArtist = String(entry && entry.artist || "").trim();
        if (Array.isArray(entry && entry.songs)) {
          entry.songs.forEach(song => addArtistSong(song, entryArtist, song && song.rank));
        }
        if (entry && entry.title) addArtistSong(entry, entryArtist, entry.rank);
      });
  });
  const artistSongs = Array.from(artistSongMap.values()).sort((a, b) => Number(a.rank) - Number(b.rank));
  if (!artistSongs.length) {
    const empty = document.createElement("p");
    empty.className = "rank-graph-empty";
    empty.textContent = "현재 TOP100에 해당 아티스트 곡이 없어요.";
    wrapper.appendChild(empty);
    return wrapper;
  }

  const infoPopup = document.createElement("div");
  infoPopup.className = "rank-song-info-popup";
  infoPopup.hidden = true;
  wrapper.appendChild(infoPopup);
  const closeSongInfo = () => {
    infoPopup.hidden = true;
    infoPopup.replaceChildren();
  };
  const showSongInfo = (song, point, dot) => {
    infoPopup.replaceChildren();
    const songTitle = document.createElement("strong");
    songTitle.className = "rank-song-info-title";
    songTitle.textContent = song.title || "곡 정보 없음";
    const header = document.createElement("div");
    header.className = "rank-song-info-header";
    const artistName = document.createElement("span");
    artistName.className = "rank-song-info-artist";
    artistName.textContent = song.artist || artist;
    const rankLabel = document.createElement("span");
    rankLabel.className = "rank-song-info-current";
    rankLabel.textContent = String(point.rank) + "위";
    header.append(artistName, rankLabel);
    const album = document.createElement("div");
    album.className = "rank-song-info-album";
    album.textContent = song.album || "앨범 정보 없음";
    const footer = document.createElement("div");
    footer.className = "rank-song-info-footer";
    const trophy = document.createElement("span");
    trophy.textContent = "🏆";
    const rankText = document.createElement("strong");
    rankText.textContent = "순위: " + point.rank + "위";
    const timeText = document.createElement("small");
    const kstHour = new Date(point.ts + 9 * 60 * 60 * 1000).getUTCHours();
    timeText.textContent = String(kstHour).padStart(2, "0") + "시 기준";
    footer.append(trophy, rankText, timeText);
    infoPopup.append(header, songTitle, album, footer);
    infoPopup.hidden = false;
    const svgRect = svg.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const popupWidth = 210;
    const scaleX = svgRect.width / width;
    const scaleY = svgRect.height / height;
    const pointX = svgRect.left - wrapperRect.left + point.x * scaleX;
    const pointY = svgRect.top - wrapperRect.top + y(point.rank) * scaleY;
    let left = pointX + 14;
    let top = pointY - 42;
    if (left + popupWidth > wrapper.clientWidth - 8) left = pointX - popupWidth - 14;
    left = Math.max(8, Math.min(left, wrapper.clientWidth - popupWidth - 8));
    top = Math.max(8, Math.min(top, wrapper.clientHeight - infoPopup.offsetHeight - 8));
    infoPopup.style.left = left + "px";
    infoPopup.style.top = top + "px";
    infoPopup.setAttribute("role", "status");
    infoPopup.setAttribute("aria-live", "polite");
    wrapper.querySelectorAll(".rank-graph-point.is-selected").forEach(item => item.classList.remove("is-selected"));
    dot.classList.add("is-selected");
  };

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "rank-graph");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", artist + "의 곡별 시간 순위 그래프");
  [1,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100].forEach(rank => {
    const yy = y(rank), line = document.createElementNS(svg.namespaceURI, "line");
    line.setAttribute("x1", left); line.setAttribute("x2", right);
    line.setAttribute("y1", yy); line.setAttribute("y2", yy);
    line.setAttribute("class", "rank-graph-grid"); svg.appendChild(line);
    const label = document.createElementNS(svg.namespaceURI, "text");
    label.setAttribute("x", "0"); label.setAttribute("y", yy - 2);
    label.setAttribute("class", "rank-graph-axis-label");
    label.textContent = rank + "위"; svg.appendChild(label);
  });

  const palette = ["#00D5E8","#4386F7","#FFD400","#F36AA8","#9B7BFF","#FF8A3D","#36C275","#F06B5D","#8BABC9","#D77CE5"];
  const snapshots = rankHistorySnapshots.map(snapshot => ({
    ts: Date.parse(snapshot && snapshot.snapshot_at || ""),
    snapshot
  })).filter(item => Number.isFinite(item.ts) && item.ts <= now.getTime())
    .sort((a, b) => a.ts - b.ts);
  const songRankInSnapshot = (snapshot, song) => {
    // 홈 순위 기록은 아티스트별 묶음이 아니라 TOP100 곡 한 곡당
    // { rank, title, artist } 항목으로 저장됩니다. 전체 행에서 곡을 찾아야
    // 모든 아티스트가 동일한 홈 기록을 그래프에 사용할 수 있습니다.
    const entries = Array.isArray(snapshot && snapshot.artist_ranks) ? snapshot.artist_ranks : [];
    const songEntry = entries.find(entry => entry && entry.title && entry.artist &&
      normalize(entry.title) === normalize(song.title) &&
      (normalize(entry.artist) === normalize(song.artist) || areSameArtist(entry.artist, song.artist)));
    const rank = songEntry ? Number(songEntry.rank) : NaN;
    return Number.isFinite(rank) && rank >= 1 && rank <= 100 ? rank : null;
  };
  const graphColor = /^#[0-9a-f]{6}$/i.test(String(color || "")) ? color : "#168a35";
  const kstOffset = 9 * 3600000;
  const kstNow = new Date(now.getTime() + kstOffset);
  const kstMidnight = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - kstOffset;
  const dayStart = hourly ? kstMidnight : now.getTime() - Math.max(1, Math.min(8760, Number(period) || 24)) * 3600000;
  const graphEnd = hourly ? kstMidnight + 24 * 3600000 : now.getTime();
  const paletteForSong = song => {
    const idx = artistSongs.indexOf(song);
    return palette[idx % palette.length] || graphColor;
  };

  artistSongs.forEach(song => {
    const points = [];
    const relevant = snapshots.filter(item => item.ts >= dayStart && item.ts <= now.getTime());
    if (hourly) {
      // Keep the latest real snapshot in each KST hour so 16시 and 17시
      // become separate points once both hours have a record.
      const byHour = new Map();
      relevant.forEach(item => {
        const kst = new Date(item.ts + kstOffset);
        const hour = kst.getUTCHours();
        const rank = songRankInSnapshot(item.snapshot, song);
        if (rank === null) return;
        const prior = byHour.get(hour);
        if (!prior || item.ts > prior.ts) byHour.set(hour, { rank, ts: item.ts, hour });
      });
      byHour.forEach(point => {
        point.x = left + point.hour / 23 * (right - left);
        points.push(point);
      });
      const currentRank = Number(song.rank);
      const currentHour = kstNow.getUTCHours();
      if (Number.isFinite(currentRank) && currentRank >= 1 && currentRank <= 100) {
        const prior = byHour.get(currentHour);
        if (!prior || now.getTime() > prior.ts) {
          points.push({ x: left + currentHour / 23 * (right - left), rank: currentRank, ts: now.getTime(), hour: currentHour });
        }
      }
      points.sort((a, b) => a.ts - b.ts);
    } else {
      relevant.forEach(item => {
        const rank = songRankInSnapshot(item.snapshot, song);
        if (rank === null) return;
        const x = left + (item.ts - dayStart) / (graphEnd - dayStart || 1) * (right - left);
        points.push({ x, rank, ts: item.ts });
      });
      const currentRank = Number(song.rank);
      if (Number.isFinite(currentRank) && currentRank >= 1 && currentRank <= 100 &&
          now.getTime() >= dayStart && now.getTime() <= graphEnd) {
        const latestPoint = points[points.length - 1];
        if (!latestPoint || now.getTime() - latestPoint.ts > 60 * 1000) {
          const x = left + (now.getTime() - dayStart) / (graphEnd - dayStart || 1) * (right - left);
          points.push({ x, rank: currentRank, ts: now.getTime() });
        }
      }
    }
    const songColor = paletteForSong(song);
    const line = document.createElementNS(svg.namespaceURI, "polyline");
    line.setAttribute("fill", "none"); line.setAttribute("stroke", songColor);
    line.setAttribute("stroke-width", "2.2"); line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");
    line.setAttribute("points", points.map(point => point.x.toFixed(2) + "," + y(point.rank).toFixed(2)).join(" "));
    svg.appendChild(line);
    points.forEach(point => {
      const dot = document.createElementNS(svg.namespaceURI, "circle");
      dot.setAttribute("cx", point.x); dot.setAttribute("cy", y(point.rank));
      dot.setAttribute("r", "3"); dot.setAttribute("fill", songColor);
      const title = document.createElementNS(svg.namespaceURI, "title");
      title.textContent = song.title + " · #" + point.rank + " · " + new Date(point.ts).toLocaleString("ko-KR");
      dot.appendChild(title);
      dot.style.cursor = "pointer";
      dot.setAttribute("tabindex", "0");
      dot.setAttribute("role", "button");
      const showPointInfo = () => showSongInfo(song, point, dot);
      dot.classList.add("rank-graph-point");
      dot.addEventListener("mouseenter", () => showPointInfo());
      dot.addEventListener("mouseleave", () => closeSongInfo());
      dot.addEventListener("focus", () => showPointInfo());
      dot.addEventListener("blur", () => closeSongInfo());
      dot.addEventListener("click", event => {
        event.stopPropagation();
        showPointInfo();
      });
      dot.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showPointInfo(); }
      });
      svg.appendChild(dot);
    });
  });

  if (hourly) {
    for (let hour = 0; hour < 24; hour++) {
      const label = document.createElementNS(svg.namespaceURI, "text");
      label.setAttribute("x", left + hour / 23 * (right - left));
      label.setAttribute("y", bottom + 22); label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "rank-graph-axis-label");
      label.textContent = String(hour).padStart(2, "0") + "시";
      svg.appendChild(label);
    }
  }
  wrapper.appendChild(svg);
  const legend = document.createElement("div");
  legend.className = "rank-graph-time-labels rank-song-graph-legend";
  legend.style.cssText = "display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px 16px;margin-top:12px;padding:8px 12px;";
  artistSongs.forEach(song => {
    const item = document.createElement("span");
    item.textContent = "● " + song.title;
    item.style.cssText = "color:" + paletteForSong(song) + ";white-space:nowrap;";
    legend.appendChild(item);
  });
  wrapper.appendChild(legend);
  return wrapper;
}
function favoriteSongKey(song) {
  return normalize(song && song.title) + "|" + normalize(song && song.artist);
}

async function syncAccountColorPreferences() {
  if (!window.MonitorStore || !MonitorStore.isReady() ||
      typeof MonitorStore.getColorPreferences !== "function" ||
      typeof MonitorStore.saveColorPreferences !== "function") return;

  const localSongColors = getFavoriteSongColors();
  let localGraphColor = "";
  try { localGraphColor = localStorage.getItem(getRankGraphColorStorageKey()) || ""; } catch (_) {}
  const remote = await MonitorStore.getColorPreferences();
  const remoteColors = remote && remote.favorite_song_colors &&
    typeof remote.favorite_song_colors === "object" && !Array.isArray(remote.favorite_song_colors)
    ? remote.favorite_song_colors : {};
  // Keep browser-only song colors that haven't been uploaded yet; account values win on conflicts.
  const mergedColors = Object.assign({}, localSongColors, remoteColors);
  const graphColor = remote && /^#[0-9a-f]{6}$/i.test(remote.rank_graph_color || "")
    ? remote.rank_graph_color.toUpperCase()
    : (/^#[0-9a-f]{6}$/i.test(localGraphColor) ? localGraphColor.toUpperCase() : "#168A35");

  try { localStorage.setItem(FAVORITE_SONG_COLORS_KEY, JSON.stringify(mergedColors)); } catch (_) {}
  try { localStorage.setItem(getRankGraphColorStorageKey(), graphColor); } catch (_) {}
  if (!remote || Object.keys(mergedColors).length !== Object.keys(remoteColors).length ||
      Object.keys(localSongColors).some(key => !Object.prototype.hasOwnProperty.call(remoteColors, key)) ||
      !/^#[0-9a-f]{6}$/i.test(remote.rank_graph_color || "")) {
    await MonitorStore.saveColorPreferences({
      favorite_song_colors: mergedColors,
      rank_graph_color: graphColor
    });
  }
  if (rankGraphColorInput) rankGraphColorInput.value = graphColor;
  if (rankGraphColorValue) rankGraphColorValue.textContent = graphColor;
}

function getFavoriteSongColors() {
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITE_SONG_COLORS_KEY) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch (_) {
    return {};
  }
}

function getFavoriteSongsWithRecentHistory() {
  const currentKeys = new Set(songs.map(favoriteSongKey));
  const recent = new Map();
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let snapshots = [];
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITE_SONG_HISTORY_KEY) || "[]");
    if (Array.isArray(saved)) snapshots = saved.filter(function(snapshot) {
      return snapshot && Number(snapshot.capturedAt) >= cutoff && Array.isArray(snapshot.songs);
    }).sort(function(a, b) { return Number(a.capturedAt) - Number(b.capturedAt); });
  } catch (_) {}
  const latest = snapshots.length ? snapshots[snapshots.length - 1] : null;
  const beforeLatest = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;
  const latestKeys = new Set(latest ? latest.songs.map(favoriteSongKey) : []);
  const previousKeys = new Set(beforeLatest ? beforeLatest.songs.map(favoriteSongKey) : []);
  const currentSongs = songs.map(function(song) {
    const key = favoriteSongKey(song);
    return Object.assign({}, song, {
      chartIn: !!latest && !!beforeLatest && latestKeys.has(key) && !previousKeys.has(key)
    });
  });
  snapshots.forEach(function(snapshot) {
    snapshot.songs.forEach(function(song) {
      const key = favoriteSongKey(song);
      if (!key || currentKeys.has(key)) return;
      const previous = recent.get(key);
      if (!previous || Number(snapshot.capturedAt) > previous.lastSeenAt) {
        recent.set(key, Object.assign({}, song, {
          chartOut: true,
          lastRank: Number(song.rank) || 0,
          lastSeenAt: Number(snapshot.capturedAt)
        }));
      }
    });
  });
  return currentSongs.concat(Array.from(recent.values()));
}


const FAVORITE_ARTIST_GRAPH_COLORS_KEY = "melonitor-favorite-artist-graph-colors-v1";
const FAVORITE_GRAPH_PALETTE = ["#00D5E8", "#4386F7", "#FFD400", "#F36AA8", "#9B7BFF", "#FF8A3D"];
function getFavoriteArtistGraphColors() { try { const value=JSON.parse(localStorage.getItem(FAVORITE_ARTIST_GRAPH_COLORS_KEY)||"{}"); return value&&typeof value==="object"?value:{}; } catch (_) { return {}; } }
function getFavoriteArtistGraphColor(artist,index) { const colors=getFavoriteArtistGraphColors(); const saved=colors[normalize(artist)]; return /^#[0-9a-f]{6}$/i.test(saved||"")?saved.toUpperCase():FAVORITE_GRAPH_PALETTE[index%FAVORITE_GRAPH_PALETTE.length]; }

function renderFavoriteSongExplorer() {
  const explorer = document.getElementById("favoriteSongExplorer");
  const checkboxWrap = document.getElementById("favoriteArtistCheckboxes");
  const list = document.getElementById("favoriteSongsList");
  if (!explorer || !checkboxWrap || !list) return;
  explorer.hidden = !favoriteArtistNames.length;
  checkboxWrap.replaceChildren();
  list.replaceChildren();
  if (!favoriteArtistNames.length) return;

  favoriteArtistNames.forEach(function(artist) {
    const label = document.createElement("label");
    label.className = "favorite-artist-checkbox";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = artist;
    checkbox.checked = selectedSongArtists.has(artist);
    checkbox.addEventListener("change", function() {
      if (checkbox.checked) selectedSongArtists.add(artist);
      else selectedSongArtists.delete(artist);
      renderFavoriteSongList();
      renderFavoriteRankGraphs();
    });
    const text = document.createElement("span");
    text.textContent = artist;
    label.append(checkbox, text);
    checkboxWrap.appendChild(label);
  });
  renderFavoriteSongList();
}

function renderFavoriteSongList() {
  const list = document.getElementById("favoriteSongsList");
  if (!list) return;
  list.replaceChildren();
  if (!selectedSongArtists.size) {
    const note = document.createElement("p");
    note.className = "favorite-song-empty";
    note.textContent = "곡을 보려면 위에서 아티스트를 하나 이상 선택해 주세요.";
    list.appendChild(note);
    return;
  }

  const chosen = Array.from(selectedSongArtists);
  const available = getFavoriteSongsWithRecentHistory().filter(function(song) {
    return song.artist && chosen.some(function(artist) {
      return areSameArtist(song.artist, artist) || normalize(song.artist) === normalize(artist);
    });
  });
  available.sort(function(a, b) {
    if (!!a.chartOut !== !!b.chartOut) return a.chartOut ? 1 : -1;
    return (Number(a.rank) || Number(a.lastRank) || 999) - (Number(b.rank) || Number(b.lastRank) || 999);
  });
  if (!available.length) {
    const note = document.createElement("p");
    note.className = "favorite-song-empty";
    note.textContent = "선택한 아티스트의 현재 차트 곡이나 최근 7일 기록이 없어요.";
    list.appendChild(note);
    return;
  }

  const colors = getFavoriteSongColors();
  available.forEach(function(song) {
    const key = favoriteSongKey(song);
    const row = document.createElement("article");
    row.className = "song favorite-chart-song";

    const rank = document.createElement("div");
    rank.className = "rank";
    rank.textContent = song.chartOut ? String(song.lastRank || song.rank || "?") : String(song.rank || "?");

    const change = document.createElement("div");
    change.className = "change";
    if (song.chartOut) {
      change.classList.add("down");
      change.textContent = "▼ OUT";
    } else if (song.chartIn) {
      change.classList.add("up");
      change.textContent = "▲ IN";
    } else {
      const amount = Number(song.change) || 0;
      change.textContent = amount > 0 ? "▲ " + amount : amount < 0 ? "▼ " + Math.abs(amount) : "-";
      change.classList.add(amount > 0 ? "up" : amount < 0 ? "down" : "same");
    }

    const image = document.createElement("img");
    image.className = "album-image";
    image.alt = song.title ? song.title + " 앨범아트" : "앨범아트";
    image.loading = "lazy";
    if (song.album_image) {
      image.src = song.album_image;
    } else {
      image.style.visibility = "hidden";
    }

    const details = document.createElement("div");
    details.className = "song-info";
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = song.title || "제목 없음";
    const artist = document.createElement("div");
    artist.className = "artist";
    artist.textContent = song.artist || "";
    const album = document.createElement("div");
    album.className = "album";
    album.textContent = song.chartOut
      ? (song.album || "") + (song.album ? " · " : "") + "최근 7일 차트 이탈"
      : (song.album || "");
    details.append(title, artist, album);

    // Keep the existing per-song color preference available in the matching chart row.
    const colorControl = document.createElement("input");
    colorControl.type = "color";
    colorControl.className = "favorite-chart-song-color";
    colorControl.value = colors[key] || "#168a35";
    colorControl.title = "이 곡의 색상 변경";
    colorControl.setAttribute("aria-label", (song.title || "곡") + " 색상 선택");
    function persistSongColor() {
      const next = getFavoriteSongColors();
      next[key] = colorControl.value.toUpperCase();
      try { localStorage.setItem(FAVORITE_SONG_COLORS_KEY, JSON.stringify(next)); } catch (_) {}
      if (window.MonitorStore && MonitorStore.isReady() && typeof MonitorStore.saveColorPreferences === "function") {
        MonitorStore.saveColorPreferences({
          favorite_song_colors: getFavoriteSongColors(),
          rank_graph_color: rankGraphColorInput && /^#[0-9a-f]{6}$/i.test(rankGraphColorInput.value)
            ? rankGraphColorInput.value : "#168A35"
        });
      }
    }
    colorControl.addEventListener("change", persistSongColor);
    details.appendChild(colorControl);

    row.append(rank, change, image, details);
    list.appendChild(row);
  });
}

function renderFavoriteRankGraphs() {
  document.querySelectorAll("#favoriteArtists .favorite-rank-card").forEach(function(card) {
    const button = card.querySelector(".favorite-rank-name");
    const artist = button && button.textContent;
    card.hidden = !artist || !selectedSongArtists.has(artist);
  });
}

async function renderFavorites() {
  if (!favoriteArtists || !window.MonitorStore || !MonitorStore.isReady()) return;
  const renderVersion = ++favoritesRenderVersion;
  favoriteArtists.innerHTML = "";
  let names = [];
  try {
    names = await MonitorStore.getFavorites();
  } catch (error) {
    console.warn("즐겨찾기를 불러오지 못했습니다:", error);
  }
  // 여러 초기화/인증 이벤트가 겹쳐도 가장 마지막 렌더링만 화면에 반영합니다.
  if (renderVersion !== favoritesRenderVersion) return;

  // Merge saved aliases under one representative Melon artist name.
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
      const chartName = getCanonicalChartArtist(canonical);
      if (songs.some(song => normalize(song.artist) === normalize(chartName))) existing.canonical = chartName;
    } else {
      groups.push({ canonical: getCanonicalChartArtist(canonical), storedNames: [storedName] });
    }
  });

  groups.sort(function(a, b) {
    const aRank = getCurrentArtistRank(a.canonical);
    const bRank = getCurrentArtistRank(b.canonical);
    if (aRank && bRank) return aRank.rank - bRank.rank;
    if (aRank) return -1;
    if (bRank) return 1;
    return a.canonical.localeCompare(b.canonical, "ko");
  });
  favoriteArtistNames = groups.map(function(group) { return group.canonical; });
  favoriteArtistNames.forEach(function(artist) { selectedSongArtists.add(artist); });
  Array.from(selectedSongArtists).forEach(function(artist) {
    if (!favoriteArtistNames.includes(artist)) selectedSongArtists.delete(artist);
  });

  if (favoritesNote) {
    favoritesNote.textContent = groups.length
      ? "아티스트별 멜론 TOP100 최고 순위를 표시해요. 이름을 누르면 해당 아티스트의 곡만 볼 수 있습니다."
      : "아직 등록한 아티스트가 없어요. 위에서 좋아하는 아티스트를 검색해 추가해 보세요.";
  }

  const color = rankGraphColorInput && /^#[0-9a-f]{6}$/i.test(rankGraphColorInput.value)
    ? rankGraphColorInput.value
    : "#168a35";

  if (!groups.length) {
    const empty = document.createElement("p");
    empty.className = "rank-graph-empty favorite-list-empty";
    empty.textContent = "좋아하는 아티스트를 추가하면 순위와 그래프가 여기에 표시됩니다.";
    favoriteArtists.appendChild(empty);
    return;
  }

  groups.forEach(function(group) {
    const artist = group.canonical;
    if (!selectedSongArtists.has(artist)) return;
    const current = getCurrentArtistRank(artist);
    const card = document.createElement("article");
    card.className = "favorite-rank-card";
    card.draggable = true;
    card.dataset.artistKey = normalize(artist);
    card.title = "드래그해서 아티스트 순서를 바꿀 수 있어요.";
    card.addEventListener("dragstart", function(event) {
      draggedFavoriteArtist = card.dataset.artistKey;
      card.classList.add("is-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", draggedFavoriteArtist);
      }
    });
    card.addEventListener("dragend", function() {
      draggedFavoriteArtist = "";
      card.classList.remove("is-dragging");
      favoriteArtists.querySelectorAll(".favorite-rank-card").forEach(function(item) { item.classList.remove("is-drop-target"); });
    });
    card.addEventListener("dragover", function(event) {
      event.preventDefault();
      if (draggedFavoriteArtist && draggedFavoriteArtist !== card.dataset.artistKey) card.classList.add("is-drop-target");
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    card.addEventListener("dragleave", function() { card.classList.remove("is-drop-target"); });
    card.addEventListener("drop", function(event) {
      event.preventDefault();
      card.classList.remove("is-drop-target");
      const fromKey = draggedFavoriteArtist || (event.dataTransfer && event.dataTransfer.getData("text/plain"));
      if (!fromKey || fromKey === card.dataset.artistKey) return;
      const cards = Array.from(favoriteArtists.querySelectorAll(".favorite-rank-card"));
      const moving = cards.find(function(item) { return item.dataset.artistKey === fromKey; });
      if (!moving) return;
      const rect = card.getBoundingClientRect();
      favoriteArtists.insertBefore(moving, event.clientY > rect.top + rect.height / 2 ? card.nextSibling : card);
      const order = Array.from(favoriteArtists.querySelectorAll(".favorite-rank-card")).map(function(item) { return item.dataset.artistKey; });
      try { localStorage.setItem(FAVORITE_ARTIST_ORDER_KEY, JSON.stringify(order)); } catch (_) {}
    });

    const header = document.createElement("div");
    header.className = "favorite-rank-card-heading";

    const open = document.createElement("button");
    open.className = "favorite-rank-name";
    open.type = "button";
    open.textContent = artist;
    open.title = artist + "의 멜론 TOP100 곡만 보기";
    open.addEventListener("click", function() {
      window.location.href = "/?artist=" + encodeURIComponent(artist);
    });

    const rank = document.createElement("span");
    rank.className = "favorite-current-rank" + (current ? "" : " is-outside-chart");
    const currentSongCount = songs.filter(function(song) {
      return song.artist && (normalize(song.artist) === normalize(artist) || areSameArtist(song.artist, artist));
    }).length;
    card.classList.toggle("is-zero-song", currentSongCount === 0);
    rank.textContent = currentSongCount + "곡";

    header.appendChild(open);
    header.appendChild(rank);
    card.appendChild(header);

    const songSection = document.createElement("section");
    songSection.className = "favorite-card-songs";
    const songHeading = document.createElement("h3");
    songHeading.className = "favorite-card-songs-heading";
    songHeading.textContent = "현재 TOP100 곡 · 최근 7일 차트 이탈 곡";
    songSection.appendChild(songHeading);

    const artistSongs = getFavoriteSongsWithRecentHistory().filter(function(song) {
      return song.artist && (normalize(song.artist) === normalize(artist) || areSameArtist(song.artist, artist));
    }).sort(function(a, b) {
      if (!!a.chartOut !== !!b.chartOut) return a.chartOut ? 1 : -1;
      return (Number(a.rank) || Number(a.lastRank) || 999) - (Number(b.rank) || Number(b.lastRank) || 999);
    });

    if (!artistSongs.length) {
      const emptySongs = document.createElement("p");
      emptySongs.className = "favorite-card-songs-empty";
      emptySongs.textContent = "현재 차트 곡이나 최근 7일 기록이 없어요.";
      songSection.appendChild(emptySongs);
    } else {
      const songList = document.createElement("ul");
      songList.className = "favorite-card-song-list";
      artistSongs.forEach(function(song) {
        const item = document.createElement("li");
        item.className = song.chartOut ? "is-chart-out" : (song.chartIn ? "is-chart-in" : "");
        const rankLabel = document.createElement("span");
        rankLabel.className = "favorite-card-song-rank";
        rankLabel.textContent = String(song.chartOut ? (song.lastRank || song.rank || "?") : (song.rank || "?"));

        const movement = document.createElement("span");
        movement.className = "favorite-card-song-movement";
        if (song.chartOut) {
          movement.classList.add("down");
          movement.textContent = "▼ OUT";
        } else if (song.chartIn) {
          movement.classList.add("up");
          movement.textContent = "▲ IN";
        } else {
          const change = Number(song.change) || 0;
          movement.classList.add(change > 0 ? "up" : change < 0 ? "down" : "same");
          movement.textContent = change > 0 ? "▲ " + change : change < 0 ? "▼ " + Math.abs(change) : "-";
        }

        const albumImage = document.createElement("img");
        albumImage.className = "favorite-card-song-image";
        albumImage.alt = song.title ? song.title + " 앨범아트" : "앨범아트";
        albumImage.loading = "lazy";
        if (song.album_image) albumImage.src = song.album_image;
        else albumImage.style.visibility = "hidden";

        const details = document.createElement("span");
        details.className = "favorite-card-song-details";
        const titleLabel = document.createElement("span");
        titleLabel.className = "favorite-card-song-title";
        titleLabel.textContent = song.title || "제목 없음";
        const artistLabel = document.createElement("span");
        artistLabel.className = "favorite-card-song-artist";
        artistLabel.textContent = song.artist || "";
        const albumLabel = document.createElement("span");
        albumLabel.className = "favorite-card-song-album";
        albumLabel.textContent = song.chartOut
          ? (song.album || "") + (song.album ? " · " : "") + "최근 7일 차트 이탈"
          : (song.album || "");
        details.append(titleLabel, artistLabel, albumLabel);
        item.append(rankLabel, movement, albumImage, details);
        songList.appendChild(item);
      });
      songSection.appendChild(songList);
    }
    card.appendChild(songSection);

    const graphHeader = document.createElement("div");
    graphHeader.className = "rank-graph-heading";
    const graphTitle = document.createElement("span");
    graphTitle.textContent = "곡별 순위";
    const graphUnit = document.createElement("span");
    graphUnit.textContent = "곡마다 다른 선";
    graphHeader.appendChild(graphTitle);
    graphHeader.appendChild(graphUnit);
    card.appendChild(graphHeader);
    card.appendChild(createArtistRankGraph(artist, getFavoriteArtistGraphColor(artist, groups.indexOf(group))));

    const footer = document.createElement("div");
    footer.className = "favorite-rank-card-footer";
    const remove = document.createElement("button");
    remove.className = "favorite-remove";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", artist + " 즐겨찾기 삭제");
    remove.title = "즐겨찾기에서 삭제";
    remove.addEventListener("click", async function() {
      remove.disabled = true;
      const results = await Promise.all(group.storedNames.map(function(name) {
        return MonitorStore.removeFavorite(name);
      }));
      if (results.every(function(result) { return result && result.ok; })) {
        await renderFavorites();
      } else {
        remove.disabled = false;
        if (favoritesNote) favoritesNote.textContent = "일부 항목을 삭제하지 못했어요. 다시 시도해 주세요.";
      }
    });
    footer.appendChild(remove);
    card.appendChild(footer);
    favoriteArtists.appendChild(card);
  });
  renderFavoriteSongExplorer();
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

if (rankGraphColorInput) {
  rankGraphColorInput.addEventListener("change", function() {
    if (window.MonitorStore && MonitorStore.isReady() && typeof MonitorStore.saveColorPreferences === "function") {
      MonitorStore.saveColorPreferences({
        favorite_song_colors: getFavoriteSongColors(),
        rank_graph_color: rankGraphColorInput.value
      });
    }
  });
  rankGraphColorInput.addEventListener("input", function() {
    const color = /^#[0-9a-f]{6}$/i.test(rankGraphColorInput.value) ? rankGraphColorInput.value : "#168a35";
    try { localStorage.setItem(getRankGraphColorStorageKey(), color); } catch (_) {}
    if (rankGraphColorValue) rankGraphColorValue.textContent = color.toUpperCase();
    document.querySelectorAll(".rank-graph-line").forEach(function(line) {
      line.setAttribute("stroke", color);
    });
    document.querySelectorAll(".rank-graph-end").forEach(function(point) {
      point.setAttribute("fill", color);
    });
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
    await syncAccountColorPreferences();
    loadSavedRankGraphColor();
    if (favoritesNote) favoritesNote.textContent = "아티스트 목록을 불러오는 중이에요...";
    await loadArtistCatalog();
    await loadRankHistory();
    await renderFavorites();
  }
  window.__melonitorFavoritesPageLoaded = true;
  window.dispatchEvent(new CustomEvent("melonitor-favorites-page-loaded"));
}

window.addEventListener("melonitor-auth-change", async () => {
  const ready = updateAccessView();
  if (ready) {
    await syncAccountColorPreferences();
    loadSavedRankGraphColor();
    await loadArtistCatalog();
    await loadRankHistory();
    await renderFavorites();
  }
});

const rankGraphPeriodButtons = document.getElementById("rankGraphPeriodButtons");
if (rankGraphPeriodButtons && rankGraphRangeSelect) {
  rankGraphPeriodButtons.addEventListener("click", async function(event) {
    const button = event.target.closest("button[data-hours]");
    if (!button) return;
    rankGraphRangeSelect.value = button.dataset.hours;
    rankGraphPeriodButtons.querySelectorAll("button[data-hours]").forEach(function(item) {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", active ? "true" : "false");
    });
    await loadRankHistory();
    await renderFavorites();
  });
}

setInterval(async function() {
  if (document.visibilityState !== "visible" || !window.MonitorStore || !MonitorStore.isReady()) return;
  await loadRankHistory();
  await renderFavorites();
}, 15 * 60 * 1000);

initializeFavoritesPage();
