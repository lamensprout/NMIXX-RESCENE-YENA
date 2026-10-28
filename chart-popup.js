(function () {
  let hideTimer = null;
  let backdrop = null;

  function set(message, hideAfterMs = 0, loading = false, state = "") {
    const status = document.getElementById("chartStatus");
    if (!status) return;
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = null;

    if (message) {
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "chart-refresh-backdrop";
        backdrop.setAttribute("aria-hidden", "true");
        document.body.appendChild(backdrop);
      }
      backdrop.hidden = false;
      document.body.classList.add("chart-refresh-active");
    } else {
      if (backdrop) backdrop.hidden = true;
      document.body.classList.remove("chart-refresh-active");
    }

    status.classList.toggle("is-loading", Boolean(loading));
    status.classList.toggle("is-success", state === "success");
    status.classList.toggle("is-error", state === "error");
    status.setAttribute("aria-busy", loading ? "true" : "false");
    status.dataset.message = message || "";
    status.title = message || "";
    status.replaceChildren();

    if (message) {
      if (state === "success" || state === "error") {
        const icon = document.createElement("span");
        icon.className = "chart-status-icon " + (state === "success" ? "success" : "error");
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = state === "success"
          ? '<svg viewBox="0 0 80 80"><circle class="status-icon-circle" cx="40" cy="40" r="38"/><path class="status-icon-mark" d="M22 41 L34 53 L59 27"/></svg>'
          : '<svg viewBox="0 0 80 80"><circle class="status-icon-circle" cx="40" cy="40" r="38"/><path class="status-icon-mark" d="M27 27 L53 53 M53 27 L27 53"/></svg>';
        status.appendChild(icon);
      }
      const label = document.createElement("span");
      label.className = "chart-status-message";
      label.textContent = message;
      status.appendChild(label);
    }

    status.hidden = !message;
    if (message && hideAfterMs > 0) {
      const currentMessage = message;
      hideTimer = window.setTimeout(() => {
        if (status.dataset.message === currentMessage) {
          status.dataset.message = "";
          status.replaceChildren();
          status.hidden = true;
          status.classList.remove("is-loading", "is-success", "is-error");
          status.title = "";
          if (backdrop) backdrop.hidden = true;
          document.body.classList.remove("chart-refresh-active");
        }
        hideTimer = null;
      }, hideAfterMs);
    }
  }

  window.MelonitorChartPopup = { set };
})();