(() => {
  const toggle = document.getElementById("userMenuToggle");
  const panel = document.getElementById("userMenuPanel");
  const account = document.getElementById("accountLink");
  const logoutButton = document.getElementById("userLogoutButton");
  if (!toggle || !panel) return;
  function closeMenu() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "사용자 메뉴 열기");
  }
  function openMenu() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "사용자 메뉴 닫기");
  }
  toggle.addEventListener("click", () => panel.hidden ? openMenu() : closeMenu());
  document.addEventListener("click", event => {
    if (!panel.hidden && !event.target.closest(".user-menu")) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {
      closeMenu();
      toggle.focus();
    }
  });
  if (account) account.addEventListener("click", closeMenu);
  async function syncLogoutVisibility() {
    if (logoutButton) logoutButton.hidden = !(window.MonitorStore && MonitorStore.getUser());
  }
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      if (!window.MonitorStore || !MonitorStore.getUser()) return;
      logoutButton.disabled = true;
      logoutButton.textContent = "로그아웃 중...";
      const result = await MonitorStore.signOut();
      if (result && result.error) {
        logoutButton.disabled = false;
        logoutButton.textContent = "로그아웃";
        alert("로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      closeMenu();
      window.location.reload();
    });
  }
  window.addEventListener("melonitor-auth-change", syncLogoutVisibility);
  syncLogoutVisibility();
})();