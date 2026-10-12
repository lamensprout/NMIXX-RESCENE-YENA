(() => {
  const setupNotice = document.getElementById("accountSetupNotice");
  const status = document.getElementById("accountStatus");
  const signupEmailPanel = document.getElementById("signupEmailPanel");
  const signupEmailForm = document.getElementById("signupEmailForm");
  const signupEmailInput = document.getElementById("signupEmailInput");
  const sendVerificationButton = document.getElementById("sendVerificationButton");
  const verificationSentPanel = document.getElementById("verificationSentPanel");
  const resendVerificationButton = document.getElementById("resendVerificationButton");
  const verificationOtpForm = document.getElementById("verificationOtpForm");
  const verificationCodeInput = document.getElementById("verificationCodeInput");
  const verifyOtpButton = document.getElementById("verifyOtpButton");
  const chooseLoginButton = document.getElementById("chooseLoginButton");
  const chooseSignupButton = document.getElementById("chooseSignupButton");
  const authChoice = document.getElementById("authChoice");
  const loginPanel = document.getElementById("loginPanel");
  const authForm = document.getElementById("authForm");
  const emailInput = document.getElementById("accountEmail");
  const passwordInput = document.getElementById("accountPassword");
  const nicknamePanel = document.getElementById("nicknamePanel");
  const nicknameForm = document.getElementById("nicknameForm");
  const nicknameInput = document.getElementById("nicknameInput");
  const signupPasswordInput = document.getElementById("signupPassword");
  const completeSignupButton = document.getElementById("completeSignupButton");
  const signedInPanel = document.getElementById("signedInPanel");
  const signedInNickname = document.getElementById("signedInNickname");
  const signedInEmail = document.getElementById("signedInEmail");
  const message = document.getElementById("accountMessage");
  const signInButton = document.getElementById("signInButton");
  const signOutButton = document.getElementById("signOutButton");
  let authMode = "signup";

  function setAuthMode(mode) {
    authMode = mode;
    if (chooseLoginButton) chooseLoginButton.classList.toggle("is-active", mode === "login");
    if (chooseSignupButton) chooseSignupButton.classList.toggle("is-active", mode === "signup");
    if (chooseLoginButton) chooseLoginButton.setAttribute("aria-pressed", mode === "login" ? "true" : "false");
    if (chooseSignupButton) chooseSignupButton.setAttribute("aria-pressed", mode === "signup" ? "true" : "false");
    const ready = MonitorStore.isConfigured() && !MonitorStore.getUser();
    signupEmailPanel.hidden = !ready || mode !== "signup";
    loginPanel.hidden = !ready || mode !== "login";
  }

  function setMessage(text, error) {
    message.textContent = text || "";
    message.classList.toggle("is-error", !!error);
  }

  function showSignedIn(user) {
    const configured = MonitorStore.isConfigured();
    const signedIn = !!user;
    const hasNickname = signedIn && MonitorStore.hasNickname();

    setupNotice.hidden = configured;
    if (authChoice) authChoice.hidden = !configured || signedIn;
    setAuthMode(authMode);
    nicknamePanel.hidden = !configured || !signedIn || hasNickname;
    signedInPanel.hidden = !configured || !hasNickname;
    status.hidden = true;

    if (signedIn && !hasNickname) {
      status.hidden = false;
      status.textContent = "이메일 인증이 완료됐어요. 닉네임과 비밀번호를 설정해 주세요.";
    } else if (hasNickname) {
      status.hidden = false;
      status.textContent = "로그인됐어요. 이제 Melonitor를 이용할 수 있어요.";
      signedInNickname.textContent = MonitorStore.getNickname();
      signedInEmail.textContent = user.email || "";
    } else if (!configured) {
      status.hidden = false;
      status.textContent = "Supabase 연결을 완료해야 회원가입과 로그인을 사용할 수 있어요.";
    }

    signInButton.disabled = !configured;
    sendVerificationButton.disabled = !configured;
    resendVerificationButton.disabled = !configured;
    if (verifyOtpButton) verifyOtpButton.disabled = !configured;
    completeSignupButton.disabled = !configured || !signedIn || hasNickname;
  }

  async function sendVerificationEmail(isResend = false) {
    if (!signupEmailForm.reportValidity()) return;
    const email = signupEmailInput.value.trim();
    sendVerificationButton.disabled = true;
    resendVerificationButton.disabled = true;
    if (verifyOtpButton) verifyOtpButton.disabled = true;
    setMessage(isResend ? "인증 코드를 다시 보내고 있어요." : "인증 코드를 보내고 있어요.");

    try {
      const result = isResend
        ? await MonitorStore.resendSignupVerification(email)
        : await MonitorStore.startSignup(email);
      const data = result.data;
      const error = result.error;
      if (error) throw error;

      if (data && data.emailConfirmationDisabled) {
        setMessage("이메일 인증이 꺼져 있어 가입 절차를 시작할 수 없어요. Supabase에서 Confirm email을 켜 주세요.", true);
        return;
      }

      verificationSentPanel.hidden = false;
      sendVerificationButton.textContent = "인증 코드 다시 보내기";
      setMessage("인증 코드를 요청했어요. 받은 메일에서 6자리 숫자를 찾아 입력해 주세요. 이미 가입한 계정이라면 아래 로그인에서 이메일과 비밀번호로 로그인해 주세요.");
      verificationCodeInput.focus();
    } catch (error) {
      setMessage(error.message || "인증 코드를 보내지 못했어요. 이메일을 확인한 뒤 다시 시도해 주세요.", true);
    } finally {
      sendVerificationButton.disabled = !MonitorStore.isConfigured();
      resendVerificationButton.disabled = !MonitorStore.isConfigured();
      if (verifyOtpButton) verifyOtpButton.disabled = !MonitorStore.isConfigured();
    }
  }

  async function verifySignupCode(event) {
    event.preventDefault();
    if (!verificationOtpForm.reportValidity()) return;

    verifyOtpButton.disabled = true;
    resendVerificationButton.disabled = true;
    setMessage("인증 코드를 확인하고 있어요.");
    try {
      const result = await MonitorStore.verifySignupOtp(
        signupEmailInput.value.trim(),
        verificationCodeInput.value.trim()
      );
      if (result.error) throw result.error;

      verificationCodeInput.value = "";
      verificationSentPanel.hidden = true;
      showSignedIn(MonitorStore.getUser());
      setMessage("이메일 인증이 완료됐어요. 이제 닉네임과 비밀번호를 설정해 주세요.");
    } catch (error) {
      setMessage(error.message || "인증에 실패했어요. 6자리 코드를 확인하고 다시 시도해 주세요.", true);
    } finally {
      verifyOtpButton.disabled = !MonitorStore.isConfigured();
      resendVerificationButton.disabled = !MonitorStore.isConfigured();
    }
  }

  async function init() {
    if (window.MonitorStore) await MonitorStore.init();
    showSignedIn(MonitorStore.getUser());

    if (!MonitorStore.isConfigured()) {
      setMessage("계정 연결을 완료하면 이메일 인증, 회원가입, 닉네임 설정을 사용할 수 있어요.");
    }
  }

  signupEmailForm.addEventListener("submit", async event => {
    event.preventDefault();
    await sendVerificationEmail();
  });

  if (verificationOtpForm) {
    verificationOtpForm.addEventListener("submit", verifySignupCode);
  }
  verificationCodeInput.addEventListener("input", () => {
    verificationCodeInput.value = verificationCodeInput.value.replace(/[^0-9]/g, "").slice(0, 6);
  });
  resendVerificationButton.addEventListener("click", () => sendVerificationEmail(true));

  chooseLoginButton.addEventListener("click", () => {
    setAuthMode("login");
    emailInput.focus();
  });

  chooseSignupButton.addEventListener("click", () => {
    setAuthMode("signup");
    signupEmailInput.focus();
  });

  authForm.addEventListener("submit", async event => {
    event.preventDefault();
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
        : "이메일 인증이 확인됐어요. 닉네임과 비밀번호 설정을 완료해 주세요.");
    } catch (error) {
      setMessage(error.message || "로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요.", true);
    } finally {
      signInButton.disabled = !MonitorStore.isConfigured();
    }
  });

  nicknameForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!nicknameForm.reportValidity()) return;

    const nickname = nicknameInput.value.trim();
    const password = signupPasswordInput.value;
    const nicknameError = MonitorStore.getNicknameValidationError(nickname);
    if (nicknameError) {
      setMessage(nicknameError, true);
      return;
    }
    if (password.length < 8 || password.length > 72) {
      setMessage("비밀번호는 8~72자로 설정해 주세요.", true);
      return;
    }

    completeSignupButton.disabled = true;
    setMessage("닉네임과 비밀번호를 저장하고 있어요.");
    try {
      await MonitorStore.completeSignup(nickname, password);
      showSignedIn(MonitorStore.getUser());
      nicknameInput.value = "";
      signupPasswordInput.value = "";
      setMessage("설정이 완료됐어요! 다음부터는 이메일과 비밀번호로 로그인하면 돼요.");
    } catch (error) {
      setMessage(error.message || "설정을 저장하지 못했어요. 입력 내용을 확인해 주세요.", true);
    } finally {
      completeSignupButton.disabled = !MonitorStore.isConfigured() || MonitorStore.hasNickname();
    }
  });

  signOutButton.addEventListener("click", async () => {
    setMessage("로그아웃하고 있어요.");
    try {
      const { error } = await MonitorStore.signOut();
      if (error) throw error;
      setAuthMode("login");
      showSignedIn(null);
      setMessage("로그아웃됐어요. 다시 이용하려면 이메일과 비밀번호로 로그인해 주세요.");
    } catch (error) {
      setMessage(error.message || "로그아웃에 실패했어요.", true);
    }
  });

  window.addEventListener("melonitor-auth-change", event => {
    showSignedIn(event.detail && event.detail.user);
  });

  init().catch(error => {
    console.error(error);
    setMessage("계정 상태를 불러오지 못했어요. Supabase 설정을 확인해 주세요.", true);
  });
})();
