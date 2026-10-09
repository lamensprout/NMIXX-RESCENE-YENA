(() => {
  const button = document.getElementById("themeToggle");
  if (!button) return;

  const storageKey = "melonitor-theme";

  function setTheme(theme) {
    const dark = theme === "dark";
    document.documentElement.classList.toggle("dark-mode", dark);
    document.body.classList.toggle("dark-mode", dark);
    button.textContent = dark ? "☀️" : "🌙";
    button.setAttribute("aria-label", dark ? "라이트 모드로 전환" : "다크 모드로 전환");
    button.title = dark ? "라이트 모드로 전환" : "다크 모드로 전환";
  }

  let saved = "light";
  try {
    saved = localStorage.getItem(storageKey) || "light";
  } catch (_) {}
  setTheme(saved);

  button.addEventListener("click", () => {
    const next = document.body.classList.contains("dark-mode") ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch (_) {}
  });
})();