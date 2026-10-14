(() => {
  function renderProfileAvatars() {
    if (!window.MonitorStore || typeof MonitorStore.getAvatarUrl !== "function") return;
    const avatarUrl = MonitorStore.isReady() ? MonitorStore.getAvatarUrl() : "";

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
})();
