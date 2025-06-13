import { apiFetch } from "./api.js";

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const res = await apiFetch("/auth/login", {
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
        alert("로그인 실패! 아이디/비밀번호를 확인하세요.");
      }
    } catch (err) {
      alert("서버와 연결할 수 없습니다.");
    }
  });
