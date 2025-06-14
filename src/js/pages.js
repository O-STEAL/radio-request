import { apiFetch } from "./api.js";
import { AuthForm } from "./AuthForm.js";

// 로그인 함수
async function login(username, password) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("name", data.name);
  return true;
}

// 회원가입 함수
async function register(username, password, name) {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, name }),
  });
  return res.ok;
}

// 신청곡 목록
async function fetchSongList() {
  const res = await apiFetch("/songs");
  if (!res.ok) return [];
  return res.json();
}

// 신청곡 제출
async function submitSong(songLink, story) {
  const token = localStorage.getItem("token");
  const res = await apiFetch("/songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songLink, story, token }),
  });
  return res.ok;
}

// 신청곡 삭제(관리자)
async function deleteSong(id) {
  const token = localStorage.getItem("token");
  return apiFetch(`/songs/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

export function renderLogin(root) {
  root.innerHTML = AuthForm({ type: "login" });
  document.getElementById("auth-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ok = await login(fd.get("username"), fd.get("password"));
    if (!ok) return alert("로그인 실패");
    window.location.hash = "";
  };
}

export function renderRegister(root) {
  root.innerHTML = AuthForm({ type: "register" });
  document.getElementById("auth-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ok = await register(
      fd.get("username"),
      fd.get("password"),
      fd.get("name")
    );
    if (!ok) return alert("회원가입 실패");
    window.location.hash = "";
  };
}

export function renderSongForm(root) {
  root.innerHTML = SongForm({});
  document.getElementById("song-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ok = await submitSong(fd.get("songLink"), fd.get("story"));
    if (!ok) return alert("제출 실패");
    window.location.hash = "";
  };
}

export async function renderSongList(root, admin = false) {
  const list = await fetchSongList();
  root.innerHTML = SongList({ list, admin });
  if (admin) {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.onclick = async () => {
        await deleteSong(btn.dataset.id);
        renderSongList(root, true);
      };
    });
  }
}
