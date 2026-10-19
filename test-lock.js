(function () {
  "use strict";

  // 테스트 버전용 간단한 화면 잠금입니다. 정식 보안 인증 수단은 아닙니다.
  const ACCESS_PIN = "518001";
  function matchesPin(value) {
    return value === ACCESS_PIN;
  }
  const SESSION_KEY = "melonitor-test-access-v5";
  const root = document.documentElement;

  let internalNavigationPending = false;
  let reloadPending = false;

  function clearStoredAccess() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
  }

  function noteNavigation(destinationUrl, navigationType) {
    try {
      const destination = new URL(destinationUrl, window.location.href);
      if (destination.origin === window.location.origin) {
        internalNavigationPending = true;
        if (navigationType === "reload") reloadPending = true;
      } else {
        internalNavigationPending = false;
        reloadPending = false;
        clearStoredAccess();
      }
    } catch (_) {
      internalNavigationPending = false;
      reloadPending = false;
      clearStoredAccess();
    }
  }

  // Keyboard refresh must not be treated as leaving the site.
  window.addEventListener("keydown", function (event) {
    const key = String(event.key || "").toLowerCase();
    if (key === "f5" || ((event.ctrlKey || event.metaKey) && key === "r")) {
      reloadPending = true;
      internalNavigationPending = true;
    }
  }, true);

  // Keep access while navigating inside Melonitor, but clear it when navigating to another site.
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!target || target.hasAttribute("download") ||
        (target.target && target.target.toLowerCase() === "_blank")) return;
    noteNavigation(target.href);
  });

  // This also detects browser-toolbar refresh and script-triggered reloads.
  if (window.navigation && typeof window.navigation.addEventListener === "function") {
    window.navigation.addEventListener("navigate", function (event) {
      if (!event.destination || !event.destination.url) return;
      if (event.navigationType === "reload") {
        reloadPending = true;
        internalNavigationPending = true;
        return;
      }
      noteNavigation(event.destination.url, event.navigationType);
    });
  }

  window.__melonitorMarkInternalNavigation = function (url) {
    noteNavigation(new URL(url, window.location.href).href);
  };

  window.addEventListener("beforeunload", function () {
    if (reloadPending) internalNavigationPending = true;
  });

  window.addEventListener("pagehide", function () {
    if (!internalNavigationPending && !reloadPending) clearStoredAccess();
  });

  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    let unlocked = false;
    try { unlocked = sessionStorage.getItem(SESSION_KEY) === "unlocked"; } catch (_) {}
    if (!unlocked) window.location.reload();
  });

  try {
    if (sessionStorage.getItem(SESSION_KEY) === "unlocked") return;
  } catch (_) {}

  root.classList.add("melonitor-test-locked");

  const style = document.createElement("style");
  style.textContent = "html.melonitor-test-locked,\nhtml.melonitor-test-locked body { min-height: 100%; }\nhtml.melonitor-test-locked body > *:not(#melonitorTestGate) {\n  visibility: hidden !important;\n}\n#melonitorTestGate {\n  position: fixed; inset: 0; z-index: 2147483647;\n  display: grid; place-items: center; box-sizing: border-box; padding: 24px;\n  background: radial-gradient(ellipse at top, #e4f7d9 0%, #f2f7f0 38%, #f7f8fa 100%);\n  color: #183323;\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;\n  visibility: visible !important;\n}\n#melonitorTestGate * { box-sizing: border-box; }\n#melonitorTestGate .test-lock-card {\n  width: min(100%, 390px); padding: 34px 28px 28px;\n  border: 1px solid rgba(35,91,51,.13); border-radius: 24px;\n  background: rgba(255,255,255,.98);\n  box-shadow: 0 22px 70px rgba(24,51,35,.13); text-align: center;\n  visibility: visible !important;\n}\n#melonitorTestGate .test-lock-logo {\n  display: grid; place-items: center; width: 58px; height: 58px;\n  margin: 0 auto 17px; border-radius: 18px; background: #e8f5e8; font-size: 30px;\n}\n#melonitorTestGate h1 { margin: 0; font-size: 24px; letter-spacing: -.6px; }\n#melonitorTestGate .test-lock-badge {\n  display: inline-block; margin: 9px 0 0; padding: 5px 10px;\n  border-radius: 999px; background: #eef6ec; color: #387146;\n  font-size: 12px; font-weight: 700;\n}\n#melonitorTestGate .test-lock-description {\n  margin: 19px 0 21px; color: #657369; font-size: 14px; line-height: 1.65;\n}\n#melonitorTestGate form { display: grid; gap: 12px; }\n#melonitorTestGate input {\n  display: block !important; width: 100%; height: 54px; box-sizing: border-box;\n  border: 1px solid #d6e1d8; border-radius: 13px;\n  background: #ffffff !important; color: #17211a !important;\n  -webkit-text-fill-color: #17211a !important; caret-color: #17211a !important;\n  font-family: inherit; font-size: 24px; font-weight: 700; letter-spacing: 5px;\n  text-align: center; outline: none; opacity: 1 !important;\n  user-select: text !important; -webkit-user-select: text !important;\n  -webkit-appearance: none; appearance: none; position: relative; z-index: 1;\n}\n#melonitorTestGate input::placeholder {\n  color: #8a968c !important; -webkit-text-fill-color: #8a968c !important;\n  font-size: 15px; font-weight: 400; letter-spacing: 0;\n}\n#melonitorTestGate input:focus {\n  border-color: #3e9453; box-shadow: 0 0 0 3px rgba(62,148,83,.13);\n}\n#melonitorTestGate button {\n  height: 50px; border: 0; border-radius: 13px;\n  background: #21843e; color: #ffffff;\n  font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer;\n}\n#melonitorTestGate button:hover { background: #176d31; }\n#melonitorTestGate .test-lock-status {\n  min-height: 20px; margin: 12px 0 0; color: #c0392b; font-size: 13px;\n}\n#melonitorTestGate .test-lock-note {\n  margin: 17px 0 0; color: #879188; font-size: 11px; line-height: 1.5;\n}\n#melonitorTestGate, #melonitorTestGate * { pointer-events: auto !important; }"
  document.head.appendChild(style);

  function showGate() {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "unlocked") {
        root.classList.remove("melonitor-test-locked");
        return;
      }
    } catch (_) {}

    if (!document.body || document.getElementById("melonitorTestGate")) return;

    const gate = document.createElement("div");
    gate.id = "melonitorTestGate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "testLockTitle");
    gate.innerHTML =
      "<section class='test-lock-card'>" +
        "<div class='test-lock-logo' aria-hidden='true'>🍈</div>" +
        "<h1 id='testLockTitle'>Melonitor</h1>" +
        "<span class='test-lock-badge'>베타 테스트 Ver.</span>" +
        "<p class='test-lock-description'>테스트 버전에 접속하려면<br>6자리 암호를 입력해 주세요.</p>" +
        "<form id='testLockForm'>" +
          "<input id='testLockPin' type='text' inputmode='numeric' maxlength='6' autocomplete='off' autocapitalize='off' spellcheck='false' aria-label='6자리 암호' placeholder='숫자 6자리' style='display:block!important;visibility:visible!important;opacity:1!important;color:#111111!important;-webkit-text-fill-color:#111111!important;background:#ffffff!important;font-size:24px!important;letter-spacing:5px!important;'>" +
          "<button type='submit'>입장하기</button>" +
        "</form>" +
        "<p id='testLockStatus' class='test-lock-status' role='alert' aria-live='polite'></p>" +
        "<p class='test-lock-note'>이 잠금은 베타 화면의 간단한 접근 제한용입니다.</p>" +
      "</section>";

    document.body.appendChild(gate);

    const form = gate.querySelector("#testLockForm");
    const pin = gate.querySelector("#testLockPin");
    const status = gate.querySelector("#testLockStatus");

    // Do not rewrite pin.value while the user is typing; let the browser display every keystroke.
    pin.addEventListener("input", function () {
      status.textContent = "";
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const button = form.querySelector("button");
      button.disabled = true;
      button.textContent = "확인 중...";
      if (pin.value.length !== 6) {
        status.textContent = "숫자 6자리를 입력해 주세요.";
        button.disabled = false;
        button.textContent = "입장하기";
        pin.focus();
        return;
      }
      const matched = matchesPin(pin.value);
      if (matched) {
        try { sessionStorage.setItem(SESSION_KEY, "unlocked"); } catch (_) {}
        root.classList.remove("melonitor-test-locked");
        gate.remove();
      } else {
        status.textContent = "암호가 올바르지 않아요. 다시 입력해 주세요.";
        pin.value = "";
        pin.focus();
      }
      button.disabled = false;
      button.textContent = "입장하기";
    });

    // Set focus after the page's other DOMContentLoaded handlers have run.
    window.setTimeout(function () { pin.focus(); }, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showGate, { once: true });
  } else {
    showGate();
  }
})();