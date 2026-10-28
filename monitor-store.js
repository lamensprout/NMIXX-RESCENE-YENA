(() => {
  const SEARCH_KEY = "melonitor-popular-searches";
  const FAVORITE_KEY = "melonitor-favorite-artists";
  const CONFIG = window.MELONITOR_SUPABASE_CONFIG || {};
  const NICKNAME_PATTERN = /^[가-힣A-Za-z0-9_]{2,16}$/;
  const NICKNAME_BLOCKED_PATTERNS = [
    new RegExp("\\u{c528}+\\u{c774}*\\u{bc1c}+|\\u{c2dc}+\\u{c774}*\\u{bc1c}+|\\u{c528}+\\u{d314}+|\\u{c2dc}+\\u{d314}+|\\u{c528}\\u{bc8c}|\\u{c2dc}\\u{bc8c}|\\u{c528}\\u{bd88}|\\u{c2dc}\\u{bd88}|\\u{c539}\\u{c0c8}\\u{b07c}|\\u{ac1c}\\u{c0c8}\\u{b07c}|\\u{c0c8}\\u{b07c}|\\u{c886}|\\u{c887}|\\u{c874}\\u{b098}|\\u{c874}\\u{b0b4}|\\u{bcd1}\\u{c2e0}|\\u{be05}\\u{c2e0}|\\u{be59}\\u{c2e0}|\\u{c9c0}\\u{b784}|\\u{c5fc}\\u{bcd1}|\\u{ac1c}\\u{b144}|\\u{ac1c}\\u{b188}|\\u{bbf8}\\u{ce5c}\\u{b144}|\\u{bbf8}\\u{ce5c}\\u{b188}|\\u{b290}\\u{ae08}\\u{b9c8}|\\u{b2c8}\\u{c560}\\u{bbf8}|\\u{c560}\\u{bbf8}\\u{b4a4}|\\u{c560}\\u{be44}\\u{b4a4}|\\u{bcf4}\\u{c9c0}|\\u{c790}\\u{c9c0}|\\u{c131}\\u{d3ed}\\u{d589}|\\u{ac15}\\u{ac04}|\\u{c57c}\\u{b3d9}|\\u{d3ec}\\u{b974}\\u{b178}|\\u{b530}\\u{ba39}|\\u{d6c4}\\u{c7a5}|\\u{b538}\\u{b538}\\u{c774}|\\u{c139}\\u{c2a4}|\\u{cc3d}\\u{b140}|\\u{ac78}\\u{b808}|\\u{b9d8}\\u{cda9}|\\u{d55c}\\u{b0a8}\\u{cda9}|\\u{d55c}\\u{b140}\\u{cda9}|\\u{c9f1}\\u{ae68}|\\u{cabd}\\u{bc14}\\u{b9ac}", "u"),
    new RegExp("\\u{66}\\u{75}\\u{63}\\u{6b}|\\u{66}\\u{75}\\u{6b}|\\u{73}\\u{68}\\u{69}\\u{74}|\\u{62}\\u{69}\\u{74}\\u{63}\\u{68}|\\u{62}\\u{61}\\u{73}\\u{74}\\u{61}\\u{72}\\u{64}|\\u{6d}\\u{6f}\\u{74}\\u{68}\\u{65}\\u{72}\\u{66}\\u{75}\\u{63}\\u{6b}\\u{65}\\u{72}|\\u{61}\\u{73}\\u{73}\\u{68}\\u{6f}\\u{6c}\\u{65}|\\u{6a}\\u{61}\\u{63}\\u{6b}\\u{61}\\u{73}\\u{73}|\\u{64}\\u{75}\\u{6d}\\u{62}\\u{61}\\u{73}\\u{73}|\\u{64}\\u{69}\\u{63}\\u{6b}|\\u{70}\\u{75}\\u{73}\\u{73}\\u{79}|\\u{63}\\u{75}\\u{6e}\\u{74}|\\u{73}\\u{6c}\\u{75}\\u{74}|\\u{77}\\u{68}\\u{6f}\\u{72}\\u{65}|\\u{70}\\u{6f}\\u{72}\\u{6e}|\\u{68}\\u{65}\\u{6e}\\u{74}\\u{61}\\u{69}|\\u{62}\\u{6c}\\u{6f}\\u{77}\\u{6a}\\u{6f}\\u{62}|\\u{68}\\u{61}\\u{6e}\\u{64}\\u{6a}\\u{6f}\\u{62}|\\u{6d}\\u{61}\\u{73}\\u{74}\\u{75}\\u{72}\\u{62}\\u{61}\\u{74}|\\u{64}\\u{69}\\u{6c}\\u{64}\\u{6f}|\\u{6e}\\u{69}\\u{67}\\u{67}\\u{65}\\u{72}|\\u{6e}\\u{69}\\u{67}\\u{67}\\u{61}|\\u{66}\\u{61}\\u{67}\\u{67}\\u{6f}\\u{74}|\\u{64}\\u{79}\\u{6b}\\u{65}|\\u{63}\\u{68}\\u{69}\\u{6e}\\u{6b}|\\u{6b}\\u{69}\\u{6b}\\u{65}|\\u{73}\\u{70}\\u{69}\\u{63}|\\u{74}\\u{72}\\u{61}\\u{6e}\\u{6e}\\u{79}|\\u{72}\\u{65}\\u{74}\\u{61}\\u{72}\\u{64}|\\u{70}\\u{65}\\u{64}\\u{6f}|\\u{70}\\u{65}\\u{64}\\u{6f}\\u{70}\\u{68}\\u{69}\\u{6c}\\u{65}|\\u{68}\\u{65}\\u{69}\\u{6c}\\u{68}\\u{69}\\u{74}\\u{6c}\\u{65}\\u{72}|\\u{77}\\u{68}\\u{69}\\u{74}\\u{65}\\u{70}\\u{6f}\\u{77}\\u{65}\\u{72}|\\u{77}\\u{68}\\u{69}\\u{74}\\u{65}\\u{70}\\u{72}\\u{69}\\u{64}\\u{65}|\\u{6b}\\u{6b}\\u{6b}", "u")
  ];
  const NICKNAME_RESERVED = /^(admin|administrator|moderator|staff|support|developer|official|운영자|관리자|개발자|고객센터|공식|melonitor|멜로니터)$|^(melonitor|멜로니터)(admin|administrator|moderator|staff|support|developer|official|운영자|관리자|개발자|공식)$|^(admin|administrator|moderator|staff|support|developer|official|운영자|관리자|개발자|공식)(melonitor|멜로니터)$|^(official|공식)(nmixx|rescene|yena|엔믹스|리센느|예나|최예나)$|^(nmixx|rescene|yena|엔믹스|리센느|예나|최예나)(official|공식)$/u;

  function normalizeNicknameForModeration(nickname) {
    const raw = String(nickname || "").normalize("NFKC").toLowerCase();
    const substitutions = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b" };
    const collapseRepeats = value => value.replace(/(.)\1+/gu, "$1");
    // First variant: remove all digits and allowed separators, so inserted digits/underscores cannot hide words.
    const separatorFree = collapseRepeats(raw.replace(/[_0-9]+/g, ""));
    // Second variant: interpret common leetspeak digits as letters (for example, f4ce -> face).
    const leetLike = collapseRepeats(raw.replace(/_/g, "").replace(/[0134578]/g, character => substitutions[character]));
    return Array.from(new Set([separatorFree, leetLike]));
  }

  function getNicknameValidationError(rawNickname) {
    const nickname = String(rawNickname || "").trim();
    if (!NICKNAME_PATTERN.test(nickname)) {
      return "닉네임은 한글 또는 영어로 2~16자여야 해요. 숫자와 밑줄(_)도 사용할 수 있어요.";
    }

    const normalizedVariants = normalizeNicknameForModeration(nickname);
    if (normalizedVariants.some(normalized => NICKNAME_BLOCKED_PATTERNS.some(pattern => pattern.test(normalized)))) {
      return "욕설, 성적인 표현, 혐오·비하 표현 또는 차단된 단어가 포함된 닉네임은 사용할 수 없어요. 숫자나 밑줄로 바꿔 써도 제한됩니다.";
    }

    if (normalizedVariants.some(normalized => NICKNAME_RESERVED.test(normalized))) {
      return "운영진이나 공식 계정으로 오해할 수 있는 닉네임은 사용할 수 없어요.";
    }

    if (!/[A-Za-z가-힣]/.test(nickname) && nickname.replace(/[^0-9]/g, "").length >= 8) {
      return "전화번호 등 개인정보로 오해될 수 있는 숫자만의 닉네임은 사용할 수 없어요.";
    }

    return "";
  }
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
      .select("nickname, avatar_url")
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
    window.dispatchEvent(new CustomEvent("melonitor-profile-ready", {
      detail: { user: currentUser, profile: currentProfile }
    }));
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

  async function getColorPreferences() {
    if (!isReady()) return null;
    const { data, error } = await client
      .from("melonitor_user_preferences")
      .select("favorite_song_colors, rank_graph_color")
      .eq("user_id", currentUser.id)
      .maybeSingle();
    if (error) {
      console.warn("계정 색상 설정을 불러오지 못했습니다:", error.message);
      return null;
    }
    return data || null;
  }

  async function saveColorPreferences(preferences) {
    if (!isReady()) return { ok: false, synced: false };
    const input = preferences && typeof preferences === "object" ? preferences : {};
    const colors = input.favorite_song_colors && typeof input.favorite_song_colors === "object" && !Array.isArray(input.favorite_song_colors)
      ? input.favorite_song_colors : {};
    const graphColor = /^#[0-9a-f]{6}$/i.test(String(input.rank_graph_color || ""))
      ? String(input.rank_graph_color).toUpperCase() : "#168A35";
    const { error } = await client
      .from("melonitor_user_preferences")
      .upsert({
        user_id: currentUser.id,
        favorite_song_colors: colors,
        rank_graph_color: graphColor,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    if (error) {
      console.warn("계정 색상 설정 저장 실패:", error.message);
      return { ok: false, synced: false, error };
    }
    return { ok: true, synced: true };
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

  function createTemporarySignupPassword() {
    if (!window.crypto || typeof window.crypto.getRandomValues !== "function") {
      throw new Error("이 브라우저에서는 안전한 회원가입을 시작할 수 없어요. 최신 브라우저에서 다시 시도해 주세요.");
    }
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("") + "Aa1!";
  }

  async function startSignup(email) {
    if (!client) throw new Error("계정 기능 설정이 아직 완료되지 않았습니다.");
    if (currentUser) throw new Error("먼저 현재 계정에서 로그아웃해 주세요.");

    const temporaryPassword = createTemporarySignupPassword();
    const result = await client.auth.signUp({
      email: String(email || "").trim(),
      password: temporaryPassword,
      options: {
        emailRedirectTo: window.location.origin + "/account.html",
        data: { melonitor_signup_flow: "email-first" }
      }
    });

    // The flow requires email confirmation before the user sets their own password.
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

  async function resendSignupVerification(email) {
    if (!client) throw new Error("계정 기능 설정이 아직 완료되지 않았습니다.");
    return client.auth.resend({
      type: "signup",
      email: String(email || "").trim(),
      options: { emailRedirectTo: window.location.origin + "/account.html" }
    });
  }

  async function verifySignupOtp(email, rawToken) {
    if (!client) throw new Error("계정 기능 설정이 아직 완료되지 않았습니다.");
    const normalizedEmail = String(email || "").trim();
    const token = String(rawToken || "").trim();
    if (!normalizedEmail) throw new Error("가입 이메일을 입력해 주세요.");
    if (!/^[0-9]{6}$/.test(token)) throw new Error("이메일로 받은 6자리 인증 코드를 입력해 주세요.");

    const result = await client.auth.verifyOtp({
      email: normalizedEmail,
      token,
      type: "signup"
    });
    if (result.error) return result;

    const confirmedUser = result.data && result.data.user;
    if (!confirmedUser || !isEmailVerified(confirmedUser)) {
      return {
        data: result.data,
        error: new Error("이메일 인증이 아직 완료되지 않았어요. 코드를 다시 확인해 주세요.")
      };
    }

    currentUser = confirmedUser;
    currentProfile = null;
    await refreshProfile(currentUser);
    if (isReady()) await migrateLocalData(currentUser);
    notifyAuthChange("EMAIL_VERIFIED");
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

  async function completeSignup(rawNickname, rawPassword) {
    if (!client || !currentUser || !isEmailVerified(currentUser)) {
      throw new Error("이메일 인증을 먼저 완료해 주세요.");
    }
    if (hasNickname()) {
      throw new Error("이미 가입 절차를 완료한 계정이에요. 로그인해서 이용해 주세요.");
    }

    const nickname = String(rawNickname || "").trim();
    const nicknameError = getNicknameValidationError(nickname);
    if (nicknameError) throw new Error(nicknameError);

    const password = String(rawPassword || "");
    if (password.length < 8 || password.length > 72) {
      throw new Error("비밀번호는 8~72자로 설정해 주세요.");
    }

    // Set the user's chosen password only after clicking the email verification link.
    const { data: passwordData, error: passwordError } = await client.auth.updateUser({ password });
    if (passwordError) {
      throw new Error(passwordError.message || "비밀번호를 저장하지 못했어요. 다시 시도해 주세요.");
    }
    if (passwordData && passwordData.user) currentUser = passwordData.user;

    // A unique-nickname conflict can happen after the password is saved; the user
    // stays on the setup panel and can retry with another nickname.
    await saveNickname(nickname);
    return { user: currentUser, profile: currentProfile };
  }

  async function saveNickname(rawNickname) {
    if (!client || !currentUser || !isEmailVerified(currentUser)) {
      throw new Error("이메일 인증을 완료한 뒤 닉네임을 설정해 주세요.");
    }

    const nickname = String(rawNickname || "").trim();
    const nicknameError = getNicknameValidationError(nickname);
    if (nicknameError) throw new Error(nicknameError);
    if (hasNickname()) throw new Error("이미 닉네임 설정을 완료했어요.");

    const { data, error } = await client
      .from("melonitor_profiles")
      .upsert(
        { user_id: currentUser.id, nickname },
        { onConflict: "user_id" }
      )
      .select("nickname, avatar_url")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("이미 사용 중인 닉네임이에요. 영문 대소문자를 바꿔도 같은 닉네임으로 취급돼요. 다른 닉네임을 선택해 주세요.");
      }
      if (error.code === "23514") {
        throw new Error("닉네임 형식이 올바르지 않거나 부적절한 표현이 포함되어 있어요. 다른 닉네임을 선택해 주세요.");
      }
      throw new Error("닉네임을 저장하지 못했어요. 데이터베이스 설정을 확인해 주세요.");
    }

    currentProfile = data;
    await migrateLocalData(currentUser);
    notifyAuthChange("NICKNAME_SAVED");
    return currentProfile;
  }

  async function updateNickname(rawNickname) {
    if (!client || !currentUser || !isEmailVerified(currentUser) || !isReady()) {
      throw new Error("닉네임을 변경하려면 로그인하고 가입 설정을 완료해 주세요.");
    }

    const nickname = String(rawNickname || "").trim();
    const nicknameError = getNicknameValidationError(nickname);
    if (nicknameError) throw new Error(nicknameError);
    if (currentProfile && currentProfile.nickname === nickname) return currentProfile;

    const { data, error } = await client
      .from("melonitor_profiles")
      .update({ nickname })
      .eq("user_id", currentUser.id)
      .select("nickname, avatar_url")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("이미 사용 중인 닉네임이에요. 다른 닉네임을 선택해 주세요.");
      }
      if (error.code === "23514") {
        throw new Error("닉네임 형식이 올바르지 않거나 부적절한 표현이 포함되어 있어요.");
      }
      throw new Error("닉네임을 변경하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }

    currentProfile = data;
    notifyAuthChange("NICKNAME_UPDATED");
    return currentProfile;
  }

  function getAvatarUrl() {
    return currentProfile && typeof currentProfile.avatar_url === "string"
      ? currentProfile.avatar_url
      : "";
  }

  async function uploadAvatar(file) {
    if (!client || !currentUser || !isEmailVerified(currentUser) || !isReady()) {
      throw new Error("프로필 사진을 변경하려면 먼저 로그인해 주세요.");
    }
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("JPG, PNG, WEBP 형식의 이미지만 사용할 수 있어요.");
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("프로필 사진은 2MB 이하로 선택해 주세요.");
    }

    const path = currentUser.id + "/avatar";
    const { error: uploadError } = await client.storage
      .from("profile-avatars")
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.warn("프로필 사진 업로드 실패:", uploadError.message);
      throw new Error("사진을 업로드하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }

    const { data: publicData } = client.storage.from("profile-avatars").getPublicUrl(path);
    if (!publicData || !publicData.publicUrl) {
      throw new Error("사진 주소를 만들지 못했어요. 다시 시도해 주세요.");
    }

    const avatarUrl = publicData.publicUrl + "?v=" + Date.now();
    const { data, error } = await client
      .from("melonitor_profiles")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", currentUser.id)
      .select("nickname, avatar_url")
      .single();

    if (error) {
      console.warn("프로필 사진 주소 저장 실패:", error.message);
      throw new Error("사진은 업로드했지만 계정에 저장하지 못했어요. 다시 시도해 주세요.");
    }

    currentProfile = data;
    notifyAuthChange("AVATAR_UPDATED");
    return currentProfile;
  }

  async function removeAvatar() {
    if (!client || !currentUser || !isEmailVerified(currentUser) || !isReady()) {
      throw new Error("프로필 사진을 삭제하려면 먼저 로그인해 주세요.");
    }

    const path = currentUser.id + "/avatar";
    const { data, error } = await client
      .from("melonitor_profiles")
      .update({ avatar_url: null })
      .eq("user_id", currentUser.id)
      .select("nickname, avatar_url")
      .single();

    if (error) {
      console.warn("프로필 사진 정보 삭제 실패:", error.message);
      throw new Error("프로필 사진을 삭제하지 못했어요. 다시 시도해 주세요.");
    }

    currentProfile = data;
    notifyAuthChange("AVATAR_REMOVED");

    const { error: storageError } = await client.storage.from("profile-avatars").remove([path]);
    if (storageError) {
      // The profile no longer points at the object, so a stale storage copy is not shown.
      console.warn("프로필 사진 파일 정리 실패:", storageError.message);
    }

    return currentProfile;
  }

  async function updatePassword(rawPassword) {
    if (!client || !currentUser || !isEmailVerified(currentUser) || !isReady()) {
      throw new Error("비밀번호를 변경하려면 먼저 로그인해 주세요.");
    }

    const password = String(rawPassword || "");
    if (password.length < 8 || password.length > 72) {
      throw new Error("새 비밀번호는 8~72자로 설정해 주세요.");
    }

    const { data, error } = await client.auth.updateUser({ password });
    if (error) {
      throw new Error(error.message || "비밀번호를 변경하지 못했어요. 다시 시도해 주세요.");
    }
    if (data && data.user) currentUser = data.user;
    notifyAuthChange("PASSWORD_UPDATED");
    return currentUser;
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
    getAvatarUrl,
    hasNickname,
    isReady,
    getSearches,
    recordSearch,
    getFavorites,
    getColorPreferences,
    saveColorPreferences,
    addFavorite,
    removeFavorite,
    startSignup,
    resendSignupVerification,
    verifySignupOtp,
    signIn,
    completeSignup,
    saveNickname,
    updateNickname,
    uploadAvatar,
    removeAvatar,
    updatePassword,
    getNicknameValidationError,
    signOut
  };
})();
