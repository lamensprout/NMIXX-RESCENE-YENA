(() => {
  const setupNotice = document.getElementById("accountSetupNotice");
  const status = document.getElementById("accountStatus");
  const authForm = document.getElementById("authForm");
  const emailInput = document.getElementById("accountEmail");
  const passwordInput = document.getElementById("accountPassword");
  const signedInPanel = document.getElementById("signedInPanel");
  const signedInEmail = document.getElementById("signedInEmail");
  const message = document.getElementById("accountMessage");
  const signInButton = document.getElementById("signInButton");
  const signUpButton = document.getElementById("signUpButton");
  const signOutButton = document.getElementById("signOutButton");

  function setMessage(text, error) {
    message.textContent = text || "";
    message.classList.toggle("is-error", !!error);
  }

  function showSignedIn(user) {
    const signedIn = !!user;
    authForm.hidden = signedIn || !MonitorStore.isConfigured();
    signedInPanel.hidden = !signedIn;
    setupNotice.hidden = MonitorStore.isConfigured();
    status.hidden = !signedIn;
    if (signedIn) {
      signedInEmail.textContent = user.email || "로그인 완료";
      status.textContent = "계정에 연결됐어요. 검색 기록과 즐겨찾기가 동기화됩니다.";
    } else if (!MonitorStore.isConfigured()) {
      status.hidden = false;
      status.textContent = "현재는 브라우저별 로컬 저장 방식으로 이용할 수 있어요.";
    }
    signInButton.disabled = !MonitorStore.isConfigured();
    signUpButton.disabled = !MonitorStore.isConfigured();
  }

  async function init() {
    if (window.MonitorStore) await MonitorStore.init();
    showSignedIn(MonitorStore.getUser());
    if (!MonitorStore.isConfigured()) {
      setMessage("계정 연결을 완료하면 회원가입과 로그인을 사용할 수 있어요.");
    }
  }

  signUpButton.addEventListener("click", async () => {
    if (!authForm.reportValidity()) return;
    setMessage("회원가입을 처리하고 있어요.");
    signUpButton.disabled = true;
    try {
      const { data, error } = await MonitorStore.signUp(
        emailInput.value.trim(),
        passwordInput.value
      );
      if (error) throw error;
      if (data.session && data.user) {
        await MonitorStore.init();
        showSignedIn(data.user);
        setMessage("회원가입 및 로그인이 완료됐어요.");
      } else {
        setMessage("가입 확인 이메일을 확인해 주세요. 이메일 확인 후 로그인하면 돼요.");
      }
    } catch (error) {
      setMessage(error.message || "회원가입에 실패했어요. 입력 내용을 확인해 주세요.", true);
    } finally {
      signUpButton.disabled = !MonitorStore.isConfigured();
    }
  });

  signInButton.addEventListener("click", async () => {
    if (!authForm.reportValidity()) return;
    setMessage("로그인하고 있어요.");
    signInButton.disabled = true;
    try {
      const { data, error } = await MonitorStore.signIn(
        emailInput.value.trim(),
        passwordInput.value
      );
      if (error) throw error;
      showSignedIn(data.user);
      passwordInput.value = "";
      setMessage("로그인됐어요. 저장된 기록을 불러왔어요.");
    } catch (error) {
      setMessage(error.message || "로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요.", true);
    } finally {
      signInButton.disabled = !MonitorStore.isConfigured();
    }
  });

  signOutButton.addEventListener("click", async () => {
    setMessage("로그아웃하고 있어요.");
    try {
      const { error } = await MonitorStore.signOut();
      if (error) throw error;
      showSignedIn(null);
      setMessage("로그아웃됐어요. 이 브라우저에 저장된 즐겨찾기는 유지돼요.");
    } catch (error) {
      setMessage(error.message || "로그아웃에 실패했어요.", true);
    }
  });

  window.addEventListener("melonitor-auth-change", event => {
    showSignedIn(event.detail && event.detail.user);
  });

  init().catch(error => {
    console.error(error);
    setMessage("계정 상태를 불러오지 못했어요.", true);
  });
})();
