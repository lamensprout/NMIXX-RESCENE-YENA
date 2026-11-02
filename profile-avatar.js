(() => {
  function renderProfileAvatars() {
    if (!window.MonitorStore || typeof MonitorStore.getAvatarUrl !== "function") return;
    const ready = MonitorStore.isReady();
    const avatarUrl = ready ? MonitorStore.getAvatarUrl() : "";
    const hasUser = !!MonitorStore.getUser();
    const nickname = ready ? MonitorStore.getNickname() : "";
    const profile = document.getElementById("userMenuProfile");
    const nicknameLabel = document.getElementById("userMenuNickname");
    const loginIcon = document.getElementById("accountLoginIcon");
    const settingsIcon = document.getElementById("accountSettingsIcon");
    const logoutButton = document.getElementById("userLogoutButton");
    if (profile) profile.hidden = !hasUser;
    if (nicknameLabel) nicknameLabel.textContent = nickname || (hasUser ? "닉네임 설정 필요" : "");
    if (loginIcon) loginIcon.hidden = hasUser;
    if (settingsIcon) settingsIcon.hidden = !hasUser;
    if (logoutButton) logoutButton.hidden = !hasUser;
    const accountLinkLabel = document.getElementById("accountLinkLabel");
    if (accountLinkLabel) {
      const hasUser = !!MonitorStore.getUser();
      const nickname = ready ? MonitorStore.getNickname() : "";
      accountLinkLabel.textContent = !hasUser
        ? "로그인 / 회원가입"
        : (ready ? (nickname || "내 계정") : "닉네임 설정하기");
    }

    document.querySelectorAll(".user-menu-avatar").forEach(image => {
      const trigger = image.closest(".user-menu-trigger");
      if (avatarUrl) {
        if (image.getAttribute("src") !== avatarUrl) image.src = avatarUrl;
        image.hidden = false;
        if (trigger) trigger.classList.add("has-avatar");
      } else {
        image.hidden = true;
        image.removeAttribute("src");
        if (trigger) trigger.classList.remove("has-avatar");
      }
    });
  }

  document.querySelectorAll(".user-menu-avatar").forEach(image => {
    image.addEventListener("error", () => {
      image.hidden = true;
      const trigger = image.closest(".user-menu-trigger");
      if (trigger) trigger.classList.remove("has-avatar");
    });
  });

  window.addEventListener("melonitor-profile-ready", renderProfileAvatars);
  window.addEventListener("melonitor-auth-change", renderProfileAvatars);
  renderProfileAvatars();

  // Secondary pages do not all initialize the account store themselves.
  if (!document.getElementById("artistSearch") &&
      !document.getElementById("favoriteInput") &&
      window.MonitorStore && typeof MonitorStore.init === "function") {
    MonitorStore.init().then(renderProfileAvatars).catch(error => {
      console.warn("프로필 정보를 불러오지 못했습니다:", error);
    });
  }
})();
