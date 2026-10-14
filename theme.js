(() => {
  const switchButton = document.getElementById("themeToggle");
  const menuButton = document.getElementById("themeMenuToggle");
  const menuLabel = document.getElementById("themeMenuLabel");
  const menuSymbol = document.getElementById("themeMenuSymbol");
  if (!switchButton && !menuButton) return;

  const storageKey = "melonitor-theme";

  function setTheme(theme) {
    const dark = theme === "dark";
    document.documentElement.classList.toggle("dark-mode", dark);
    document.body.classList.toggle("dark-mode", dark);

    if (switchButton) {
      switchButton.textContent = "";
      switchButton.setAttribute("role", "switch");
      switchButton.setAttribute("aria-checked", String(dark));
      switchButton.setAttribute("aria-label", "다크 모드");
      switchButton.title = dark ? "다크 모드 켜짐 · 라이트 모드로 전환" : "다크 모드 꺼짐 · 다크 모드로 전환";
    }

    if (menuButton) {
      if (menuLabel) menuLabel.textContent = dark ? "밝은 화면으로" : "어두운 화면으로";
      if (menuSymbol) menuSymbol.textContent = dark ? "☼" : "☾";
      menuButton.setAttribute("aria-label", dark ? "밝은 화면으로 전환" : "어두운 화면으로 전환");
    }
  }

  let saved = "light";
  try {
    saved = localStorage.getItem(storageKey) || "light";
  } catch (_) {}
  setTheme(saved);

  function toggleTheme() {
    const next = document.body.classList.contains("dark-mode") ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch (_) {}
  }

  if (switchButton) switchButton.addEventListener("click", toggleTheme);
  if (menuButton) menuButton.addEventListener("click", toggleTheme);
})();