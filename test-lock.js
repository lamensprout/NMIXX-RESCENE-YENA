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

  function clearStoredAccess() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
  }

  function noteNavigation(destinationUrl) {
    try {
      const destination = new URL(destinationUrl, window.location.href);
      if (destination.origin === window.location.origin) {
        internalNavigationPending = true;
      } else {
        internalNavigationPending = false;
        clearStoredAccess();
      }
    } catch (_) {
      internalNavigationPending = false;
      clearStoredAccess();
    }
  }

  // Keep access during navigation inside Melonitor, but forget it when this tab leaves the site.
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!target || target.hasAttribute("download") ||
        (target.target && target.target.toLowerCase() === "_blank")) return;
    noteNavigation(target.href);
  });

  // Chromium's Navigation API also catches address-bar changes and script-driven redirects.
  if (window.navigation && typeof window.navigation.addEventListener === "function") {
    window.navigation.addEventListener("navigate", function (event) {
      if (event.destination && event.destination.url) noteNavigation(event.destination.url);
    });
  }

  window.__melonitorMarkInternalNavigation = function (url) {
    noteNavigation(new URL(url, window.location.href).href);
  };

  window.addEventListener("pagehide", function () {
    if (!internalNavigationPending) clearStoredAccess();
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
  style.textContent = "html.melonitor-test-locked,html.melonitor-test-locked body{min-height:100%;}html.melonitor-test-locked body>*:not(#melonitorTestGate){visibility:hidden!important;}#melonitorTestGate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;box-sizing:border-box;padding:24px;background:radial-gradient(ellipse at top,#e4f7d9 0%,#f2f7f0 38%,#f7f8fa 100%);color:#183323;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;visibility:visible!important;}#melonitorTestGate *{box-sizing:border-box;}#melonitorTestGate .test-lock-card{width:min(100%,390px);padding:34px 28px 28px;border:1px solid rgba(35,91,51,.13);border-radius:24px;background:rgba(255,255,255,.96);box-shadow:0 22px 70px rgba(24,51,35,.13);text-align:center;visibility:visible!important;}#melonitorTestGate .test-lock-logo{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 17px;border-radius:18px;background:#e8f5e8;font-size:30px;}#melonitorTestGate h1{margin:0;font-size:24px;letter-spacing:-.6px;}#melonitorTestGate .test-lock-badge{display:inline-block;margin:9px 0 0;padding:5px 10px;border-radius:999px;background:#eef6ec;color:#387146;font-size:12px;font-weight:700;}#melonitorTestGate .test-lock-description{margin:19px 0 21px;color:#657369;font-size:14px;line-height:1.65;}#melonitorTestGate form{display:grid;gap:12px;}#melonitorTestGate input{width:100%;height:54px;border:1px solid #d6e1d8;border-radius:13px;background:#fbfdfb;color:#183323;font-size:24px;font-weight:700;letter-spacing:9px;text-align:center;outline:none;}#melonitorTestGate input:focus{border-color:#3e9453;box-shadow:0 0 0 3px rgba(62,148,83,.13);}#melonitorTestGate button{height:50px;border:0;border-radius:13px;background:#21843e;color:white;font-size:15px;font-weight:700;cursor:pointer;}#melonitorTestGate button:hover{background:#176d31;}#melonitorTestGate .test-lock-status{min-height:20px;margin:12px 0 0;color:#c0392b;font-size:13px;}#melonitorTestGate .test-lock-note{margin:17px 0 0;color:#879188;font-size:11px;line-height:1.5;}@media(prefers-color-scheme:dark){#melonitorTestGate{background:radial-gradient(ellipse at top,#183c27 0%,#111b14 45%,#101411 100%);color:#e8f2e9;}#melonitorTestGate .test-lock-card{border-color:#35493a;background:#19231c;}#melonitorTestGate .test-lock-logo,#melonitorTestGate .test-lock-badge{background:#263d2c;color:#c9e8ce;}#melonitorTestGate .test-lock-description{color:#b0beb3;}#melonitorTestGate input{border-color:#405447;background:#121a14;color:#f3fbf4;}#melonitorTestGate .test-lock-note{color:#8c9b90;}#melonitorTestGate,#melonitorTestGate *{pointer-events:auto!important;}#melonitorTestGate .test-lock-card{pointer-events:auto!important;}#melonitorTestGate input{position:relative;z-index:1;user-select:text!important;-webkit-user-select:text!important;-webkit-appearance:none;appearance:none;color:#183323!important;-webkit-text-fill-color:#183323!important;opacity:1!important;}#melonitorTestGate .test-lock-pin-preview{margin-top:-3px;min-height:32px;padding:7px 10px;border:1px solid #dce8dd;border-radius:10px;background:#f4faf4;color:#183323!important;-webkit-text-fill-color:#183323!important;font-size:20px;font-weight:800;letter-spacing:2px;line-height:1.2;overflow-wrap:anywhere;user-select:text;-webkit-user-select:text;}@media(prefers-color-scheme:dark){#melonitorTestGate .test-lock-pin-preview{border-color:#405447;background:#121a14;color:#f3fbf4!important;-webkit-text-fill-color:#f3fbf4!important;}}";
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
          "<input id='testLockPin' type='text' inputmode='numeric' maxlength='6' autocomplete='off' autocapitalize='off' spellcheck='false' aria-label='6자리 암호' aria-describedby='testLockPinPreview' placeholder='숫자 6자리'>" +
          "<div id='testLockPinPreview' class='test-lock-pin-preview' aria-live='polite'>입력한 숫자가 여기에 표시돼요</div>" +
          "<button type='submit'>입장하기</button>" +
        "</form>" +
        "<p id='testLockStatus' class='test-lock-status' role='alert' aria-live='polite'></p>" +
        "<p class='test-lock-note'>이 잠금은 베타 화면의 간단한 접근 제한용입니다.</p>" +
      "</section>";

    document.body.appendChild(gate);

    const form = gate.querySelector("#testLockForm");
    const pin = gate.querySelector("#testLockPin");
    const status = gate.querySelector("#testLockStatus");
    const preview = gate.querySelector("#testLockPinPreview");

    pin.addEventListener("input", function () {
      pin.value = pin.value.replace(/[^0-9]/g, "").slice(0, 6);
      preview.textContent = pin.value ? pin.value.split("").join(" ") : "입력한 숫자가 여기에 표시돼요";
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
        preview.textContent = "입력한 숫자가 여기에 표시돼요";
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