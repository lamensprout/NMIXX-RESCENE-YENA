(function () {
  "use strict";

  // 테스트 버전용 간단한 화면 잠금입니다. 정식 보안 인증 수단은 아닙니다.
  const ACCESS_PIN = "518001";
  function matchesPin(value) {
    return value === ACCESS_PIN;
  }
  const SESSION_KEY = "melonitor-test-access-v2";
  const root = document.documentElement;

  try {
    if (sessionStorage.getItem(SESSION_KEY) === "unlocked") return;
  } catch (_) {}

  root.classList.add("melonitor-test-locked");

  const style = document.createElement("style");
  style.textContent = "html.melonitor-test-locked,html.melonitor-test-locked body{min-height:100%;}html.melonitor-test-locked body>*:not(#melonitorTestGate){visibility:hidden!important;}#melonitorTestGate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;box-sizing:border-box;padding:24px;background:radial-gradient(ellipse at top,#e4f7d9 0%,#f2f7f0 38%,#f7f8fa 100%);color:#183323;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;visibility:visible!important;}#melonitorTestGate *{box-sizing:border-box;}#melonitorTestGate .test-lock-card{width:min(100%,390px);padding:34px 28px 28px;border:1px solid rgba(35,91,51,.13);border-radius:24px;background:rgba(255,255,255,.96);box-shadow:0 22px 70px rgba(24,51,35,.13);text-align:center;visibility:visible!important;}#melonitorTestGate .test-lock-logo{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 17px;border-radius:18px;background:#e8f5e8;font-size:30px;}#melonitorTestGate h1{margin:0;font-size:24px;letter-spacing:-.6px;}#melonitorTestGate .test-lock-badge{display:inline-block;margin:9px 0 0;padding:5px 10px;border-radius:999px;background:#eef6ec;color:#387146;font-size:12px;font-weight:700;}#melonitorTestGate .test-lock-description{margin:19px 0 21px;color:#657369;font-size:14px;line-height:1.65;}#melonitorTestGate form{display:grid;gap:12px;}#melonitorTestGate input{width:100%;height:54px;border:1px solid #d6e1d8;border-radius:13px;background:#fbfdfb;color:#183323;font-size:24px;font-weight:700;letter-spacing:9px;text-align:center;outline:none;}#melonitorTestGate input:focus{border-color:#3e9453;box-shadow:0 0 0 3px rgba(62,148,83,.13);}#melonitorTestGate button{height:50px;border:0;border-radius:13px;background:#21843e;color:white;font-size:15px;font-weight:700;cursor:pointer;}#melonitorTestGate button:hover{background:#176d31;}#melonitorTestGate .test-lock-status{min-height:20px;margin:12px 0 0;color:#c0392b;font-size:13px;}#melonitorTestGate .test-lock-note{margin:17px 0 0;color:#879188;font-size:11px;line-height:1.5;}@media(prefers-color-scheme:dark){#melonitorTestGate{background:radial-gradient(ellipse at top,#183c27 0%,#111b14 45%,#101411 100%);color:#e8f2e9;}#melonitorTestGate .test-lock-card{border-color:#35493a;background:#19231c;}#melonitorTestGate .test-lock-logo,#melonitorTestGate .test-lock-badge{background:#263d2c;color:#c9e8ce;}#melonitorTestGate .test-lock-description{color:#b0beb3;}#melonitorTestGate input{border-color:#405447;background:#121a14;color:#f3fbf4;}#melonitorTestGate .test-lock-note{color:#8c9b90;}}";
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
          "<input id='testLockPin' type='password' inputmode='numeric' pattern='[0-9]{6}' maxlength='6' minlength='6' autocomplete='off' aria-label='6자리 암호' placeholder='••••••' required>" +
          "<button type='submit'>입장하기</button>" +
        "</form>" +
        "<p id='testLockStatus' class='test-lock-status' role='alert' aria-live='polite'></p>" +
        "<p class='test-lock-note'>이 잠금은 베타 화면의 간단한 접근 제한용입니다.</p>" +
      "</section>";

    document.body.appendChild(gate);

    const form = gate.querySelector("#testLockForm");
    const pin = gate.querySelector("#testLockPin");
    const status = gate.querySelector("#testLockStatus");

    pin.addEventListener("input", function () {
      pin.value = pin.value.replace(/[^0-9]/g, "").slice(0, 6);
      status.textContent = "";
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const button = form.querySelector("button");
      button.disabled = true;
      button.textContent = "확인 중...";
      const matched = await matchesPin(pin.value);
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

    pin.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showGate, { once: true });
  } else {
    showGate();
  }
})();