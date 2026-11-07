(() => {
  "use strict";

  if (window.MelonitorChartPopup) return;

  let popupRoot = null;
  let hideTimer = null;

  function ensurePopup() {
    if (popupRoot) return popupRoot;

    const style = document.createElement("style");
    style.id = "melonitor-chart-popup-style";
    style.textContent = `
      .melonitor-chart-popup-backdrop {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgba(5, 9, 12, .62);
        -webkit-backdrop-filter: blur(5px);
        backdrop-filter: blur(5px);
      }
      .melonitor-chart-popup-backdrop[hidden] { display: none; }
      .melonitor-chart-popup {
        box-sizing: border-box;
        width: min(256px, 100%);
        min-height: 168px;
        padding: 32px 20px 28px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        color: #f4f7fa;
        background: #202833;
        border: 1px solid rgba(71, 190, 126, .32);
        border-radius: 20px;
        box-shadow: 0 18px 48px rgba(0, 0, 0, .28);
        text-align: center;
      }
      .melonitor-chart-popup-icon {
        width: 58px;
        height: 58px;
        flex: 0 0 58px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #fff;
        background: #20d49a;
      }
      .melonitor-chart-popup-icon svg {
        width: 36px;
        height: 36px;
        display: block;
      }
      .melonitor-chart-popup-icon.is-loading {
        background: #20d49a;
      }
      .melonitor-chart-popup-icon.is-loading::before {
        content: "";
        width: 28px;
        height: 28px;
        border: 3px solid rgba(255, 255, 255, .35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: melonitor-chart-popup-spin .8s linear infinite;
      }
      .melonitor-chart-popup-icon.is-error { background: #e45c66; }
      .melonitor-chart-popup-message {
        margin: 0;
        color: inherit;
        font-family: inherit;
        font-size: 15px;
        font-weight: 700;
        line-height: 1.55;
        overflow-wrap: anywhere;
        white-space: pre-line;
      }
      @keyframes melonitor-chart-popup-spin {
        to { transform: rotate(360deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        .melonitor-chart-popup-icon.is-loading::before {
          animation-duration: 2s;
        }
      }
    `;
    document.head.appendChild(style);

    const backdrop = document.createElement("div");
    backdrop.className = "melonitor-chart-popup-backdrop";
    backdrop.hidden = true;
    backdrop.setAttribute("aria-hidden", "true");

    const panel = document.createElement("div");
    panel.className = "melonitor-chart-popup";
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");

    const icon = document.createElement("div");
    icon.className = "melonitor-chart-popup-icon";
    icon.setAttribute("aria-hidden", "true");

    const message = document.createElement("p");
    message.className = "melonitor-chart-popup-message";

    panel.append(icon, message);
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);
    popupRoot = { backdrop, icon, message };
    return popupRoot;
  }

  function set(message, duration, loading, state) {
    const popup = ensurePopup();
    if (hideTimer !== null) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }

    popup.icon.className = "melonitor-chart-popup-icon";
    popup.icon.replaceChildren();

    if (loading) {
      popup.icon.classList.add("is-loading");
    } else if (state === "error") {
      popup.icon.classList.add("is-error");
      popup.icon.textContent = "!";
    } else {
      const check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      check.setAttribute("viewBox", "0 0 24 24");
      check.setAttribute("fill", "none");
      check.setAttribute("stroke", "currentColor");
      check.setAttribute("stroke-width", "2.8");
      check.setAttribute("stroke-linecap", "round");
      check.setAttribute("stroke-linejoin", "round");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M5 12.5 9.5 17 19 7.5");
      check.appendChild(path);
      popup.icon.appendChild(check);
    }

    popup.message.textContent = String(message || "");
    popup.backdrop.hidden = false;
    popup.backdrop.setAttribute("aria-hidden", "false");

    const timeout = Number(duration);
    if (Number.isFinite(timeout) && timeout > 0) {
      hideTimer = window.setTimeout(() => {
        popup.backdrop.hidden = true;
        popup.backdrop.setAttribute("aria-hidden", "true");
        hideTimer = null;
      }, timeout);
    }
  }

  function hide() {
    if (hideTimer !== null) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }
    if (popupRoot) {
      popupRoot.backdrop.hidden = true;
      popupRoot.backdrop.setAttribute("aria-hidden", "true");
    }
  }

  window.MelonitorChartPopup = Object.freeze({ set, hide });
})();
