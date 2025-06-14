import { apiFetch } from "./api.js";

const slides = [
  {
    img: "/assets/speaker.svg",
    title: "오늘은 어떤 노래 듣지?",
    desc: "오스틸에서 내가 듣고 싶은 노래를<br/>내가 직접 점심방송 신청곡으로 신청하세요!",
  },
  {
    img: "/assets/post.svg",
    title: "내 사연을 공유할래요",
    desc: "오스틸에서 모두에게 들려줄 나의 사연을<br/>직접 점심방송 사연으로 신청하세요!",
  },
  {
    img: "/assets/mic.svg",
    title: "학교 점심방송, 내손으로",
    desc: "여러분의 적극적인 노래 신청과 사연 신청으로<br/>보다 풍성한 점심방송이 만들어져요!",
  },
];

let currentSlide = 0;
let regStep = 0;
let dupChecked = false;
let lastCheckedId = "";

const loginForm = document.getElementById("login-form");
const registerForm1 = document.getElementById("register-form1");
const registerForm2 = document.getElementById("register-form2");
const usernameInput = registerForm1.querySelector('[name="username"]');

function renderSlide() {
  const slide = slides[currentSlide];
  document.getElementById("slide-area").innerHTML = `
    <img src="${slide.img}" alt="" class="slide-img" />
    <div class="slide-title">${slide.title}</div>
    <div class="slide-desc">${slide.desc}</div>
    <div class="slide-indicator">
      ${slides
        .map(
          (_, i) =>
            `<span class="slide-dot${
              i === currentSlide ? " active" : ""
            }"></span>`
        )
        .join("")}
    </div>
  `;
}

function startSlideAutoAdvance() {
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    renderSlide();
  }, 5000);
}

function showLoginForm() {
  loginForm.style.display = "block";
  registerForm1.style.display = "none";
  registerForm2.style.display = "none";
  regStep = 0;
  currentSlide = 0;
  renderSlide();
}
function showRegisterStep1() {
  loginForm.style.display = "none";
  registerForm1.style.display = "block";
  registerForm2.style.display = "none";
  regStep = 1;
  currentSlide = 1;
  renderSlide();
}
function showRegisterStep2() {
  registerForm1.style.display = "none";
  registerForm2.style.display = "block";
  regStep = 2;
  currentSlide = 2;
  renderSlide();
}

// 중복확인
async function checkUsernameDuplication() {
  const username = usernameInput.value.trim();
  const msg = document.getElementById("dup-msg");
  msg.textContent = "";
  if (!username) {
    msg.textContent = "아이디를 입력하세요.";
    msg.className = "msg-err";
    dupChecked = false;
    return;
  }
  msg.textContent = "확인 중...";
  const res = await apiFetch(`/auth/check-id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    msg.textContent = "서버 오류가 발생했습니다.";
    msg.className = "msg-err";
    dupChecked = false;
    return;
  }
  const { exists } = await res.json();
  if (exists) {
    msg.textContent = "이미 사용 중인 아이디입니다.";
    msg.className = "msg-err";
    dupChecked = false;
  } else {
    msg.textContent = "사용 가능한 아이디입니다!";
    msg.className = "msg-ok";
    dupChecked = true;
    lastCheckedId = username;
  }
}

// 회원가입 1단계
function handleRegisterStep1() {
  const username = usernameInput.value.trim();
  const name = registerForm1.querySelector('[name="name"]').value.trim();
  const msg = document.getElementById("dup-msg");
  if (!username || !name) return alert("모든 항목을 입력하세요.");
  if (!dupChecked || lastCheckedId !== username) {
    msg.textContent = "아이디 중복확인을 해주세요.";
    msg.className = "msg-err";
    return;
  }
  apiFetch("/songs").then(() => {
    showRegisterStep2();
  });
}

// 회원가입 2단계
async function handleRegisterStep2() {
  const pw1 = document.getElementById("pw1").value;
  const pw2 = document.getElementById("pw2").value;
  if (pw1.length < 8) return alert("비밀번호는 8자 이상이어야 합니다.");
  if (pw1 !== pw2) return alert("비밀번호가 일치하지 않습니다.");
  const res = await apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: registerForm1.querySelector('[name="username"]').value,
      name: registerForm1.querySelector('[name="name"]').value,
      password: pw1,
    }),
  });
  if (res.status === 201 || res.ok) {
    alert("회원가입이 완료되었습니다! 로그인 해주세요.");
    showLoginForm();
    registerForm1.reset();
    registerForm2.reset();
  } else {
    const data = await res.json().catch(() => null);
    alert(
      data && data.message ? data.message : "회원가입 실패(중복 아이디 등)"
    );
  }
}

// 로그인
async function handleLogin(e) {
  e.preventDefault();
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value;
  const msgSpan = document.getElementById("login-msg");
  msgSpan.textContent = "";
  if (!username || !password) return;
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    msgSpan.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    msgSpan.className = "msg-err";
    return;
  }
  const data = await res.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("name", data.name);
  window.location.href = "submit";
}

// 비밀번호 일치 체크
function checkPasswordMatch() {
  const pw1 = document.getElementById("pw1").value;
  const pw2 = document.getElementById("pw2").value;
  const msg = document.getElementById("pw-msg");
  if (!pw2) msg.textContent = "";
  else if (pw1 === pw2) {
    msg.textContent = "비밀번호가 일치합니다.";
    msg.className = "msg-ok";
  } else {
    msg.textContent = "비밀번호가 다릅니다.";
    msg.className = "msg-err";
  }
}

function setEventListeners() {
  document.getElementById("to-register").onclick = showRegisterStep1;
  document.getElementById("to-login1").onclick = showLoginForm;
  document.getElementById("to-login2").onclick = showRegisterStep1;
  usernameInput.addEventListener("input", () => {
    dupChecked = false;
    lastCheckedId = "";
    document.getElementById("dup-msg").textContent = "";
  });
  document.getElementById("dupcheck-btn").onclick = checkUsernameDuplication;
  document.getElementById("register-next1").onclick = handleRegisterStep1;
  document.getElementById("register-next2").onclick = handleRegisterStep2;
  loginForm.onsubmit = handleLogin;
  document.getElementById("pw2").oninput = checkPasswordMatch;
}

function init() {
  renderSlide();
  startSlideAutoAdvance();
  setEventListeners();
}

init();
