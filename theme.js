(() => {
  const legacySwitch = document.getElementById("themeToggle");
  const modeControl = document.getElementById("themeModeControl");
  const modeButtons = Array.from(document.querySelectorAll("[data-theme-mode]"));
  if (!legacySwitch && modeButtons.length === 0) return;

  const storageKey = "melonitor-theme";
  const media = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : { matches: false, addEventListener: null, addListener: null };
  const validModes = ["light", "auto", "dark"];
  let selectedMode = "auto";
  function nextMode(mode) {
    const i = validModes.indexOf(mode);
    return validModes[(i + 1) % validModes.length];
  }
  function applyMode(mode, persist = false) {
    if (!validModes.includes(mode)) mode = "auto";
    selectedMode = mode;
    const dark = mode === "dark" || (mode === "auto" && !!media.matches);
    document.documentElement.classList.toggle("dark-mode", dark);
    if (document.body) document.body.classList.toggle("dark-mode", dark);
    document.documentElement.dataset.themeMode = mode;
    if (document.body) document.body.dataset.themeMode = mode;
    if (modeControl) modeControl.setAttribute("data-active-mode", mode);
    modeButtons.forEach(button => {
      const active = button.dataset.themeMode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (legacySwitch) {
      legacySwitch.dataset.themeMode = mode;
      legacySwitch.textContent = "";
      legacySwitch.setAttribute("role", "button");
      legacySwitch.setAttribute("aria-label", "화면 모드: " + mode.toUpperCase() + ". 다음 모드로 변경");
      legacySwitch.title = "현재 " + mode.toUpperCase() + " · 클릭하면 " + nextMode(mode).toUpperCase() + " 모드";
    }
    if (persist) {
      try { localStorage.setItem(storageKey, mode); } catch (_) {}
    }
  }
  try {
    const saved = localStorage.getItem(storageKey);
    selectedMode = validModes.includes(saved) ? saved : "auto";
  } catch (_) { selectedMode = "auto"; }
  applyMode(selectedMode);
  modeButtons.forEach(button => {
    button.addEventListener("click", () => applyMode(button.dataset.themeMode, true));
  });
  if (legacySwitch) {
    legacySwitch.addEventListener("click", () => applyMode(nextMode(selectedMode), true));
  }
  const onSystemThemeChange = () => {
    if (selectedMode === "auto") applyMode("auto");
  };
  if (typeof media.addEventListener === "function") media.addEventListener("change", onSystemThemeChange);
  else if (typeof media.addListener === "function") media.addListener(onSystemThemeChange);
})();