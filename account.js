(() => {
  const setupNotice = document.getElementById("accountSetupNotice");
  const status = document.getElementById("accountStatus");
  const authForm = document.getElementById("authForm");
  const emailInput = document.getElementById("accountEmail");
  const passwordInput = document.getElementById("accountPassword");
  const nicknamePanel = document.getElementById("nicknamePanel");
  const nicknameForm = document.getElementById("nicknameForm");
  const nicknameInput = document.getElementById("nicknameInput");
  const saveNicknameButton = document.getElementById("saveNicknameButton");
  const signedInPanel = document.getElementById("signedInPanel");
  const signedInNickname = document.getElementById("signedInNickname");
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
    const configured = MonitorStore.isConfigured();
    const signedIn = !!user;
    const hasNickname = signedIn && MonitorStore.hasNickname();

    authForm.hidden = signedIn || !configured;
    nicknamePanel.hidden = !signedIn || hasNickname;
    signedInPanel.hidden = !hasNickname;
    setupNotice.hidden = configured;
    status.hidden = !signedIn && configured;

    if (signedIn && !hasNickname) {
      status.hidden = false;
      status.textContent = "이메일 인증이 완료됐어요. 사이트를 사용하기 전에 필수 닉네임을 설정해 주세요.";
    } else if (hasNickname) {
      status.hidden = false;
      status.textContent = "이메일 인증과 닉네임 설정이 모두 완료됐어요.";
      signedInNickname.textContent = MonitorStore.getNickname();
      signedInEmail.textContent = user.email || "";
    } else if (!configured) {
      status.hidden = false;
      status.textContent = "Supabase 연결을 완료해야 회원가입과 로그인을 사용할 수 있어요.";
    }

    signInButton.disabled = !configured;
    signUpButton.disabled = !configured;
    saveNicknameButton.disabled = !configured || !signedIn || hasNickname;
  }

  async function init() {
    if (window.MonitorStore) await MonitorStore.init();
    showSignedIn(MonitorStore.getUser());
    if (!MonitorStore.isConfigured()) {
      setMessage("계정 연결을 완료하면 이메일 인증, 회원가입, 닉네임 설정을 사용할 수 있어요.");
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

      passwordInput.value = "";
      if (data.emailConfirmationDisabled) {
        showSignedIn(null);
        setMessage("현재 Supabase에서 이메일 인증이 꺼져 있어요. Supabase Authentication 설정에서 Confirm email을 켠 뒤 다시 가입해 주세요. 인증이 켜져야 이메일 확인 후에만 이용할 수 있어요.", true);
      } else {
        showSignedIn(MonitorStore.getUser());
        setMessage("인증 메일을 보냈어요. 받은 편지함에서 인증 링크를 먼저 누르세요. 인증이 완료되면 이 페이지에서 필수 닉네임을 설정할 수 있어요.");
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
      setMessage(MonitorStore.hasNickname()
        ? "로그인됐어요. 저장된 검색 기록과 즐겨찾기를 불러왔어요."
        : "이메일 인증이 확인됐어요. 계속하려면 필수 닉네임을 설정해 주세요.");
    } catch (error) {
      setMessage(error.message || "로그인에 실패했어요. 이메일 인증 여부와 입력 내용을 확인해 주세요.", true);
    } finally {
      signInButton.disabled = !MonitorStore.isConfigured();
    }
  });

  nicknameForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!nicknameForm.reportValidity()) return;

    const nickname = nicknameInput.value.trim();
    if (!/^[가-힣A-Za-z0-9_]{2,16}$/.test(nickname)) {
      setMessage("닉네임은 한글 또는 영어로 2~16자여야 해요. 숫자와 밑줄(_)도 사용할 수 있어요.", true);
      return;
    }

    saveNicknameButton.disabled = true;
    setMessage("닉네임을 저장하고 있어요.");
    try {
      await MonitorStore.saveNickname(nickname);
      showSignedIn(MonitorStore.getUser());
      setMessage("닉네임 설정이 완료됐어요! 이제 Melonitor를 이용할 수 있어요.");
      nicknameInput.value = "";
    } catch (error) {
      setMessage(error.message || "닉네임을 저장하지 못했어요.", true);
    } finally {
      saveNicknameButton.disabled = !MonitorStore.isConfigured() || MonitorStore.hasNickname();
    }
  });

  signOutButton.addEventListener("click", async () => {
    setMessage("로그아웃하고 있어요.");
    try {
      const { error } = await MonitorStore.signOut();
      if (error) throw error;
      showSignedIn(null);
      setMessage("로그아웃됐어요. 다시 이용하려면 로그인해 주세요.");
    } catch (error) {
      setMessage(error.message || "로그아웃에 실패했어요.", true);
    }
  });

  window.addEventListener("melonitor-auth-change", event => {
    showSignedIn(event.detail && event.detail.user);
  });

  init().catch(error => {
    console.error(error);
    setMessage("계정 상태를 불러오지 못했어요. Supabase 테이블 설정을 확인해 주세요.", true);
  });
})();
