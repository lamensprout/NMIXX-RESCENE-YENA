(() => {
  const SEARCH_KEY = "melonitor-popular-searches";
  const FAVORITE_KEY = "melonitor-favorite-artists";
  const CONFIG = window.MELONITOR_SUPABASE_CONFIG || {};
  let client = null;
  let currentUser = null;
  let authListenerRegistered = false;

  if (
    window.supabase &&
    typeof window.supabase.createClient === "function" &&
    typeof CONFIG.projectUrl === "string" &&
    CONFIG.projectUrl.startsWith("https://") &&
    typeof CONFIG.publishableKey === "string" &&
    CONFIG.publishableKey.trim()
  ) {
    try {
      client = window.supabase.createClient(CONFIG.projectUrl, CONFIG.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    } catch (error) {
      console.error("Melonitor 계정 연결 초기화 실패:", error);
    }
  }

  function readLocalSearches() {
    try {
      const value = JSON.parse(localStorage.getItem(SEARCH_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) {
      return {};
    }
  }

  function writeLocalSearches(value) {
    try { localStorage.setItem(SEARCH_KEY, JSON.stringify(value)); } catch (_) {}
  }

  function readLocalFavorites() {
    try {
      const value = JSON.parse(localStorage.getItem(FAVORITE_KEY) || "[]");
      return Array.isArray(value) ? value.filter(x => typeof x === "string") : [];
    } catch (_) {
      return [];
    }
  }

  function writeLocalFavorites(value) {
    try { localStorage.setItem(FAVORITE_KEY, JSON.stringify(value)); } catch (_) {}
  }

  function isConfigured() {
    return !!client;
  }

  async function migrateLocalData(user) {
    if (!client || !user) return;
    const importKey = "melonitor-account-import-v1-" + user.id;
    let imported = {};
    try {
      imported = JSON.parse(localStorage.getItem(importKey) || "{}");
      if (!imported || typeof imported !== "object" || Array.isArray(imported)) imported = {};
    } catch (_) { imported = {}; }

    const localSearches = readLocalSearches();
    for (const [artist, rawCount] of Object.entries(localSearches)) {
      const count = Math.max(0, Math.floor(Number(rawCount) || 0));
      const previous = Math.max(0, Math.floor(Number(imported[artist]) || 0));
      const delta = count - previous;
      if (delta <= 0) continue;

      const { error } = await client.rpc("record_melonitor_search", {
        p_artist_name: artist,
        p_count: delta
      });
      if (error) {
        console.warn("기존 검색 기록을 계정으로 옮기지 못했습니다:", error.message);
        return;
      }
      imported[artist] = count;
      try { localStorage.setItem(importKey, JSON.stringify(imported)); } catch (_) {}
    }

    const localFavorites = readLocalFavorites();
    if (localFavorites.length) {
      const rows = localFavorites.map(artist => ({ user_id: user.id, artist_name: artist }));
      const { error } = await client
        .from("melonitor_favorite_artists")
        .upsert(rows, { onConflict: "user_id,artist_name", ignoreDuplicates: true });
      if (error) console.warn("기존 즐겨찾기를 계정으로 옮기지 못했습니다:", error.message);
    }
  }

  async function init() {
    if (!client) return null;

    const { data, error } = await client.auth.getSession();
    if (error) console.warn("로그인 상태를 확인하지 못했습니다:", error.message);
    currentUser = data && data.session ? data.session.user : null;

    if (!authListenerRegistered) {
      authListenerRegistered = true;
      client.auth.onAuthStateChange((event, session) => {
        currentUser = session ? session.user : null;
        window.dispatchEvent(new CustomEvent("melonitor-auth-change", {
          detail: { user: currentUser, event }
        }));
        if (event === "SIGNED_IN" && currentUser) {
          const user = currentUser;
          setTimeout(() => migrateLocalData(user).catch(error => {
            console.warn("기존 데이터 이전 중 오류:", error);
          }), 0);
        }
      });
    }

    if (currentUser) {
      try { await migrateLocalData(currentUser); } catch (error) {
        console.warn("기존 데이터 이전 중 오류:", error);
      }
    }
    return currentUser;
  }

  async function getSearches() {
    if (client && currentUser) {
      const { data, error } = await client
        .from("melonitor_user_searches")
        .select("artist_name,search_count")
        .order("search_count", { ascending: false })
        .limit(200);
      if (!error && Array.isArray(data)) {
        return Object.fromEntries(data.map(row => [row.artist_name, Number(row.search_count) || 0]));
      }
      console.warn("계정 검색 기록을 불러오지 못해 이 브라우저 기록을 표시합니다:", error && error.message);
    }
    return readLocalSearches();
  }

  async function recordSearch(artistName) {
    const artist = String(artistName || "").trim();
    if (artist.length < 2) return { ok: false, synced: false };

    if (client && currentUser) {
      const { error } = await client.rpc("record_melonitor_search", {
        p_artist_name: artist,
        p_count: 1
      });
      if (!error) return { ok: true, synced: true };
      console.warn("계정 검색 기록 저장 실패:", error.message);
    }

    const searches = readLocalSearches();
    searches[artist] = (Number(searches[artist]) || 0) + 1;
    writeLocalSearches(searches);
    return { ok: true, synced: false };
  }

  async function getFavorites() {
    if (client && currentUser) {
      const { data, error } = await client
        .from("melonitor_favorite_artists")
        .select("artist_name")
        .order("created_at", { ascending: true });
      if (!error && Array.isArray(data)) return data.map(row => row.artist_name);
      console.warn("계정 즐겨찾기를 불러오지 못해 이 브라우저 기록을 표시합니다:", error && error.message);
    }
    return readLocalFavorites();
  }

  async function addFavorite(artistName) {
    const artist = String(artistName || "").trim();
    if (artist.length < 2 || artist.length > 100) return { ok: false, synced: false };

    if (client && currentUser) {
      const { error } = await client
        .from("melonitor_favorite_artists")
        .upsert(
          { user_id: currentUser.id, artist_name: artist },
          { onConflict: "user_id,artist_name", ignoreDuplicates: true }
        );
      if (!error) return { ok: true, synced: true };
      console.warn("계정 즐겨찾기 저장 실패:", error.message);
    }

    const favorites = readLocalFavorites();
    if (!favorites.some(value => value.toLowerCase() === artist.toLowerCase())) {
      favorites.push(artist);
      writeLocalFavorites(favorites);
    }
    return { ok: true, synced: false };
  }

  async function removeFavorite(artistName) {
    const artist = String(artistName || "").trim();
    let synced = false;
    if (client && currentUser) {
      const { error } = await client
        .from("melonitor_favorite_artists")
        .delete()
        .eq("artist_name", artist);
      synced = !error;
      if (error) console.warn("계정 즐겨찾기 삭제 실패:", error.message);
    }

    writeLocalFavorites(readLocalFavorites().filter(value => value !== artist));
    return { ok: true, synced };
  }

  async function signUp(email, password) {
    if (!client) throw new Error("계정 기능 설정이 아직 완료되지 않았습니다.");
    return client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/account.html" }
    });
  }

  async function signIn(email, password) {
    if (!client) throw new Error("계정 기능 설정이 아직 완료되지 않았습니다.");
    const result = await client.auth.signInWithPassword({ email, password });
    if (!result.error && result.data.user) {
      currentUser = result.data.user;
      await migrateLocalData(currentUser);
    }
    return result;
  }

  async function signOut() {
    if (!client) return { error: new Error("계정 기능 설정이 아직 완료되지 않았습니다.") };
    const result = await client.auth.signOut();
    if (!result.error) currentUser = null;
    return result;
  }

  window.MonitorStore = {
    isConfigured,
    init,
    getUser: () => currentUser,
    getSearches,
    recordSearch,
    getFavorites,
    addFavorite,
    removeFavorite,
    signUp,
    signIn,
    signOut
  };
})();
