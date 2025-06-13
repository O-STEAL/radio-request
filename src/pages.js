import { AuthForm } from "./components/AuthForm.js";
import { SongForm } from "./components/SongForm.js";
import { SongList } from "./components/SongList.js";
import { login, register } from "./utils/auth.js";
import { submitSong, fetchSongList, deleteSong } from "./utils/api.js";

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
      fd.get("nickname")
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
