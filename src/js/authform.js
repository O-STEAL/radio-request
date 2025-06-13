const authResult = document.getElementById("authResult");

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("nickname", data.nickname);
      window.location.href = "submit.html";
    } else {
      authResult.textContent = "로그인 실패! 아이디/비밀번호를 확인하세요.";
      authResult.style.color = "red";
    }
  } catch (err) {
    authResult.textContent = "서버와 연결할 수 없습니다.";
    authResult.style.color = "red";
  }
});

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("reg_username").value;
    const password = document.getElementById("reg_password").value;
    const nickname = document.getElementById("nickname").value;
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, nickname }),
      });
      if (res.ok) {
        authResult.textContent = "회원가입 성공! 로그인 해주세요.";
        authResult.style.color = "green";
        document.getElementById("registerForm").reset();
      } else {
        const data = await res.json().catch(() => null);
        authResult.textContent =
          data && data.message ? data.message : "회원가입 실패!";
        authResult.style.color = "red";
      }
    } catch (err) {
      authResult.textContent = "서버와 연결할 수 없습니다.";
      authResult.style.color = "red";
    }
  });
