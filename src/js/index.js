import { apiFetch } from "./api.js";

// 슬라이드 컨텐츠 (이미지는 대체 텍스트)
const slides = [
  {
    img: "📢",
    title: "오늘은 어떤 노래 듣지?",
    desc: "오스틸에서 내가 듣고 싶은 노래를<br/>내가 직접 점심방송 신청곡으로 신청하세요!",
  },
  {
    img: "📮",
    title: "내 사연을 공유할래요",
    desc: "오스틸에서 모두에게 들려줄 나의 사연을<br/>직접 점심방송 사연으로 신청하세요!",
  },
  {
    img: "🎤",
    title: "학교 점심방송, 내손으로",
    desc: "여러분의 적극적인 노래 신청과 사연 신청으로<br/>보다 풍성한 점심방송이 만들어져요!",
  },
];

let currentSlide = 0;
let regStep = 0;

function renderSlide() {
  const slide = slides[currentSlide];
  document.getElementById("slide-area").innerHTML = `
    <div style="font-size:84px; margin-bottom:24px;">${slide.img}</div>
    <div class="modal-title">${slide.title}</div>
    <div style="color:#666;text-align:center;margin-bottom:36px;">${
      slide.desc
    }</div>
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
renderSlide();

setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  renderSlide();
}, 5000);

const loginForm = document.getElementById("login-form");
const registerForm1 = document.getElementById("register-form1");
const registerForm2 = document.getElementById("register-form2");

document.getElementById("to-register").onclick = () => {
  loginForm.style.display = "none";
  registerForm1.style.display = "block";
  registerForm2.style.display = "none";
  regStep = 1;
  currentSlide = 1;
  renderSlide();
};
document.getElementById("to-login1").onclick = () => {
  loginForm.style.display = "block";
  registerForm1.style.display = "none";
  registerForm2.style.display = "none";
  regStep = 0;
  currentSlide = 0;
  renderSlide();
};
document.getElementById("to-login2").onclick = () => {
  registerForm2.style.display = "none";
  registerForm1.style.display = "block";
  regStep = 1;
  currentSlide = 1;
  renderSlide();
};

document.getElementById("register-next1").onclick = () => {
  const username = registerForm1.username.value.trim();
  const nickname = registerForm1.nickname.value.trim();
  if (!username || !nickname) return alert("모든 항목을 입력하세요.");
  apiFetch("/songs").then(() => {
    registerForm1.style.display = "none";
    registerForm2.style.display = "block";
    regStep = 2;
    currentSlide = 2;
    renderSlide();
  });
};
document.getElementById("register-next2").onclick = () => {
  const pw1 = document.getElementById("pw1").value;
  const pw2 = document.getElementById("pw2").value;
  if (pw1.length < 8) return alert("비밀번호는 8자 이상이어야 합니다.");
  if (pw1 !== pw2) return alert("비밀번호가 일치하지 않습니다.");
  apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: registerForm1.username.value,
      password: pw1,
      nickname: registerForm1.nickname.value,
    }),
  }).then((r) => {
    if (r.status === 201) {
      alert("회원가입이 완료되었습니다! 로그인 해주세요.");
      registerForm2.style.display = "none";
      loginForm.style.display = "block";
      regStep = 0;
      currentSlide = 0;
      renderSlide();
    } else {
      alert("회원가입 실패(중복 아이디 등)");
    }
  });
};

loginForm.onsubmit = async (e) => {
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
  localStorage.setItem("nickname", data.nickname);
  window.location.href = "submit.html";
};

document.getElementById("pw2").oninput = () => {
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
};
