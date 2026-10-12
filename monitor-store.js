(() => {
  const SEARCH_KEY = "melonitor-popular-searches";
  const FAVORITE_KEY = "melonitor-favorite-artists";
  const CONFIG = window.MELONITOR_SUPABASE_CONFIG || {};
  const NICKNAME_PATTERN = /^[가-힣A-Za-z0-9_]{2,16}$/;
  let client = null;
  let currentUser = null;
  let currentProfile = null;
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

  function isEmailVerified(user) {
    return !!(user && (user.email_confirmed_at || user.confirmed_at));
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

  function hasNickname() {
    return !!(currentProfile && typeof currentProfile.nickname === "string" && currentProfile.nickname);
  }

  function isReady() {
    return !!(currentUser && isEmailVerified(currentUser) && hasNickname());
  }

  async function refreshProfile(user) {
    const targetUser = user || currentUser;
    if (!client || !targetUser) {
      currentProfile = null;
      return null;
    }

    const { data, error } = await client
      .from("melonitor_profiles")
      .select("nickname")
      .eq("user_id", targetUser.id)
      .maybeSingle();

    if (error) {
      currentProfile = null;
      console.warn("닉네임 정보를 불러오지 못했습니다. 데이터베이스 설정을 확인해 주세요:", error.message);
      return null;
    }

    currentProfile = data || null;
    return currentProfile;
  }

  async function migrateLocalData(user) {
    if (!client || !user || !isReady()) return;
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

  function notifyAuthChange(eventName) {
    window.dispatchEvent(new CustomEvent("melonitor-auth-change", {
      detail: { user: currentUser, profile: currentProfile, event: eventName || "STATE_CHANGED" }
    }));
  }

  async function handleSessionChange(session, eventName) {
    const candidate = session && session.user ? session.user : null;

    if (candidate && !isEmailVerified(candidate)) {
      currentUser = null;
      currentProfile = null;
      try { await client.auth.signOut(); } catch (_) {}
    } else {
      currentUser = candidate;
      currentProfile = null;
      if (currentUser) await refreshProfile(currentUser);
    }

    if (isReady()) {
      try { await migrateLocalData(currentUser); } catch (error) {
        console.warn("기존 데이터 이전 중 오류:", error);
      }
    }
    notifyAuthChange(eventName);
  }

  async function init() {
    if (!client) {
      currentUser = null;
      currentProfile = null;
      return null;
    }

    const { data, error } = await client.auth.getSession();
    if (error) console.warn("로그인 상태를 확인하지 못했습니다:", error.message);

    const session = data && data.session ? data.session : null;
    if (session && session.user && !isEmailVerified(session.user)) {
      currentUser = null;
      currentProfile = null;
      await client.auth.signOut();
    } else {
      currentUser = session ? session.user : null;
      currentProfile = null;
      if (currentUser) await refreshProfile(currentUser);
    }

    if (!authListenerRegistered) {
      authListenerRegistered = true;
      client.auth.onAuthStateChange((event, nextSession) => {
        // Auth callbacks are deferred before making further Supabase requests.
        setTimeout(() => {
          handleSessionChange(nextSession, event).catch(error => {
            console.warn("로그인 상태 변경 처리 중 오류:", error);
          });
        }, 0);
      });
    }

    if (isReady()) {
      try { await migrateLocalData(currentUser); } catch (migrationError) {
        console.warn("기존 데이터 이전 중 오류:", migrationError);
      }
    }
    return currentUser;
  }

  async function getSearches() {
    if (!isReady()) return {};
    const { data, error } = await client
      .from("melonitor_user_searches")
      .select("artist_name,search_count")
      .order("search_count", { ascending: false })
      .limit(200);
    if (!error && Array.isArray(data)) {
      return Object.fromEntries(data.map(row => [row.artist_name, Number(row.search_count) || 0]));
    }
    console.warn("계정 검색 기록을 불러오지 못했습니다:", error && error.message);
    return {};
  }

  async function recordSearch(artistName) {
    if (!isReady()) return { ok: false, synced: false };
    const artist = String(artistName || "").trim();
    if (artist.length < 2 || artist.length > 100) return { ok: false, synced: false };

    const { error } = await client.rpc("record_melonitor_search", {
      p_artist_name: artist,
      p_count: 1
    });
    if (!error) return { ok: true, synced: true };
    console.warn("계정 검색 기록 저장 실패:", error.message);
    return { ok: false, synced: false, error };
  }

  async function getFavorites() {
    if (!isReady()) return [];
    const { data, error } = await client
      .from("melonitor_favorite_artists")
      .select("artist_name")
      .order("created_at", { ascending: true });
    if (!error && Array.isArray(data)) return data.map(row => row.artist_name);
    console.warn("계정 즐겨찾기를 불러오지 못했습니다:", error && error.message);
    return [];
  }

  async function addFavorite(artistName) {
    if (!isReady()) return { ok: false, synced: false };
    const artist = String(artistName || "").trim();
    if (artist.length < 2 || artist.length > 100) return { ok: false, synced: false };

    const { error } = await client
      .from("melonitor_favorite_artists")
      .upsert(
        { user_id: currentUser.id, artist_name: artist },
        { onConflict: "user_id,artist_name", ignoreDuplicates: true }
      );
    if (!error) return { ok: true, synced: true };
    console.warn("계정 즐겨찾기 저장 실패:", error.message);
    return { ok: false, synced: false, error };
  }

  async function removeFavorite(artistName) {
    if (!isReady()) return { ok: false, synced: false };
    const artist = String(artistName || "").trim();
    const { error } = await client
      .from("melonitor_favorite_artists")
      .delete()
      .eq("artist_name", artist);
    if (error) {
      console.warn("계정 즐겨찾기 삭제 실패:", error.message);
      return { ok: false, synced: false, error };
    }
    return { ok: true, synced: true };
  }

  async function signUp(email, password) {
    if (!client) throw new Error("계정 기능 설정이 아직 완료되지 않았습니다.");
    const result = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/account.html" }
    });

    // If a session is returned immediately, Confirm Email is disabled.
    // Do not leave the browser signed in; a verified-email-first flow requires this setting.
    if (!result.error && result.data && result.data.session) {
      try { await client.auth.signOut(); } catch (_) {}
      currentUser = null;
      currentProfile = null;
      return {
        ...result,
        data: { ...result.data, session: null, emailConfirmationDisabled: true }
      };
    }
    return result;
  }

  async function signIn(email, password) {
    if (!client) throw new Error("계정 기능 설정이 아직 완료되지 않았습니다.");
    const result = await client.auth.signInWithPassword({ email, password });
    if (!result.error && result.data.user) {
      if (!isEmailVerified(result.data.user)) {
        await client.auth.signOut();
        currentUser = null;
        currentProfile = null;
        return {
          data: { user: null, session: null },
          error: new Error("이메일 인증이 완료되지 않았어요. 인증 메일의 링크를 먼저 눌러 주세요.")
        };
      }
      currentUser = result.data.user;
      currentProfile = null;
      await refreshProfile(currentUser);
      if (isReady()) await migrateLocalData(currentUser);
    }
    return result;
  }

  async function saveNickname(rawNickname) {
    if (!client || !currentUser || !isEmailVerified(currentUser)) {
      throw new Error("이메일 인증을 완료한 뒤 닉네임을 설정해 주세요.");
    }

    const nickname = String(rawNickname || "").trim();
    if (!NICKNAME_PATTERN.test(nickname)) {
      throw new Error("닉네임은 한글 또는 영어로 2~16자여야 해요. 숫자와 밑줄(_)도 사용할 수 있어요.");
    }
    if (hasNickname()) throw new Error("이미 닉네임 설정을 완료했어요.");

    const { data, error } = await client
      .from("melonitor_profiles")
      .upsert(
        { user_id: currentUser.id, nickname },
        { onConflict: "user_id" }
      )
      .select("nickname")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("이미 사용 중인 닉네임이에요. 다른 닉네임을 선택해 주세요.");
      }
      if (error.code === "23514") {
        throw new Error("닉네임은 한글 또는 영어로 2~16자여야 해요. 숫자와 밑줄(_)도 사용할 수 있어요.");
      }
      throw new Error("닉네임을 저장하지 못했어요. 데이터베이스 설정을 확인해 주세요.");
    }

    currentProfile = data;
    await migrateLocalData(currentUser);
    notifyAuthChange("NICKNAME_SAVED");
    return currentProfile;
  }

  async function signOut() {
    if (!client) return { error: new Error("계정 기능 설정이 아직 완료되지 않았습니다.") };
    const result = await client.auth.signOut();
    if (!result.error) {
      currentUser = null;
      currentProfile = null;
      notifyAuthChange("SIGNED_OUT");
    }
    return result;
  }

  window.MonitorStore = {
    isConfigured,
    init,
    getUser: () => currentUser,
    getProfile: () => currentProfile,
    getNickname: () => currentProfile ? currentProfile.nickname : "",
    hasNickname,
    isReady,
    getSearches,
    recordSearch,
    getFavorites,
    addFavorite,
    removeFavorite,
    signUp,
    signIn,
    saveNickname,
    signOut
  };
})();
