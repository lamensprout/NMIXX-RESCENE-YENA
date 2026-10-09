const input = document.getElementById("artistSearch");
const clearBtn = document.getElementById("clearBtn");
const results = document.getElementById("results");
const summary = document.getElementById("summary");
const updated = document.getElementById("updated");
const popular = document.getElementById("popular");
const popularNote = document.getElementById("popularNote");
const homeLink = document.getElementById("homeLink");
const template = document.getElementById("songTemplate");

let songs = [];
let popularSearches = {};
let popularityTimer = null;

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

// 이름 변경/별칭을 이용해 같은 아티스트인지 비교합니다.
// 초성만 겹쳐서 서로 다른 아티스트가 합쳐지는 것을 막기 위해 초성은 사용하지 않습니다.
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

  // 차트 순서대로 먼저 등장한 멜론 표기를 대표 이름으로 사용합니다.
  return chartArtists.find(function(candidate) {
    return areSameArtist(candidate, artist);
  }) || artist;
}

function matchesArtist(artist, query) {
  const q = normalize(query);
  if (!q) return false;

  return getSearchNames(artist).some(function(name) {
    return normalize(name).indexOf(q) !== -1;
  });
}

function loadPopularSearches() {
  try {
    const saved = JSON.parse(localStorage.getItem("melonitor-popular-searches") || "{}");
    popularSearches = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch (error) {
    popularSearches = {};
  }
}

function savePopularSearches() {
  try {
    localStorage.setItem("melonitor-popular-searches", JSON.stringify(popularSearches));
  } catch (error) {
    // 저장이 차단된 브라우저에서는 현재 화면에서만 순위를 표시합니다.
  }
}

function renderPopularSearches() {
  if (!popular) return;
  popular.innerHTML = "";

  const canonicalCounts = new Map();

  Object.entries(popularSearches).forEach(function(entry) {
    const savedArtist = entry[0];
    const count = Number(entry[1]) || 0;
    if (count <= 0) return;

    const canonicalArtist = getCanonicalChartArtist(savedArtist);
    const existsInChart = songs.some(function(song) {
      return song.artist && areSameArtist(song.artist, canonicalArtist);
    });

    if (!existsInChart) return;

    canonicalCounts.set(
      canonicalArtist,
      (canonicalCounts.get(canonicalArtist) || 0) + count
    );
  });

  const ranked = Array.from(canonicalCounts.entries())
    .sort(function(a, b) {
      return b[1] - a[1] || a[0].localeCompare(b[0], "ko");
    })
    .slice(0, 8);

  if (!ranked.length) {
    if (popularNote) {
      popularNote.textContent = "검색을 시작하면 이 브라우저에서 많이 검색한 아티스트 순으로 표시됩니다.";
    }
    return;
  }

  if (popularNote) {
    popularNote.textContent = "이 브라우저에서 검색한 횟수 기준입니다.";
  }

  ranked.forEach(function(entry, index) {
    const artist = entry[0];
    const button = document.createElement("button");
    button.className = "chip popular-chip";
    button.type = "button";
    button.textContent = (index + 1) + ". " + artist;
    button.title = "검색 횟수: " + entry[1];

    button.addEventListener("click", function() {
      input.value = artist;
      search(artist);
      recordPopularSearch(artist);
    });

    popular.appendChild(button);
  });
}

function recordPopularSearch(query) {
  const q = String(query || "").trim();
  if (normalize(q).length < 2) return;

  const matchedSong = songs.find(function(song) {
    return matchesArtist(song.artist, q);
  });

  if (!matchedSong) return;

  const canonicalArtist = getCanonicalChartArtist(matchedSong.artist);
  popularSearches[canonicalArtist] = (Number(popularSearches[canonicalArtist]) || 0) + 1;
  savePopularSearches();
  renderPopularSearches();
}

function schedulePopularSearch(query) {
  if (popularityTimer) clearTimeout(popularityTimer);
  const queryToRecord = query;

  popularityTimer = setTimeout(function() {
    recordPopularSearch(queryToRecord);
  }, 900);
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
  schedulePopularSearch(input.value);
});

clearBtn.addEventListener("click", function() {
  if (popularityTimer) clearTimeout(popularityTimer);
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

    renderPopularSearches();

    summary.textContent = "아티스트를 검색해 주세요.";
  } catch (error) {
    updated.textContent = "차트를 불러오지 못했습니다.";
    summary.textContent = error.message;
  }
}

loadPopularSearches();
renderPopularSearches();
load();
